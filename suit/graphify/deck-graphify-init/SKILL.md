---
name: deck-graphify-init
description: >-
  Install Graphify CLI if needed, index a project scope into graphify-out, and
  write memory blocks into .haui-deck/config.json. Default scope is project root.
  Use when the user runs /deck-graphify-init or asks to set up Graphify memory.
disable-model-invocation: true
---

# Deck graphify init

Requiere `.haui-deck/config.json` (si falta → `/deck-init`).

## Instructions

1. cwd = raíz del proyecto.
2. Scope = arg del usuario, o `.` (root).
3. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs init [scope]
```

4. Muestra JSON breve (block id, artifacts, enabled). No inventes DESIGN/PRODUCT.
