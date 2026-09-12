#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mod = await import(pathToFileURL(path.join(__dirname, "ensure-haui-deck.mjs")).href);
const { detectContext, buildConfig, ensureHauiDeck } = mod;

function tmpProject(files = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "haui-deck-"));
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, name), body, "utf8");
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

test("detecta solo DESIGN.md", () => {
  const root = tmpProject({ "DESIGN.md": "# d\n" });
  const found = detectContext(root);
  assert.deepEqual(found, { design: "DESIGN.md" });
  assert.deepEqual(buildConfig(found), {
    version: 1,
    design: "DESIGN.md",
    product: null,
  });
});

test("detecta DESIGN + PRODUCT", () => {
  const root = tmpProject({
    "DESIGN.md": "# d\n",
    "PRODUCT.md": "# p\n",
  });
  const found = detectContext(root);
  assert.deepEqual(found, { design: "DESIGN.md", product: "PRODUCT.md" });
});

test("sin MD → nulls", () => {
  const root = tmpProject({});
  const found = detectContext(root);
  assert.deepEqual(found, {});
  assert.deepEqual(buildConfig(found), {
    version: 1,
    design: null,
    product: null,
  });
});

test("crea carpeta y config enrutado", () => {
  const root = tmpProject({ "DESIGN.md": "# d\n" });
  const r1 = ensureHauiDeck(root);
  assert.equal(r1.createdDir, true);
  assert.equal(r1.wroteConfig, true);
  assert.ok(fs.existsSync(path.join(root, ".haui-deck")));
  const cfg = JSON.parse(
    fs.readFileSync(path.join(root, ".haui-deck", "config.json"), "utf8"),
  );
  assert.equal(cfg.design, "DESIGN.md");
  assert.equal(cfg.product, null);

  const r2 = ensureHauiDeck(root);
  assert.equal(r2.createdDir, false);
  assert.equal(r2.wroteConfig, false);
});

test("carpeta vacía existente → escribe config", () => {
  const root = tmpProject({ "DESIGN.md": "# d\n" });
  fs.mkdirSync(path.join(root, ".haui-deck"));
  const r = ensureHauiDeck(root);
  assert.equal(r.createdDir, false);
  assert.equal(r.wroteConfig, true);
  assert.ok(fs.existsSync(path.join(root, ".haui-deck", "config.json")));
});

test("actualiza config si aparece PRODUCT.md después", () => {
  const root = tmpProject({ "DESIGN.md": "# d\n" });
  ensureHauiDeck(root);
  fs.writeFileSync(path.join(root, "PRODUCT.md"), "# p\n");
  const r = ensureHauiDeck(root);
  assert.equal(r.wroteConfig, true);
  const cfg = JSON.parse(
    fs.readFileSync(path.join(root, ".haui-deck", "config.json"), "utf8"),
  );
  assert.equal(cfg.product, "PRODUCT.md");
});

if (process.exitCode) {
  console.error("\nFAIL");
  process.exit(1);
}
console.log("\nAll tests passed");
