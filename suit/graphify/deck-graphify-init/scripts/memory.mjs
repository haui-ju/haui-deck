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

const MISSING_MEMORY = `Ejecuta /deck-graphify-init
(o /deck-graphify-init <carpeta>)`;

const MISSING_DECK = `Ejecuta /deck-init`;

const DISABLED = `memory.enabled=false`;

const GITIGNORE_LINE = "**/graphify-out/";

const ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

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

/** True if absPath is inside root (or equal). */
export function isInsideRoot(root, absPath) {
  const rootAbs = path.resolve(root);
  const target = path.resolve(absPath);
  const rel = path.relative(rootAbs, target);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export function assertInsideRoot(root, absPath, label = "path") {
  if (!isInsideRoot(root, absPath)) {
    throw new Error(`${label} fuera del proyecto: ${absPath}`);
  }
  return path.resolve(absPath);
}

/**
 * Normalize scope relative to project root. Rejects escapes and abs outside root.
 * Absolute paths inside root become relative posix paths.
 */
export function resolveScope(root, scopeArg) {
  const raw = scopeArg == null || scopeArg === "" ? "." : String(scopeArg);
  const trimmed = raw.replace(/\\/g, "/").replace(/\/+$/, "") || ".";

  if (trimmed === "." || trimmed === "./") {
    return { scope: ".", abs: path.resolve(root) };
  }

  // Reject pure parent / empty junk before join
  const parts = trimmed.split("/").filter((p) => p && p !== ".");
  if (parts.some((p) => p === "..")) {
    throw new Error(`scope inválido (contiene ..): ${raw}`);
  }

  let abs;
  if (path.isAbsolute(raw)) {
    abs = path.resolve(raw);
    assertInsideRoot(root, abs, "scope");
  } else {
    abs = path.resolve(root, trimmed);
    assertInsideRoot(root, abs, "scope");
  }

  const rel = path.relative(path.resolve(root), abs);
  const scope =
    rel === "" ? "." : rel.split(path.sep).join("/");
  if (scope.startsWith("..")) {
    throw new Error(`scope fuera del proyecto: ${raw}`);
  }
  return { scope, abs };
}

export function normalizeScope(scope) {
  // Legacy helper for tests / callers — string-only, no root check.
  if (!scope || scope === "." || scope === "./") return ".";
  return String(scope).replace(/\\/g, "/").replace(/\/+$/, "") || ".";
}

export function resolveArtifactRel(root, relPath, label = "artifact") {
  const rel = String(relPath).replace(/\\/g, "/");
  if (!rel || rel.split("/").includes("..")) {
    throw new Error(`${label} inválido: ${relPath}`);
  }
  const abs = path.resolve(root, rel);
  assertInsideRoot(root, abs, label);
  // Store as posix relative from root
  const out = path.relative(path.resolve(root), abs).split(path.sep).join("/");
  if (!out || out.startsWith("..")) {
    throw new Error(`${label} fuera del proyecto: ${relPath}`);
  }
  return { rel: out, abs };
}

export function idFromScope(scope) {
  const s = normalizeScope(scope);
  if (s === ".") return "root";
  const parts = s.split("/").filter(Boolean);
  let base = (parts[parts.length - 1] || "block").replace(/[^a-zA-Z0-9_-]+/g, "-");
  base = base.replace(/^-+|-+$/g, "");
  if (!base || base === "-" || !ID_RE.test(base)) return "block";
  return base;
}

export function artifactsForScope(scope) {
  const s = normalizeScope(scope);
  const dir = s === "." ? "graphify-out" : path.posix.join(s, "graphify-out");
  return {
    dir,
    graph: path.posix.join(dir, "graph.json"),
    html: path.posix.join(dir, "graph.html"),
  };
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
 * Load config + validated memory. Handles missing deck / missing memory / disabled / bad shape.
 */
export function requireMemoryConfig(root) {
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
    // Empty blocks → treat as no memory (UX: ask init)
    if (String(err.message).includes("blocks[] vacío")) {
      return { ok: false, code: 1, message: MISSING_MEMORY };
    }
    return { ok: false, code: 1, message: err.message };
  }

  if (memory.enabled === false) {
    return {
      ok: true,
      code: 0,
      noop: true,
      message: DISABLED,
      config: { ...config, memory },
      memory,
    };
  }

  // Validate artifact paths stay inside root
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

/** Copy consumer helper into .haui-deck/run-graphify.mjs */
export function ensureConsumerRunner(root) {
  const src = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "consumer-run-graphify.mjs",
  );
  const destDir = path.join(root, ".haui-deck");
  const dest = path.join(destDir, "run-graphify.mjs");
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  return { path: ".haui-deck/run-graphify.mjs" };
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

function rmDirSafe(abs) {
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    return true;
  }
  return false;
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
  const gate = requireMemoryConfig(root);
  if (!gate.ok) return gate;
  if (gate.noop) return gate;
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
  try {
    resolveArtifactRel(root, block.artifacts.dir, "dir");
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }
  return {
    ok: true,
    code: 2,
    needsConfirm: true,
    action: "remove",
    will: {
      removeBlockId: block.id,
      deleteDir: block.artifacts.dir,
      configChange: "quitar bloque de memory.blocks (memory→null si queda vacío)",
    },
    block,
    warning,
  };
}

export function cmdRemove(root, idArg, { yes = false } = {}) {
  const plan = planRemove(root, idArg);
  if (!plan.ok || plan.noop) return plan;
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
  let absDir;
  try {
    absDir = resolveArtifactRel(root, block.artifacts.dir, "dir").abs;
  } catch (err) {
    return { ok: false, code: 1, message: err.message };
  }
  const deleted = rmDirSafe(absDir);
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
    deletedDir: deleted ? block.artifacts.dir : null,
    memory: config.memory,
  };
}

export function planClear(root) {
  const gate = requireMemoryConfig(root);
  if (!gate.ok) return gate;
  if (gate.noop) return gate;
  const { memory } = gate;
  for (const b of memory.blocks) {
    const bad = requireGraphifyProvider(b);
    if (bad) return bad;
    try {
      resolveArtifactRel(root, b.artifacts.dir, "dir");
    } catch (err) {
      return { ok: false, code: 1, message: err.message };
    }
  }
  return {
    ok: true,
    code: 2,
    needsConfirm: true,
    action: "clear",
    will: {
      deleteDirs: memory.blocks.map((b) => b.artifacts.dir),
      configChange: "memory → null",
      blockIds: memory.blocks.map((b) => b.id),
    },
  };
}

export function cmdClear(root, { yes = false } = {}) {
  const plan = planClear(root);
  if (!plan.ok || plan.noop) return plan;
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
  for (const b of memory.blocks) {
    const abs = resolveArtifactRel(root, b.artifacts.dir, "dir").abs;
    if (rmDirSafe(abs)) deleted.push(b.artifacts.dir);
  }
  config.memory = null;
  writeConfig(root, config);
  return { ok: true, code: 0, action: "clear", deletedDirs: deleted, memory: null };
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
