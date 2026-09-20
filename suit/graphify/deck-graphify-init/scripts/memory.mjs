#!/usr/bin/env node
/**
 * haui-deck graphify memory helper (sole copy: deck-graphify-init/scripts/).
 * Other skills delegate via scripts/run.mjs.
 *
 * Usage:
 *   node memory.mjs init [scope]
 *   node memory.mjs refresh [id]
 *   node memory.mjs status [id]
 *   node memory.mjs open [id]
 *   node memory.mjs remove [id] [--yes]
 *   node memory.mjs clear [--yes]
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import {
  ID_RE,
  isInsideRoot,
  assertInsideRoot,
  normalizeScope,
  resolveScope,
  resolveArtifactRel,
  resolveArtifactRelForDelete,
  inspectArtifactDelete,
  safeDeleteArtifactDir,
  idFromScope,
  artifactsForScope,
} from "./paths.mjs";

export {
  ID_RE,
  isInsideRoot,
  assertInsideRoot,
  normalizeScope,
  resolveScope,
  resolveArtifactRel,
  resolveArtifactRelForDelete,
  inspectArtifactDelete,
  safeDeleteArtifactDir,
  idFromScope,
  artifactsForScope,
};

const MISSING_MEMORY = `Ejecuta /deck-graphify-init
(o /deck-graphify-init <carpeta>)`;

const MISSING_DECK = `Ejecuta /deck-init`;

const DISABLED = `memory.enabled=false`;

const GITIGNORE_LINE = "**/graphify-out/";


export function configPath(root) {
  return path.join(root, ".haui-deck", "config.json");
}

export function readConfig(root) {
  const p = configPath(root);
  if (!fs.existsSync(p)) return { path: p, config: null, missingFile: true };
  try {
    return {
      path: p,
      config: JSON.parse(fs.readFileSync(p, "utf8")),
      missingFile: false,
    };
  } catch (err) {
    throw new Error(`config.json inválido: ${err.message}`);
  }
}

export function writeConfig(root, config) {
  const dir = path.join(root, ".haui-deck");
  fs.mkdirSync(dir, { recursive: true });
  const p = configPath(root);
  fs.writeFileSync(p, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return p;
}

export function makeBlock(scope, id) {
  const s = normalizeScope(scope);
  return {
    id: id ?? idFromScope(s),
    provider: "graphify",
    scope: s,
    artifacts: artifactsForScope(s),
  };
}

export function ensureUniqueId(blocks, preferred) {
  const used = new Set(blocks.map((b) => b.id));
  if (!used.has(preferred)) return preferred;
  let i = 2;
  while (used.has(`${preferred}-${i}`)) i += 1;
  return `${preferred}-${i}`;
}

export function findBlock(memory, id) {
  if (!memory?.blocks) return null;
  return memory.blocks.find((b) => b.id === id) ?? null;
}

/**
 * @returns {{ id: string, warning?: string }}
 */
export function resolveBlockId(memory, idArg) {
  if (idArg) return { id: idArg };
  const preferred = memory?.default ?? "root";
  if (findBlock(memory, preferred)) return { id: preferred };
  const first = memory?.blocks?.[0]?.id;
  if (first) {
    return {
      id: first,
      warning: `default "${preferred}" no existe; usando "${first}"`,
    };
  }
  return { id: preferred };
}

export function missingMemoryMessage() {
  return MISSING_MEMORY;
}

export function hasMemory(config) {
  if (!config || !Object.prototype.hasOwnProperty.call(config, "memory")) return false;
  const m = config.memory;
  if (!m || typeof m !== "object") return false;
  if (!Array.isArray(m.blocks) || m.blocks.length === 0) return false;
  return true;
}

/**
 * Validate memory shape. Throws Error with actionable message (never TypeError).
 * @returns normalized memory object (clone)
 */
export function assertMemoryShape(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("config memory inválida: se esperaba un objeto");
  }
  if (!Array.isArray(raw.blocks)) {
    throw new Error("config memory inválida: falta blocks[]");
  }
  if (raw.blocks.length === 0) {
    throw new Error("config memory inválida: blocks[] vacío");
  }

  const ids = new Set();
  const blocks = [];
  for (let i = 0; i < raw.blocks.length; i++) {
    const b = raw.blocks[i];
    if (!b || typeof b !== "object") {
      throw new Error(`config memory inválida: blocks[${i}] no es objeto`);
    }
    if (typeof b.id !== "string" || !b.id || !ID_RE.test(b.id)) {
      throw new Error(`config memory inválida: blocks[${i}].id inválido`);
    }
    if (ids.has(b.id)) {
      throw new Error(`config memory inválida: id duplicado "${b.id}"`);
    }
    ids.add(b.id);
    if (typeof b.scope !== "string") {
      throw new Error(`config memory inválida: blocks[${i}].scope requerido`);
    }
    if (!b.artifacts || typeof b.artifacts !== "object") {
      throw new Error(`config memory inválida: blocks[${i}].artifacts requerido`);
    }
    for (const k of ["dir", "graph", "html"]) {
      if (typeof b.artifacts[k] !== "string" || !b.artifacts[k]) {
        throw new Error(`config memory inválida: blocks[${i}].artifacts.${k} requerido`);
      }
    }
    blocks.push({
      id: b.id,
      provider: typeof b.provider === "string" ? b.provider : "graphify",
      scope: b.scope,
      artifacts: {
        dir: b.artifacts.dir,
        graph: b.artifacts.graph,
        html: b.artifacts.html,
      },
    });
  }

  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : true,
    default: typeof raw.default === "string" && raw.default ? raw.default : blocks[0].id,
    blocks,
  };
}

