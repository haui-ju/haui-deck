---
name: deck-make-button
description: >-
  Create a simple UI button in the current project. If the user does not provide
  label text, use "boton". Prefer an existing Button from DESIGN.md when
  .haui-deck/config.json points to it. Use when the user runs /deck-make-button
  or asks to make a button with haui-deck.
disable-model-invocation: true
---

# Deck make button

## Instructions

1. Label = texto del usuario, o **`boton`** si no hay texto.
2. Si no existe `.haui-deck/config.json` → di que corran `/deck-init` primero y para. No improvises el config.
3. Lee `.haui-deck/config.json`. Si `design` no es `null`, lee ese archivo; usa Button del sistema si está documentado.
4. Implementa un botón mínimo en el stack del proyecto.
5. Responde breve: label y path.
