---
name: deck-graphify-status
description: >-
  Show Graphify CLI and memory block status from .haui-deck/config.json. Without
  an id, lists all blocks. If memory is missing, point to /deck-graphify-init.
  Use when the user runs /deck-graphify-status or asks Graphify memory status.
disable-model-invocation: true
---

# Deck graphify status

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs status [id]
```

3. Si falta `memory`, muestra el mensaje del script y para.
4. Resume enabled, default, cli, y cada bloque (graph/html existen?).
