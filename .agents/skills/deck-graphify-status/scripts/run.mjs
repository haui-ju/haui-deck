#!/usr/bin/env node
/**
 * Thin wrapper: delegates to deck-graphify-init/scripts/memory.mjs
 * Works in source (suit/graphify/…) and flat install (.agents/skills/…).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const memoryPath = path.resolve(
  __dirname,
  "../../deck-graphify-init/scripts/memory.mjs",
);

if (!fs.existsSync(memoryPath)) {
  console.error(
    "Falta deck-graphify-init. Ejecuta:\nnpx skills add haui-ju/haui-deck/suit/graphify",
  );
  process.exit(1);
}

const result = spawnSync(process.execPath, [memoryPath, ...process.argv.slice(2)], {
  encoding: "utf8",
  stdio: "inherit",
});
process.exit(result.status ?? 1);
