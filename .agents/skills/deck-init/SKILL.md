---
name: deck-init
description: >-
  One-time setup for haui-deck in the current project. Detects DESIGN.md and
  PRODUCT.md, creates .haui-deck/config.json with routed paths. Use when the user
  runs /deck-init, after installing the design suit, or asks to init haui-deck.
disable-model-invocation: true
---

# Deck init

Setup **una vez** por proyecto (no es make-button).

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/ensure-haui-deck.mjs
```

3. Muestra el JSON de salida (found / config). No edites UI. No crees DESIGN.md ni PRODUCT.md.