/**
 * Load config + validated memory.
 * @param {{ allowWhenDisabled?: boolean, skipPathCheck?: boolean }} [opts]
 *   allowWhenDisabled: status/remove/clear may run when enabled=false (no noop).
 *   skipPathCheck: remove/clear may clean config even if artifact paths escape.
 */
export function requireMemoryConfig(
  root,
  { allowWhenDisabled = false, skipPathCheck = false } = {},
) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !config) {
    return { ok: false, code: 1, message: MISSING_DECK };
  }
  if (
    !Object.prototype.hasOwnProperty.call(config, "memory") ||
    config.memory == null ||
    config.memory === false ||
    config.memory === ""
  ) {
    return { ok: false, code: 1, message: MISSING_MEMORY };
  }

  let memory;
  try {
    memory = assertMemoryShape(config.memory);
  } catch (err) {
    if (String(err.message).includes("blocks[] vacío")) {
      return { ok: false, code: 1, message: MISSING_MEMORY };
    }
    return { ok: false, code: 1, message: err.message };
  }

  // Validate artifact paths stay inside root (unless cleanup of poisoned config)
  if (!skipPathCheck) {
    try {
      for (const b of memory.blocks) {
        resolveArtifactRel(root, b.artifacts.dir, `block ${b.id} dir`);
        resolveArtifactRel(root, b.artifacts.graph, `block ${b.id} graph`);
        resolveArtifactRel(root, b.artifacts.html, `block ${b.id} html`);
        resolveScope(root, b.scope);
      }
    } catch (err) {
      return { ok: false, code: 1, message: err.message };
    }
  }

  if (memory.enabled === false && !allowWhenDisabled) {
    return {
      ok: true,
      code: 0,
      noop: true,
      message: DISABLED,
      config: { ...config, memory },
      memory,
    };
  }

  return {
    ok: true,
    code: 0,
    config: { ...config, memory },
    memory,
  };
}

