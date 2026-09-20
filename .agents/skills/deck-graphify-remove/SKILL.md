---
name: deck-graphify-remove
description: >-
  Remove one Graphify memory block. Without an id, targets memory.default.
  Requires config+memory (else /deck-init or /deck-graphify-init). Always confirm
  before deleting. Use when the user runs /deck-graphify-remove.
disable-model-invocation: true
---

# Deck graphify remove

## Instructions

1. cwd = raíz del proyecto.
2. Plan:

```bash
node <path-to-this-skill>/scripts/run.mjs remove [id]
```

3. Si pide init → muestra **solo** ese mensaje y para.
4. Detalle breve → **pide confirmación**.
5. Solo si confirma (`code: 2` del plan = esperando confirmación):

```bash
node <path-to-this-skill>/scripts/run.mjs remove [id] --yes
```

Sin confirmación → no borres. Al final: **ok**.
