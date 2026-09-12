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

- Carpeta opcional **`.haui-deck/`** (p. ej. `config.json` con paths a `DESIGN.md` / `PRODUCT.md`).
- `DESIGN.md` + `PRODUCT.md` en la raíz = verdad visual/producto (compatible Impeccable).
- **Solo** las skills que declaran Project context cargan esos archivos (ahorro de tokens). Hoy: `deck-make-button` sí; `deck-hola-mundo` no.
- No exigir ni generar `components.md` / `tokens.md` en v0.

## Autoría

- Estándar **create-skill**: carpeta = `name`, `description` WHAT+WHEN.
- Slash-only → `disable-model-invocation: true`.
- README breve. Backlog en `draft.md`.

## Git

No hacer commit ni push salvo que el usuario lo pida explícitamente.
