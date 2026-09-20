---
name: deck-init
description: >-
  Setup or refresh haui-deck in the current project. Detects DESIGN.md and
  PRODUCT.md, creates or updates .haui-deck/config.json if needed. Safe to
  re-run. Use when the user runs /deck-init, after installing the design suit,
  or asks to init haui-deck.
disable-model-invocation: true
---

# Deck init

## Instructions

1. cwd = raíz del proyecto.
2. Ejecuta:

```bash
node <path-to-this-skill>/scripts/ensure-haui-deck.mjs
```

3. Si el config ya existía y `status` es `unchanged` o `updated` → responde solo **ok** (una línea). Si es `created` → **ok** + path del config.
4. No crees DESIGN.md ni PRODUCT.md. No edites UI.
