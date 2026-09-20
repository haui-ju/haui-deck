---
name: deck-graphify-status
description: >-
  Show Graphify CLI and memory block status. Without an id, lists all blocks.
  If config/memory missing, prints /deck-init or /deck-graphify-init. Use when
  the user runs /deck-graphify-status.
disable-model-invocation: true
---

# Deck graphify status

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/run.mjs status [id]
```

3. Si pide init → muestra **solo** ese mensaje y para.
4. Resume breve: enabled, default, bloques.
