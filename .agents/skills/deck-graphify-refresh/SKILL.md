---
name: deck-graphify-refresh
description: >-
  Re-index an existing Graphify memory block. Without an id, refreshes
  memory.default. If memory is missing, tell the user to run /deck-graphify-init.
  Use when the user runs /deck-graphify-refresh or asks to refresh Graphify.
disable-model-invocation: true
---

# Deck graphify refresh

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs refresh [id]
```

3. Si el script dice que falta `memory`, muestra ese mensaje tal cual (init root o carpeta) y para.
4. Sin id → refresca `memory.default`. Responde breve: id + ok/error.