function whichGraphify() {
  const cmd = process.platform === "win32" ? "where" : "which";
  const r = spawnSync(cmd, ["graphify"], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split("\n")[0];
  return null;
}

export function ensureGraphifyCli() {
  let bin = whichGraphify();
  if (bin) return { bin, installed: false };

  const attempts = [
    ["uv", ["tool", "install", "graphifyy"]],
    ["pipx", ["install", "graphifyy"]],
  ];
  for (const [exe, args] of attempts) {
    const check = spawnSync(process.platform === "win32" ? "where" : "which", [exe], {
      encoding: "utf8",
    });
    if (check.status !== 0) continue;
    const install = spawnSync(exe, args, { encoding: "utf8", stdio: "pipe" });
    if (install.status === 0) {
      bin = whichGraphify();
      if (bin) return { bin, installed: true, via: `${exe} ${args.join(" ")}` };
    }
  }
  throw new Error(
    "No se encontró `graphify`. Instálalo y reintenta:\n  uv tool install graphifyy\n  # o: pipx install graphifyy",
  );
}

export function runGraphifyUpdate(root, scope) {
  const { bin } = ensureGraphifyCli();
  const { abs, scope: s } = resolveScope(root, scope);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    throw new Error(`scope no existe o no es carpeta: ${s}`);
  }
  const r = spawnSync(bin, ["update", abs], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(
      `graphify update falló (exit ${r.status}):\n${r.stderr || r.stdout || ""}`.trim(),
    );
  }
  return { stdout: r.stdout, stderr: r.stderr, scope: s };
}

export function ensureGitignore(root) {
  const gi = path.join(root, ".gitignore");
  if (!fs.existsSync(gi)) {
    fs.writeFileSync(gi, `${GITIGNORE_LINE}\n`, "utf8");
    return { created: true, appended: false };
  }
  const body = fs.readFileSync(gi, "utf8");
  if (body.split(/\r?\n/).some((l) => l.trim() === GITIGNORE_LINE || l.trim() === "graphify-out/")) {
    return { created: false, appended: false };
  }
  const next = body.endsWith("\n") ? `${body}${GITIGNORE_LINE}\n` : `${body}\n${GITIGNORE_LINE}\n`;
  fs.writeFileSync(gi, next, "utf8");
  return { created: false, appended: true };
}

const PACKAGE_SCRIPTS = {
  "graphify:query": "node .haui-deck/run-graphify.mjs query",
  "graphify:explain": "node .haui-deck/run-graphify.mjs explain",
  "graphify:path": "node .haui-deck/run-graphify.mjs path",
  "graphify:update": "node .haui-deck/run-graphify.mjs update",
  "graphify:diagnose": "node .haui-deck/run-graphify.mjs diagnose",
};

/** Copy consumer helper + paths into .haui-deck/ */
export function ensureConsumerRunner(root) {
  const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
  const destDir = path.join(root, ".haui-deck");
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(
    path.join(scriptsDir, "paths.mjs"),
    path.join(destDir, "paths.mjs"),
  );
  fs.copyFileSync(
    path.join(scriptsDir, "consumer-run-graphify.mjs"),
    path.join(destDir, "run-graphify.mjs"),
  );
  return {
    path: ".haui-deck/run-graphify.mjs",
    paths: ".haui-deck/paths.mjs",
  };
}

/**
 * Ensure package.json exists and has graphify:* scripts (merge; do not overwrite existing keys).
 */
export function ensurePackageScripts(root) {
  const pkgPath = path.join(root, "package.json");
  let pkg;
  let created = false;
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    } catch (err) {
      throw new Error(`package.json inválido: ${err.message}`);
    }
  } else {
    created = true;
    pkg = {
      name: path.basename(path.resolve(root)) || "project",
      private: true,
      scripts: {},
    };
  }
  if (!pkg.scripts || typeof pkg.scripts !== "object") pkg.scripts = {};
  const added = [];
  for (const [key, value] of Object.entries(PACKAGE_SCRIPTS)) {
    if (!pkg.scripts[key]) {
      pkg.scripts[key] = value;
      added.push(key);
    }
  }
  if (created || added.length > 0) {
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  }
  return { created, added, scripts: PACKAGE_SCRIPTS };
}

