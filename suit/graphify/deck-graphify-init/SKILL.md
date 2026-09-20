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
3. Scope = arg del usuario, o `.`.
4. Ejecuta:

```bash
node <path-to-this-skill>/scripts/memory.mjs init [scope]
```

5. Responde breve (ok + id del bloque). No inventes DESIGN/PRODUCT.
