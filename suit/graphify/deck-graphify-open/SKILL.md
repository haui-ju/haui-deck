---
name: deck-graphify-open
description: >-
  Open the Graphify HTML report for a memory block. Without an id, opens
  memory.default. If memory is missing, point to /deck-graphify-init. Use when
  the user runs /deck-graphify-open or asks to open the Graphify HTML.
disable-model-invocation: true
---

# Deck graphify open

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs open [id]
```

3. Si falta `memory`, muestra el mensaje del script y para.
4. Sin id → `memory.default`. Si no abre el OS, muestra la ruta `htmlAbs`.
