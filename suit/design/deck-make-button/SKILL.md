---
name: deck-make-button
description: >-
  Create a simple UI button in the current project. If the user does not provide
  label text, use "boton". Prefer an existing Button from DESIGN.md / the project
  design system when documented. Use when the user runs /deck-make-button or asks
  to make a button with haui-deck.
disable-model-invocation: true
---

# Deck make button

Crea un botón simple en el proyecto.

## Project context (orden fijo — no improvisar)

**Paso 1 — Validar contexto** y **Paso 2 — Crear `.haui-deck`** se hacen con el script (no a mano):

```bash
node <path-to-this-skill>/scripts/ensure-haui-deck.mjs
```

El script, en este orden:

1. Mira en la raíz del proyecto si existen exactamente `DESIGN.md` y/o `PRODUCT.md` (no los crea).
2. Crea `.haui-deck/` si no existe.
3. Escribe `.haui-deck/config.json` enrutando solo lo encontrado (`design` / `product` = path o `null`).

Si el runtime muestra el base path de la skill, usa ese path absoluto al script. cwd = raíz del proyecto del usuario.

**Paso 3 — Leer contexto**

1. Lee `.haui-deck/config.json`.
2. Si `design` no es `null`, lee ese archivo. Si define un Button del sistema, **úsalo**.
3. Si `product` no es `null`, léelo solo si el label/tono de marca lo requieren.
4. Si `design` es `null` → botón mínimo en el stack del repo. No inventes design system ni `components.md` / `tokens.md`.

## Instructions

1. Label: texto del usuario, o **`boton`** si no hay texto.
2. Ejecuta el script de Project context (arriba) antes de editar UI.
3. Destino razonable; implementa el botón según el stack.
4. Cambio mínimo: un botón, sin página entera ni AI-slop.
5. Responde breve en español: label, path del botón, y el `config` resultante (`design`/`product`).

## Verify

```bash
node <path-to-this-skill>/scripts/ensure-haui-deck.mjs --check
node <path-to-this-skill>/scripts/ensure-haui-deck.test.mjs
```

## Example

User: `/deck-make-button`  
→ script asegura `.haui-deck/config.json`; botón `boton`.

User: `/deck-make-button Guardar`  
→ botón `Guardar`.
