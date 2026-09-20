---
name: deck-graphify-clear
description: >-
  Delete all Graphify memory blocks and set memory to null. Requires
  config+memory (else /deck-init or /deck-graphify-init). Always confirm before
  deleting. Use when the user runs /deck-graphify-clear.
disable-model-invocation: true
---

# Deck graphify clear

## Instructions

1. cwd = raíz del proyecto.
2. Plan:

```bash
node <path-to-this-skill>/scripts/run.mjs clear
```

3. Si pide init → muestra **solo** ese mensaje y para.
4. Detalle breve → **pide confirmación**.
5. Solo si confirma (`code: 2` del plan = esperando confirmación):

```bash
node <path-to-this-skill>/scripts/run.mjs clear --yes
```

Sin confirmación → no borres. Al final: **ok**.
