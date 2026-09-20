---
name: deck-graphify-remove
description: >-
  Remove one Graphify memory block and its artifacts.dir. Without an id, targets
  memory.default. Always show a short plan and ask for confirmation before
  deleting. Use when the user runs /deck-graphify-remove.
disable-model-invocation: true
---

# Deck graphify remove

## Instructions

1. cwd = raíz del proyecto.
2. Plan (sin borrar):

```bash
node <path-to-this-skill>/scripts/memory.mjs remove [id]
```

3. Si falta `memory`, muestra el mensaje y para.
4. Muestra el detalle `will` (id + dir a borrar) y **pide confirmación explícita**.
5. Solo si el usuario confirma, ejecuta con `--yes`:

```bash
node <path-to-this-skill>/scripts/memory.mjs remove [id] --yes
```

Sin confirmación → no borres nada.
