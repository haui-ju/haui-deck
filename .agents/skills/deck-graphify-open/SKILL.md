---
name: deck-graphify-open
description: >-
  Open the Graphify HTML for a memory block. Without an id, opens memory.default.
  If config/memory missing, prints /deck-init or /deck-graphify-init. Use when
  the user runs /deck-graphify-open.
disable-model-invocation: true
---

# Deck graphify open

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/run.mjs open [id]
```

3. Si pide init → muestra **solo** ese mensaje y para.
4. Si `noop: true` / `memory.enabled=false` → **ok, memoria deshabilitada**. No digas que abriste el HTML.
5. Sin id → `memory.default`. Si ok real → **ok** (o ruta html).
