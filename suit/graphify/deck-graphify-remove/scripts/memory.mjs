#!/usr/bin/env node
/**
 * haui-deck graphify memory helper (copied into each deck-graphify-* skill).
 *
 * Usage:
 *   node memory.mjs init [scope]
 *   node memory.mjs refresh [id]
 *   node memory.mjs status [id]
 *   node memory.mjs open [id]
 *   node memory.mjs remove [id] --yes
 *   node memory.mjs clear --yes
 *   node memory.mjs remove [id]          # plan only (exit 2) — agent must confirm then --yes
 *   node memory.mjs clear
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MISSING_MEMORY = `Falta memory en .haui-deck/config.json. Primero inicializa:

  /deck-graphify-init              → grafo en la raíz del proyecto
  /deck-graphify-init src/foo      → grafo solo en esa carpeta

Luego vuelve a correr la skill.`;

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

export function normalizeScope(scope) {
  if (!scope || scope === "." || scope === "./") return ".";
  return scope.replace(/\\/g, "/").replace(/\/+$/, "") || ".";
}

export function idFromScope(scope) {
  const s = normalizeScope(scope);
  if (s === ".") return "root";
  const parts = s.split("/").filter(Boolean);
  return parts[parts.length - 1].replace(/[^a-zA-Z0-9_-]+/g, "-") || "block";
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

export function resolveBlockId(memory, idArg) {
  if (idArg) return idArg;
  return memory?.default ?? "root";
}

export function missingMemoryMessage() {
  return MISSING_MEMORY;
}

export function hasMemory(config) {
  return Boolean(config && Object.prototype.hasOwnProperty.call(config, "memory") && config.memory);
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
  const s = normalizeScope(scope);
  const target = s === "." ? root : path.join(root, s);
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`scope no existe o no es carpeta: ${s}`);
  }
  const r = spawnSync(bin, ["update", target], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(
      `graphify update falló (exit ${r.status}):\n${r.stderr || r.stdout || ""}`.trim(),
    );
  }
  return { stdout: r.stdout, stderr: r.stderr };
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

function rmDirSafe(abs) {
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    return true;
  }
  return false;
}

export function cmdInit(root, scopeArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !config) {
    return {
      ok: false,
      code: 1,
      message: "Falta .haui-deck/config.json. Corre /deck-init primero.",
    };
  }

  const scope = normalizeScope(scopeArg ?? ".");
  ensureGraphifyCli();
  runGraphifyUpdate(root, scope);
  const gi = ensureGitignore(root);

  let memory = config.memory && typeof config.memory === "object" ? structuredClone(config.memory) : null;
  if (!memory) {
    memory = { enabled: true, default: "root", blocks: [] };
  }
  if (!Array.isArray(memory.blocks)) memory.blocks = [];
  if (typeof memory.enabled !== "boolean") memory.enabled = true;

  const preferred = idFromScope(scope);
  const existing = memory.blocks.find((b) => normalizeScope(b.scope) === scope);
  let block;
  if (existing) {
    existing.artifacts = artifactsForScope(scope);
    existing.provider = "graphify";
    block = existing;
  } else {
    const id = ensureUniqueId(memory.blocks, preferred);
    block = makeBlock(scope, id);
    memory.blocks.push(block);
  }
  if (!memory.default || !findBlock(memory, memory.default)) {
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
    configPath: configPath(root),
  };
}

export function cmdRefresh(root, idArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !hasMemory(config)) {
    return { ok: false, code: 1, message: missingMemoryMessage() };
  }
  const id = resolveBlockId(config.memory, idArg);
  const block = findBlock(config.memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${config.memory.blocks.map((b) => b.id).join(", ") || "(ninguno)"}`,
    };
  }
  if (block.provider !== "graphify") {
    return { ok: false, code: 1, message: `provider no soportado en v0: ${block.provider}` };
  }
  runGraphifyUpdate(root, block.scope);
  return { ok: true, code: 0, action: "refresh", block };
}

export function cmdStatus(root, idArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !hasMemory(config)) {
    return { ok: false, code: 1, message: missingMemoryMessage() };
  }
  const cli = whichGraphify();
  const blocks = idArg
    ? [findBlock(config.memory, idArg)].filter(Boolean)
    : config.memory.blocks;
  if (idArg && blocks.length === 0) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${idArg}". Ids: ${config.memory.blocks.map((b) => b.id).join(", ")}`,
    };
  }
  const detail = blocks.map((b) => {
    const graphAbs = path.join(root, b.artifacts.graph);
    const htmlAbs = path.join(root, b.artifacts.html);
    return {
      id: b.id,
      scope: b.scope,
      provider: b.provider,
      graphExists: fs.existsSync(graphAbs),
      htmlExists: fs.existsSync(htmlAbs),
      artifacts: b.artifacts,
    };
  });
  return {
    ok: true,
    code: 0,
    action: "status",
    cli: cli ? "ok" : "missing",
    enabled: config.memory.enabled,
    default: config.memory.default,
    blocks: detail,
  };
}

export function cmdOpen(root, idArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !hasMemory(config)) {
    return { ok: false, code: 1, message: missingMemoryMessage() };
  }
  const id = resolveBlockId(config.memory, idArg);
  const block = findBlock(config.memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${config.memory.blocks.map((b) => b.id).join(", ")}`,
    };
  }
  const htmlAbs = path.join(root, block.artifacts.html);
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
    openError: r.status === 0 ? null : (r.stderr || r.stdout || `exit ${r.status}`),
  };
}

export function planRemove(root, idArg) {
  const { config, missingFile } = readConfig(root);
  if (missingFile || !hasMemory(config)) {
    return { ok: false, code: 1, message: missingMemoryMessage() };
  }
  const id = resolveBlockId(config.memory, idArg);
  const block = findBlock(config.memory, id);
  if (!block) {
    return {
      ok: false,
      code: 1,
      message: `No hay bloque id="${id}". Ids: ${config.memory.blocks.map((b) => b.id).join(", ")}`,
    };
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
  };
}

export function cmdRemove(root, idArg, { yes = false } = {}) {
  const plan = planRemove(root, idArg);
  if (!plan.ok || plan.code === 1) return plan;
  if (!yes) return plan;

  const { config } = readConfig(root);
  const id = plan.block.id;
  const block = findBlock(config.memory, id);
  const absDir = path.join(root, block.artifacts.dir);
  const deleted = rmDirSafe(absDir);
  config.memory.blocks = config.memory.blocks.filter((b) => b.id !== id);
  if (config.memory.blocks.length === 0) {
    config.memory = null;
  } else if (config.memory.default === id) {
    config.memory.default = config.memory.blocks[0].id;
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
  const { config, missingFile } = readConfig(root);
  if (missingFile || !hasMemory(config)) {
    return { ok: false, code: 1, message: missingMemoryMessage() };
  }
  return {
    ok: true,
    code: 2,
    needsConfirm: true,
    action: "clear",
    will: {
      deleteDirs: config.memory.blocks.map((b) => b.artifacts.dir),
      configChange: 'memory → null',
      blockIds: config.memory.blocks.map((b) => b.id),
    },
  };
}

export function cmdClear(root, { yes = false } = {}) {
  const plan = planClear(root);
  if (!plan.ok || plan.code === 1) return plan;
  if (!yes) return plan;

  const { config } = readConfig(root);
  const deleted = [];
  for (const b of config.memory.blocks) {
    if (rmDirSafe(path.join(root, b.artifacts.dir))) deleted.push(b.artifacts.dir);
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
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  try {
    const result = main(process.argv.slice(2));
    if (result.message && !result.ok) {
      console.error(result.message);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(result.code ?? (result.ok ? 0 : 1));
  } catch (err) {
    console.error(String(err?.message ?? err));
    process.exit(1);
  }
}