function mergeWarnings(...parts) {
  const list = parts.flatMap((p) => (p ? [p] : []));
  return list.length ? list.join("; ") : undefined;
}

function requireGraphifyProvider(block) {
  if (block.provider !== "graphify") {
    return {
      ok: false,
      code: 1,
      message: `provider no soportado en v0: ${block.provider}`,
    };
  }
  return null;
}

export function cmdInit(root, scopeArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !config) {
    return { ok: false, code: 1, message: MISSING_DECK };
  }

  // If memory exists and enabled=false → no-op
  if (
    config.memory &&
    typeof config.memory === "object" &&
    config.memory.enabled === false
  ) {
    return { ok: true, code: 0, noop: true, message: DISABLED, action: "init" };
  }

  // If memory already present (enabled), validate shape + paths before indexing
  if (config.memory && typeof config.memory === "object") {
    try {
      const existing = assertMemoryShape(config.memory);
      for (const b of existing.blocks) {
        resolveArtifactRel(root, b.artifacts.dir, `block ${b.id} dir`);
        resolveArtifactRel(root, b.artifacts.graph, `block ${b.id} graph`);
        resolveArtifactRel(root, b.artifacts.html, `block ${b.id} html`);
        resolveScope(root, b.scope);
      }
    } catch (err) {
      return { ok: false, code: 1, message: err.message };
    }
  }

  let resolved;
  try {
    resolved = resolveScope(root, scopeArg ?? ".");
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }

  const { scope } = resolved;

  try {
    ensureGraphifyCli();
    runGraphifyUpdate(root, scope);
  } catch (err) {
    return { ok: false, code: 1, message: String(err.message ?? err) };
  }

  const gi = ensureGitignore(root);
  let pkgScripts;
  let runner;
  try {
    runner = ensureConsumerRunner(root);
    pkgScripts = ensurePackageScripts(root);
  } catch (err) {
    return { ok: false, code: 1, message: String(err.message ?? err) };
  }

  let memory =
    config.memory && typeof config.memory === "object" && !Array.isArray(config.memory)
      ? structuredClone(config.memory)
      : null;

  if (!memory || !Array.isArray(memory.blocks)) {
    memory = { enabled: true, default: "root", blocks: [] };
  }
  if (typeof memory.enabled !== "boolean") memory.enabled = true;

  const preferred = idFromScope(scope);
  const existing = memory.blocks.find((b) => normalizeScope(b.scope) === scope);
  let block;
  if (existing) {
    existing.artifacts = artifactsForScope(scope);
    existing.provider = "graphify";
    existing.scope = scope;
    block = existing;
  } else {
    const id = ensureUniqueId(memory.blocks, preferred);
    block = makeBlock(scope, id);
    memory.blocks.push(block);
  }
  if (!memory.default || !memory.blocks.some((b) => b.id === memory.default)) {
    memory.default = memory.blocks[0]?.id ?? "root";
  }

  config.memory = memory;
  writeConfig(root, config);

  return {
    ok: true,
    code: 0,
    action: "init",
    block,
    memory,
    gitignore: gi,
    runner,
    packageScripts: pkgScripts,
    configPath: configPath(root),
  };
}

