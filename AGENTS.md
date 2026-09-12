# AGENTS

Reglas para quien trabaja en **haui-deck** (agentes y humanos).

## Destino de installs

- Preferir siempre **`.agents/skills/`** como destino de proyecto.
- No copiar skills a mano a `.cursor/`, `.claude/`, etc.: **`npx skills`** reparte / enlaza a otros agentes si el usuario lo pide.
- Source de verdad publicable: **`suit/<nombre>/<skill>/`**.
- Tools de autoría del repo (p. ej. `skill-creator`) también viven bajo `.agents/skills/` y se versionan con el repo.

## Skills CLI

```bash
# suit completo
npx skills add haui-ju/haui-deck/suit/<nombre>

# skill concreta
npx skills add haui-ju/haui-deck --skill <skill>

# quitar (por nombre, no por URL)
npx skills remove <skill> …

# actualizar
npx skills update
```

Sin `-y` → pregunta scope/agentes. Con `-y` → sin prompts.

## Autoría

- Estándar **create-skill**: carpeta = `name`, `description` WHAT+WHEN.
- Slash-only → `disable-model-invocation: true`.
- Detalle largo en `references/`; subagentes en `agents/` dentro de la skill.
- README breve; sin redundancia. Detalle de backlog en `draft.md`.

## Git

No hacer commit ni push salvo que el usuario lo pida explícitamente.
