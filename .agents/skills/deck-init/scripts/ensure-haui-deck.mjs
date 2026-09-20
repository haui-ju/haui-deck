#!/usr/bin/env node
/**
 * ensure-haui-deck.mjs
 *
 * Orden fijo:
 * 1) Validar qué archivos de contexto existen en la raíz del proyecto
 * 2) Crear .haui-deck/ si falta
 * 3) Escribir config.json enrutando SOLO paths que existen
 *
 * No crea DESIGN.md ni PRODUCT.md.
 * No crea index/components/tokens.
 *
 * Usage:
 *   node ensure-haui-deck.mjs [projectRoot]
 *   node ensure-haui-deck.mjs --check [projectRoot]   # dry-run, exit 1 si config desfasada
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONTEXT_FILES = {
  design: "DESIGN.md",
  product: "PRODUCT.md",
};

export function detectContext(root) {
  const found = {};
  for (const [key, file] of Object.entries(CONTEXT_FILES)) {
    const abs = path.join(root, file);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      found[key] = file;
    }
  }
  return found;
}

export function buildConfig(found, { memory } = {}) {
  const config = {
    version: 1,
    design: found.design ?? null,
    product: found.product ?? null,
  };
  if (memory !== undefined) {
    config.memory = memory;
  }
  return config;
}

export function readExistingConfig(configPath) {
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return null;
  }
}

export function ensureHauiDeck(root, { write = true } = {}) {
  const absRoot = path.resolve(root);
  if (!fs.existsSync(absRoot) || !fs.statSync(absRoot).isDirectory()) {
    throw new Error(`project root no existe: ${absRoot}`);
  }

  const found = detectContext(absRoot);
  const dir = path.join(absRoot, ".haui-deck");
  const configPath = path.join(dir, "config.json");
  const prevCfg = readExistingConfig(configPath);
  const memory =
    prevCfg && Object.prototype.hasOwnProperty.call(prevCfg, "memory")
      ? prevCfg.memory
      : undefined;
  const config = buildConfig(found, { memory });

  const result = {
    root: absRoot,
    found,
    config,
    dir,
    configPath,
    createdDir: false,
    wroteConfig: false,
  };

  if (!write) {
    return result;
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    result.createdDir = true;
  }

  const next = `${JSON.stringify(config, null, 2)}\n`;
  let prev = null;
  if (fs.existsSync(configPath)) {
    prev = fs.readFileSync(configPath, "utf8");
  }
  if (prev !== next) {
    fs.writeFileSync(configPath, next, "utf8");
    result.wroteConfig = true;
  }

  return result;
}

function main(argv) {
  const check = argv.includes("--check");
  const args = argv.filter((a) => a !== "--check");
  const root = args[0] ?? process.cwd();

  if (check) {
    const planned = ensureHauiDeck(root, { write: false });
    const configPath = planned.configPath;
    if (!fs.existsSync(configPath)) {
      console.error("FAIL: falta .haui-deck/config.json");
      process.exit(1);
    }
    const onDisk = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const ok =
      onDisk.design === planned.config.design &&
      onDisk.product === planned.config.product;
    if (!ok) {
      console.error("FAIL: config desfasada respecto a DESIGN.md/PRODUCT.md");
      console.error("disk:", onDisk);
      console.error("expected:", planned.config);
      process.exit(1);
    }
    console.log(JSON.stringify({ ok: true, config: onDisk }, null, 2));
    return;
  }

  const result = ensureHauiDeck(root, { write: true });
  console.log(
    JSON.stringify(
      {
        createdDir: result.createdDir,
        wroteConfig: result.wroteConfig,
        found: result.found,
        config: result.config,
        configPath: result.configPath,
      },
      null,
      2,
    ),
  );
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(String(err?.message ?? err));
    process.exit(1);
  }
}