export function cmdRefresh(root, idArg) {
  const gate = requireMemoryConfig(root);
  if (!gate.ok) return gate;
  if (gate.noop) return gate;
  const { memory } = gate;
  const { id, warning } = resolveBlockId(memory, idArg);
  const block = findBlock(memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${memory.blocks.map((b) => b.id).join(", ") || "(ninguno)"}`,
    };
  }
  const bad = requireGraphifyProvider(block);
  if (bad) return bad;
  try {
    runGraphifyUpdate(root, block.scope);
  } catch (err) {
    return { ok: false, code: 1, message: String(err.message ?? err) };
  }
  return { ok: true, code: 0, action: "refresh", block, warning };
}

export function cmdStatus(root, idArg) {
  const gate = requireMemoryConfig(root, { allowWhenDisabled: true });
  if (!gate.ok) return gate;
  const { memory } = gate;
  const cli = whichGraphify();
  const blocks = idArg ? [findBlock(memory, idArg)].filter(Boolean) : memory.blocks;
  if (idArg && blocks.length === 0) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${idArg}". Ids: ${memory.blocks.map((b) => b.id).join(", ")}`,
    };
  }
  const detail = blocks.map((b) => {
    let graphExists = false;
    let htmlExists = false;
    try {
      graphExists = fs.existsSync(resolveArtifactRel(root, b.artifacts.graph).abs);
      htmlExists = fs.existsSync(resolveArtifactRel(root, b.artifacts.html).abs);
    } catch {
      /* path invalid already gated */
    }
    return {
      id: b.id,
      scope: b.scope,
      provider: b.provider,
      graphExists,
      htmlExists,
      artifacts: b.artifacts,
    };
  });
  return {
    ok: true,
    code: 0,
    action: "status",
    cli: cli ? "ok" : "missing",
    enabled: memory.enabled,
    default: memory.default,
    blocks: detail,
  };
}

export function cmdOpen(root, idArg) {
  const gate = requireMemoryConfig(root);
  if (!gate.ok) return gate;
  if (gate.noop) return gate;
  const { memory } = gate;
  const { id, warning } = resolveBlockId(memory, idArg);
  const block = findBlock(memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${memory.blocks.map((b) => b.id).join(", ")}`,
    };
  }
  const bad = requireGraphifyProvider(block);
  if (bad) return bad;

  let htmlAbs;
  try {
    htmlAbs = resolveArtifactRel(root, block.artifacts.html, "html").abs;
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }
  if (!fs.existsSync(htmlAbs)) {
    return {
      ok: false,
      code: 1,
      message: `No existe HTML: ${block.artifacts.html}. Corre /deck-graphify-refresh ${id}`,
    };
  }

  let opener = null;
  if (process.platform === "darwin") opener = ["open", [htmlAbs]];
  else if (process.platform === "win32") opener = ["cmd", ["/c", "start", "", htmlAbs]];
  else opener = ["xdg-open", [htmlAbs]];

  const r = spawnSync(opener[0], opener[1], { encoding: "utf8" });
  return {
    ok: true,
    code: 0,
    action: "open",
    block,
    html: block.artifacts.html,
    htmlAbs,
    opened: r.status === 0,
    openError: r.status === 0 ? null : r.stderr || r.stdout || `exit ${r.status}`,
    warning,
  };
}

export function planRemove(root, idArg) {
  const gate = requireMemoryConfig(root, {
    allowWhenDisabled: true,
    skipPathCheck: true,
  });
  if (!gate.ok) return gate;
  const { memory } = gate;
  const { id, warning } = resolveBlockId(memory, idArg);
  const block = findBlock(memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${memory.blocks.map((b) => b.id).join(", ")}`,
    };
  }
  const bad = requireGraphifyProvider(block);
  if (bad) return bad;
  const inspect = inspectArtifactDelete(root, block.artifacts.dir, "dir");
  return {
    ok: true,
    code: 2,
    needsConfirm: true,
    action: "remove",
    will: {
      removeBlockId: block.id,
      deleteDir: block.artifacts.dir,
      deleteMode: inspect.mode,
      configChange: "quitar bloque de memory.blocks (memory→null si queda vacío)",
    },
    block,
    warning: mergeWarnings(warning, inspect.warning),
  };
}

