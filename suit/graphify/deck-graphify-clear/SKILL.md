---
name: deck-graphify-clear
description: >-
  Delete all Graphify memory blocks and artifact dirs, set memory to null in
  .haui-deck/config.json. Always show a short plan and ask for confirmation
  before deleting. Use when the user runs /deck-graphify-clear.
disable-model-invocation: true
---

# Deck graphify clear

## Instructions

1. cwd = raíz del proyecto.
2. Plan (sin borrar):

```bash
node <path-to-this-skill>/scripts/memory.mjs clear
```

3. Si falta `memory`, muestra el mensaje y para.
4. Muestra ids + dirs a borrar + `memory → null` y **pide confirmación**.
5. Solo si confirma:

```bash
node <path-to-this-skill>/scripts/memory.mjs clear --yes
```

Sin confirmación → no borres nada. No toques `design` / `product`.
