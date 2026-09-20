---
name: deck-graphify-remove
description: >-
  Remove one Graphify memory block. Without an id, targets memory.default.
  Works when memory.enabled=false (cleanup). Always confirm before deleting.
  Use when the user runs /deck-graphify-remove.
disable-model-invocation: true
---

# Deck graphify remove

## Instructions

1. cwd = raíz del proyecto.
2. Plan (`code: 2` = esperando confirmación):

```bash
node <path-to-this-skill>/scripts/run.mjs remove [id]
```

3. Si pide init → muestra **solo** ese mensaje y para.
4. Detalle breve → **pide confirmación**. Si hay `warning` (symlink/path escapado), menciónalo: se limpia config sin tocar targets fuera del repo.
5. Solo si confirma:

```bash
node <path-to-this-skill>/scripts/run.mjs remove [id] --yes
```

Sin confirmación → no borres. Al final: **ok**.
