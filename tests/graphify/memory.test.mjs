#!/usr/bin/env node
/**
 * Tests for graphify memory.mjs + ensure-haui-deck memory preserve.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const memoryPath = path.resolve(
  __dirname,
  "../../suit/graphify/deck-graphify-init/scripts/memory.mjs",
);
const ensurePath = path.resolve(
  __dirname,
  "../../suit/design/deck-init/scripts/ensure-haui-deck.mjs",
);
const mem = await import(pathToFileURL(memoryPath).href);
const { ensureHauiDeck } = await import(pathToFileURL(ensurePath).href);

function tmpProject(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "haui-mem-"));
  for (const [name, body] of Object.entries(files)) {
    const abs = path.join(root, name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body, "utf8");
  }
  return root;
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`not ok - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

test("idFromScope / artifacts", () => {
  assert.equal(mem.idFromScope("."), "root");
  assert.equal(mem.idFromScope("src/components"), "components");
  assert.deepEqual(mem.artifactsForScope("."), {
    dir: "graphify-out",
    graph: "graphify-out/graph.json",
    html: "graphify-out/graph.html",
  });
  assert.equal(
    mem.artifactsForScope("src/components").dir,
    "src/components/graphify-out",
  );
});

test("ensure-haui-deck preserva memory", () => {
  const root = tmpProject({ "DESIGN.md": "# d\n" });
  ensureHauiDeck(root);
  const cfgPath = path.join(root, ".haui-deck", "config.json");
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  cfg.memory = {
    enabled: true,
    default: "root",
    blocks: [mem.makeBlock(".", "root")],
  };
  fs.writeFileSync(cfgPath, `${JSON.stringify(cfg, null, 2)}\n`);
  ensureHauiDeck(root);
  const next = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  assert.equal(next.design, "DESIGN.md");
  assert.ok(next.memory);
  assert.equal(next.memory.default, "root");
  assert.equal(next.memory.blocks[0].id, "root");
});

test("refresh/open/status sin memory → mensaje", () => {
  const root = tmpProject({});
  fs.mkdirSync(path.join(root, ".haui-deck"));
  fs.writeFileSync(
    path.join(root, ".haui-deck", "config.json"),
    `${JSON.stringify({ version: 1, design: null, product: null }, null, 2)}\n`,
  );
  for (const cmd of ["refresh", "status", "open", "remove", "clear"]) {
    const r = mem.main([cmd], root);
    assert.equal(r.ok, false);
    assert.match(r.message, /Falta memory/);
  }
});

test("remove plan needsConfirm; --yes borra bloque", () => {
  const root = tmpProject({});
  fs.mkdirSync(path.join(root, ".haui-deck"));
  const block = mem.makeBlock(".", "root");
  const cfg = {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  };
  fs.writeFileSync(
    path.join(root, ".haui-deck", "config.json"),
    `${JSON.stringify(cfg, null, 2)}\n`,
  );
  const art = path.join(root, "graphify-out");
  fs.mkdirSync(art);
  fs.writeFileSync(path.join(art, "graph.json"), "{}\n");

  const plan = mem.main(["remove"], root);
  assert.equal(plan.needsConfirm, true);
  assert.equal(plan.code, 2);
  assert.ok(fs.existsSync(art));

  const done = mem.main(["remove", "--yes"], root);
  assert.equal(done.ok, true);
  assert.equal(done.memory, null);
  assert.equal(fs.existsSync(art), false);
  const disk = JSON.parse(
    fs.readFileSync(path.join(root, ".haui-deck", "config.json"), "utf8"),
  );
  assert.equal(disk.memory, null);
});

test("clear --yes limpia todos", () => {
  const root = tmpProject({});
  fs.mkdirSync(path.join(root, ".haui-deck"));
  const a = mem.makeBlock(".", "root");
  const b = mem.makeBlock("src/x", "x");
  fs.writeFileSync(
    path.join(root, ".haui-deck", "config.json"),
    `${JSON.stringify(
      {
        version: 1,
        design: null,
        product: null,
        memory: { enabled: true, default: "root", blocks: [a, b] },
      },
      null,
      2,
    )}\n`,
  );
  fs.mkdirSync(path.join(root, a.artifacts.dir), { recursive: true });
  fs.mkdirSync(path.join(root, b.artifacts.dir), { recursive: true });

  const plan = mem.main(["clear"], root);
  assert.equal(plan.needsConfirm, true);
  const done = mem.main(["clear", "--yes"], root);
  assert.equal(done.ok, true);
  assert.equal(done.memory, null);
});

test("ensureGitignore append", () => {
  const root = tmpProject({ ".gitignore": "node_modules/\n" });
  const r = mem.ensureGitignore(root);
  assert.equal(r.appended, true);
  const body = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert.match(body, /\*\*\/graphify-out\//);
});

test("init exige deck-init", () => {
  const root = tmpProject({});
  const r = mem.main(["init"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /deck-init/);
});

if (process.exitCode) {
  console.error("\nFAIL");
  process.exit(1);
}
console.log("\nAll graphify tests passed");
