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

## Project context

Cargar solo lo necesario (no leas índices inventados):

1. Si existe `.haui-deck/config.json`, úsalo para paths de `design` / `product` (default: `DESIGN.md`, `PRODUCT.md` en la raíz).
2. Si existe `DESIGN.md`, léelo. Si define un Button / componente de botón del sistema, **úsalo** (import y API del proyecto).
3. `PRODUCT.md` solo si el label o el tono de marca lo requieren (casi nunca para un botón suelto).
4. Si no hay `DESIGN.md`, implementa un botón mínimo en el stack del repo. No inventes un design system ni crees `components.md` / `tokens.md`.

## Instructions

1. Determina el label:
   - Si el usuario dio texto → úsalo.
   - Si no → **`boton`**.
2. Elige el archivo/destino razonable (componente nuevo o el que indique el usuario).
3. Implementa el botón (HTML/React/Vue/etc. según el proyecto).
4. Mantén el cambio mínimo: un botón, sin página entera ni estilos AI-slop.
5. Responde breve en español: dónde quedó y qué label usaste.

## Example

User: `/deck-make-button`  
→ botón con texto `boton`.

User: `/deck-make-button Guardar`  
→ botón con texto `Guardar`.
