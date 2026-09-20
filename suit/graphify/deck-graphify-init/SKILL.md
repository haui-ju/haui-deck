---
name: deck-graphify-init
description: >-
  Install Graphify CLI if needed, index a project scope into graphify-out, and
  write memory blocks into .haui-deck/config.json. Default scope is project root.
  Use when the user runs /deck-graphify-init or asks to set up Graphify memory.
disable-model-invocation: true
---

# Deck graphify init

## Instructions

1. cwd = raíz del proyecto.
2. Si falta `.haui-deck/config.json` → responde solo `Ejecuta /deck-init` y para.
3. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs init [scope]
```

4. Si el JSON tiene `noop: true` / `message: memory.enabled=false` → responde **solo** `ok, memoria deshabilitada`. No digas indexado/éxito de indexación. (exit 0 + noop es pausa, no error.)
5. Si ok real → breve (ok + id) y scripts npm si se añadieron:

```bash
pnpm graphify:query -- "…"
pnpm graphify:explain -- "…"
pnpm graphify:path -- "A" "B"
pnpm graphify:update
pnpm graphify:diagnose
```

Sub-scope / bloque concreto:

```bash
pnpm graphify:query -- --block <id> "…"
```

Nota: `graphify:path` puede salir 0 sin path dirigido (ambigüedad del CLI Graphify, no del deck).

No inventes DESIGN/PRODUCT.
