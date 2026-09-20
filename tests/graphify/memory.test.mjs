#!/usr/bin/env node
/**
 * Tests for graphify memory.mjs + ensure-haui-deck memory preserve.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
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

function writeCfg(root, cfg) {
  fs.mkdirSync(path.join(root, ".haui-deck"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".haui-deck", "config.json"),
    `${JSON.stringify(cfg, null, 2)}\n`,
  );
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
  assert.equal(mem.idFromScope(".."), "block");
  assert.deepEqual(mem.artifactsForScope("."), {
    dir: "graphify-out",
    graph: "graphify-out/graph.json",
    html: "graphify-out/graph.html",
  });
});

test("assertInsideRoot / resolveScope rechaza ..", () => {
  const root = tmpProject({});
  assert.throws(() => mem.resolveScope(root, ".."), /inválido|fuera/);
  assert.throws(() => mem.resolveScope(root, "../x"), /inválido|fuera/);
  const ok = mem.resolveScope(root, ".");
  assert.equal(ok.scope, ".");
});

test("resolveArtifactRel rechaza escape", () => {
  const root = tmpProject({});
  assert.throws(() => mem.resolveArtifactRel(root, "../OUTSIDE"), /fuera|inválido/);
  assert.throws(() => mem.resolveArtifactRel(root, "foo/../../etc"), /fuera|inválido/);
  const r = mem.resolveArtifactRel(root, "graphify-out");
  assert.equal(r.rel, "graphify-out");
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
});

test("refresh/open/status sin memory → graphify-init", () => {
  const root = tmpProject({});
  writeCfg(root, { version: 1, design: null, product: null });
  for (const cmd of ["refresh", "status", "open", "remove", "clear"]) {
    const r = mem.main([cmd], root);
    assert.equal(r.ok, false);
    assert.match(r.message, /deck-graphify-init/);
  }
});

test("refresh sin config.json → deck-init", () => {
  const root = tmpProject({});
  for (const cmd of ["refresh", "status", "open", "remove", "clear"]) {
    const r = mem.main([cmd], root);
    assert.equal(r.ok, false);
    assert.match(r.message, /\/deck-init/);
  }
});

test("memory {} / sin artifacts → mensaje no TypeError", () => {
  const root = tmpProject({});
  writeCfg(root, { version: 1, design: null, product: null, memory: {} });
  const r = mem.main(["status"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /inválida|blocks/);

  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: {
      enabled: true,
      default: "root",
      blocks: [{ id: "root", provider: "graphify", scope: "." }],
    },
  });
  const r2 = mem.main(["status"], root);
  assert.equal(r2.ok, false);
  assert.match(r2.message, /artifacts/);
});

test("ids duplicados → error", () => {
  const root = tmpProject({});
  const b = mem.makeBlock(".", "root");
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [b, { ...b }] },
  });
  const r = mem.main(["status"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /duplicado/);
});

test("enabled false → status/remove OK; init/refresh noop", () => {
  const root = tmpProject({});
  const block = mem.makeBlock(".", "root");
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: false, default: "root", blocks: [block] },
  });
  const art = path.join(root, "graphify-out");
  fs.mkdirSync(art);
  fs.writeFileSync(path.join(art, "x"), "1");

  const st = mem.main(["status"], root);
  assert.equal(st.ok, true);
  assert.equal(st.noop, undefined);
  assert.equal(st.enabled, false);

  for (const args of [["refresh"], ["init"], ["open"]]) {
    const r = mem.main(args, root);
    assert.equal(r.ok, true);
    assert.equal(r.noop, true);
  }
  assert.ok(fs.existsSync(art));

  const rem = mem.main(["remove", "--yes"], root);
  assert.equal(rem.ok, true);
  assert.equal(rem.memory, null);
  assert.equal(fs.existsSync(art), false);
});

test("ensureConsumerRunner copia paths + run-graphify; runner rechaza escape", () => {
  const root = tmpProject({});
  const block = {
    id: "root",
    provider: "graphify",
    scope: ".",
    artifacts: {
      dir: "../OUTSIDE",
      graph: "../OUTSIDE/g.json",
      html: "../OUTSIDE/g.html",
    },
  };
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  });
  mem.ensureConsumerRunner(root);
  assert.ok(fs.existsSync(path.join(root, ".haui-deck", "paths.mjs")));
  assert.ok(fs.existsSync(path.join(root, ".haui-deck", "run-graphify.mjs")));

  const r = spawnSync(
    process.execPath,
    [path.join(root, ".haui-deck", "run-graphify.mjs"), "query", "x"],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(r.status, 0);
  assert.match(String(r.stderr || r.stdout), /inválido|fuera/);
});

test("default fantasma → usa primer bloque", () => {
  const root = tmpProject({});
  const a = mem.makeBlock(".", "root");
  const b = mem.makeBlock("src/x", "x");
  fs.mkdirSync(path.join(root, "src/x"), { recursive: true });
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "ghost", blocks: [a, b] },
  });
  const resolved = mem.resolveBlockId(
    { enabled: true, default: "ghost", blocks: [a, b] },
    null,
  );
  assert.equal(resolved.id, "root");
  assert.match(resolved.warning, /ghost/);
});

test("remove artifacts.dir escapado → limpia config; hermano intacto", () => {
  const root = tmpProject({});
  const block = {
    id: "root",
    provider: "graphify",
    scope: ".",
    artifacts: {
      dir: "../OUTSIDE",
      graph: "../OUTSIDE/g.json",
      html: "../OUTSIDE/g.html",
    },
  };
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  });
  const outside = path.join(path.dirname(root), "OUTSIDE");
  fs.mkdirSync(outside, { recursive: true });
  fs.writeFileSync(path.join(outside, "keep"), "1");

  const r = mem.main(["remove", "--yes"], root);
  assert.equal(r.ok, true);
  assert.equal(r.memory, null);
  assert.equal(r.deleteMode, "skip");
  assert.match(r.warning || "", /config|FS|inválido|fuera/);
  assert.ok(fs.existsSync(path.join(outside, "keep")));
  fs.rmSync(outside, { recursive: true, force: true });
});

test("provider other → remove rechaza", () => {
  const root = tmpProject({});
  const block = mem.makeBlock(".", "root");
  block.provider = "other";
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  });
  const r = mem.main(["remove", "--yes"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /provider/);
});

test("remove plan needsConfirm; --yes borra bloque", () => {
  const root = tmpProject({});
  const block = mem.makeBlock(".", "root");
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  });
  const art = path.join(root, "graphify-out");
  fs.mkdirSync(art);
  fs.writeFileSync(path.join(art, "graph.json"), "{}\n");

  const plan = mem.main(["remove"], root);
  assert.equal(plan.needsConfirm, true);
  assert.equal(plan.code, 2);

  const done = mem.main(["remove", "--yes"], root);
  assert.equal(done.ok, true);
  assert.equal(done.memory, null);
  assert.equal(fs.existsSync(art), false);
});

test("clear --yes limpia todos", () => {
  const root = tmpProject({});
  const a = mem.makeBlock(".", "root");
  const b = mem.makeBlock("src/x", "x");
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [a, b] },
  });
  fs.mkdirSync(path.join(root, a.artifacts.dir), { recursive: true });
  fs.mkdirSync(path.join(root, b.artifacts.dir), { recursive: true });

  const done = mem.main(["clear", "--yes"], root);
  assert.equal(done.ok, true);
  assert.equal(done.memory, null);
});

test("ensurePackageScripts crea package.json y scripts", () => {
  const root = tmpProject({});
  const r = mem.ensurePackageScripts(root);
  assert.equal(r.created, true);
  assert.ok(r.added.includes("graphify:query"));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts["graphify:query"], "node .haui-deck/run-graphify.mjs query");
  assert.equal(pkg.scripts["graphify:explain"], "node .haui-deck/run-graphify.mjs explain");
  pkg.scripts["graphify:query"] = "custom";
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  const r2 = mem.ensurePackageScripts(root);
  assert.equal(r2.created, false);
  const pkg2 = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg2.scripts["graphify:query"], "custom");
});

test("init exige deck-init", () => {
  const root = tmpProject({});
  const r = mem.main(["init"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /deck-init/);
});

test("init scope .. rechazado", () => {
  const root = tmpProject({});
  writeCfg(root, { version: 1, design: null, product: null });
  const r = mem.main(["init", ".."], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /inválido|fuera/);
});

test("init con memory malformada (sin artifacts) → error, no escribe", () => {
  const root = tmpProject({});
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: {
      enabled: true,
      default: "root",
      blocks: [{ id: "root", provider: "graphify", scope: "." }],
    },
  });
  const before = fs.readFileSync(path.join(root, ".haui-deck", "config.json"), "utf8");
  const r = mem.main(["init"], root);
  assert.equal(r.ok, false);
  assert.match(r.message, /artifacts|inválida/);
  const after = fs.readFileSync(path.join(root, ".haui-deck", "config.json"), "utf8");
  assert.equal(after, before);
  assert.equal(fs.existsSync(path.join(root, "graphify-out")), false);
});

test("remove symlink escape → unlink link; target intacto; config limpia", () => {
  const root = tmpProject({});
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "haui-escape-"));
  fs.writeFileSync(path.join(outside, "secret"), "keep-me");
  const link = path.join(root, "graphify-out");
  fs.symlinkSync(outside, link);

  const block = mem.makeBlock(".", "root");
  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [block] },
  });

  const r = mem.main(["remove", "--yes"], root);
  assert.equal(r.ok, true);
  assert.equal(r.memory, null);
  assert.equal(r.deleteMode, "unlink");
  assert.ok(fs.existsSync(path.join(outside, "secret")));
  assert.equal(fs.existsSync(link), false);
  fs.rmSync(outside, { recursive: true, force: true });
});

test("clear con bloque envenenado + normal → memory null; target intacto", () => {
  const root = tmpProject({});
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "haui-clear-esc-"));
  fs.writeFileSync(path.join(outside, "secret"), "keep");
  const link = path.join(root, "graphify-out");
  fs.symlinkSync(outside, link);

  const poisoned = mem.makeBlock(".", "root");
  const normal = mem.makeBlock("src/x", "x");
  fs.mkdirSync(path.join(root, "src/x"), { recursive: true });
  fs.mkdirSync(path.join(root, normal.artifacts.dir), { recursive: true });
  fs.writeFileSync(path.join(root, normal.artifacts.dir, "graph.json"), "{}\n");

  writeCfg(root, {
    version: 1,
    design: null,
    product: null,
    memory: { enabled: true, default: "root", blocks: [poisoned, normal] },
  });

  const done = mem.main(["clear", "--yes"], root);
  assert.equal(done.ok, true);
  assert.equal(done.memory, null);
  assert.ok(fs.existsSync(path.join(outside, "secret")));
  assert.equal(fs.existsSync(link), false);
  assert.equal(fs.existsSync(path.join(root, normal.artifacts.dir)), false);
  fs.rmSync(outside, { recursive: true, force: true });
});

test("run.mjs refresh sin config → deck-init via wrapper", () => {
  const root = tmpProject({});
  const runPath = path.resolve(
    __dirname,
    "../../suit/graphify/deck-graphify-refresh/scripts/run.mjs",
  );
  const r = spawnSync(process.execPath, [runPath, "refresh"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(r.status, 0);
  assert.match(String(r.stderr || r.stdout), /\/deck-init/);
});

if (process.exitCode) {
  console.error("\nFAIL");
  process.exit(1);
}
console.log("\nAll graphify tests passed");
