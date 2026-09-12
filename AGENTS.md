# AGENTS

Reglas para quien trabaja en **haui-deck** (agentes y humanos).

## Destino de installs

- Preferir siempre **`.agents/skills/`** como destino de proyecto.
- No copiar skills a mano a `.cursor/`, `.claude/`, etc.: **`npx skills`** reparte / enlaza a otros agentes si el usuario lo pide.
- Source publicable: **`suit/<nombre>/<skill>/`**.
- Tools de autoría del repo (p. ej. `skill-creator`) viven bajo `.agents/skills/` y se versionan con el repo.

## Skills CLI

```bash
npx skills add haui-ju/haui-deck/suit/<nombre>
npx skills add haui-ju/haui-deck --skill <skill>
npx skills remove <skill> …
npx skills update
```

Sin `-y` → pregunta scope/agentes. Con `-y` → sin prompts.

## Contexto en proyectos consumidores

- Flujo fijo (script `ensure-haui-deck.mjs`): **1)** detectar `DESIGN.md`/`PRODUCT.md` → **2)** crear `.haui-deck/` → **3)** escribir `config.json` solo con paths que existen (`null` si faltan).
- `deck-make-button` ejecuta ese script; no inventa MD ni índices.
- `deck-hola-mundo` no toca contexto.
- Tests: `node suit/design/deck-make-button/scripts/ensure-haui-deck.test.mjs`

## Autoría

- Estándar **create-skill**: carpeta = `name`, `description` WHAT+WHEN.
- Slash-only → `disable-model-invocation: true`.
- README breve. Backlog en `draft.md`.

## Git

No hacer commit ni push salvo que el usuario lo pida explícitamente.
