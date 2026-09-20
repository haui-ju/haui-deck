#!/usr/bin/env node
/**
 * Consumer helper (copied to .haui-deck/run-graphify.mjs by deck-graphify-init).
 * Runs graphify CLI against the graph for memory.default (or --block <id>).
 *
 *   node .haui-deck/run-graphify.mjs query "App"
 *   node .haui-deck/run-graphify.mjs explain "App"
 *   node .haui-deck/run-graphify.mjs path "A" "B"
 *   node .haui-deck/run-graphify.mjs update
 *   node .haui-deck/run-graphify.mjs diagnose
 *   node .haui-deck/run-graphify.mjs query --block components "App"
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const configPath = path.join(root, ".haui-deck", "config.json");

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

if (!fs.existsSync(configPath)) {
  die("Ejecuta /deck-init");
}

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  die(`config.json inválido: ${err.message}`);
}

const memory = config.memory;
if (!memory || typeof memory !== "object" || !Array.isArray(memory.blocks) || memory.blocks.length === 0) {
  die("Ejecuta /deck-graphify-init");
}
if (memory.enabled === false) {
  console.log(JSON.stringify({ ok: true, noop: true, message: "memory.enabled=false" }, null, 2));
  process.exit(0);
}

const argv = process.argv.slice(2);
let blockId = null;
const pass = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--block" && argv[i + 1]) {
    blockId = argv[++i];
    continue;
  }
  pass.push(argv[i]);
}

const cmd = pass[0];
const rest = pass.slice(1);
if (!cmd) {
  die("Uso: node .haui-deck/run-graphify.mjs <query|explain|path|update|diagnose> …");
}

const id = blockId || memory.default || memory.blocks[0].id;
const block = memory.blocks.find((b) => b.id === id);
if (!block) {
  die(`No hay bloque id="${id}". Ids: ${memory.blocks.map((b) => b.id).join(", ")}`);
}

const which = spawnSync(process.platform === "win32" ? "where" : "which", ["graphify"], {
  encoding: "utf8",
});
if (which.status !== 0) {
  die("No se encontró `graphify`. uv tool install graphifyy");
}
const bin = which.stdout.trim().split("\n")[0];

let args;
if (cmd === "update") {
  const scope = block.scope === "." ? root : path.join(root, block.scope);
  args = ["update", scope, ...rest];
} else if (cmd === "query" || cmd === "explain" || cmd === "path" || cmd === "diagnose") {
  const graphAbs = path.join(root, block.artifacts.graph);
  if (!fs.existsSync(graphAbs) && cmd !== "update") {
    die(`No existe ${block.artifacts.graph}. Corre: pnpm graphify:update`);
  }
  // diagnose subcommand is "diagnose multigraph"
  if (cmd === "diagnose") {
    args = ["diagnose", "multigraph", ...rest, "--graph", graphAbs];
  } else {
    args = [cmd, ...rest, "--graph", graphAbs];
  }
} else {
  die(`comando no soportado: ${cmd} (query|explain|path|update|diagnose)`);
}

const r = spawnSync(bin, args, { cwd: root, encoding: "utf8", stdio: "inherit" });
process.exit(r.status ?? 1);