export function cmdRemove(root, idArg, { yes = false } = {}) {
  const plan = planRemove(root, idArg);
  if (!plan.ok) return plan;
  if (plan.code === 1) return plan;
  if (!yes) return plan;

  const { config } = readConfig(root);
  let memory;
  try {
    memory = assertMemoryShape(config.memory);
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }
  const id = plan.block.id;
  const block = findBlock(memory, id);
  const del = safeDeleteArtifactDir(root, block.artifacts.dir, "dir");
  memory.blocks = memory.blocks.filter((b) => b.id !== id);
  if (memory.blocks.length === 0) {
    config.memory = null;
  } else {
    if (memory.default === id) memory.default = memory.blocks[0].id;
    config.memory = memory;
  }
  writeConfig(root, config);
  return {
    ok: true,
    code: 0,
    action: "remove",
    removedId: id,
    deletedDir: del.deleted ? block.artifacts.dir : null,
    deleteMode: del.mode,
    memory: config.memory,
    warning: del.warning,
  };
}

export function planClear(root) {
  const gate = requireMemoryConfig(root, {
    allowWhenDisabled: true,
    skipPathCheck: true,
  });
  if (!gate.ok) return gate;
  const { memory } = gate;
  const modes = [];
  const warnings = [];
  for (const b of memory.blocks) {
    const bad = requireGraphifyProvider(b);
    if (bad) return bad;
    const inspect = inspectArtifactDelete(root, b.artifacts.dir, "dir");
    modes.push({ id: b.id, dir: b.artifacts.dir, mode: inspect.mode });
    if (inspect.warning) warnings.push(`${b.id}: ${inspect.warning}`);
  }
  return {
    ok: true,
    code: 2,
    needsConfirm: true,
    action: "clear",
    will: {
      deleteDirs: memory.blocks.map((b) => b.artifacts.dir),
      deleteModes: modes,
      configChange: "memory → null",
      blockIds: memory.blocks.map((b) => b.id),
    },
    warning: warnings.length ? warnings.join("; ") : undefined,
  };
}

export function cmdClear(root, { yes = false } = {}) {
  const plan = planClear(root);
  if (!plan.ok) return plan;
  if (plan.code === 1) return plan;
  if (!yes) return plan;

  const { config } = readConfig(root);
  let memory;
  try {
    memory = assertMemoryShape(config.memory);
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }
  const deleted = [];
  const warnings = [];
  for (const b of memory.blocks) {
    const del = safeDeleteArtifactDir(root, b.artifacts.dir, "dir");
    if (del.deleted) deleted.push(b.artifacts.dir);
    if (del.warning) warnings.push(`${b.id}: ${del.warning}`);
  }
  config.memory = null;
  writeConfig(root, config);
  return {
    ok: true,
    code: 0,
    action: "clear",
    deletedDirs: deleted,
    memory: null,
    warning: warnings.length ? warnings.join("; ") : undefined,
  };
}

export function main(argv, root = process.cwd()) {
  const args = [...argv];
  const yes = args.includes("--yes");
  const filtered = args.filter((a) => a !== "--yes");
  const cmd = filtered[0];
  const rest = filtered.slice(1);

  if (!cmd) {
    return {
      ok: false,
      code: 1,
      message: "Uso: memory.mjs <init|refresh|status|open|remove|clear> …",
    };
  }

  try {
    switch (cmd) {
      case "init":
        return cmdInit(root, rest[0]);
      case "refresh":
        return cmdRefresh(root, rest[0]);
      case "status":
        return cmdStatus(root, rest[0]);
      case "open":
        return cmdOpen(root, rest[0]);
      case "remove":
        return cmdRemove(root, rest[0], { yes });
      case "clear":
        return cmdClear(root, { yes });
      default:
        return { ok: false, code: 1, message: `comando desconocido: ${cmd}` };
    }
  } catch (err) {
    return { ok: false, code: 1, message: String(err?.message ?? err) };
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const result = main(process.argv.slice(2));
  if (result.noop) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  if (result.message && !result.ok) {
    console.error(result.message);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(result.code ?? (result.ok ? 0 : 1));
}
