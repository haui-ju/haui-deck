# haui-deck

Deck de **Agent Skills** instalables (Cursor, Claude, Codex, Copilot, …).

Organizado en **`suit/`** (bloques). Cada entrada bajo `suit/` contiene una o más skills.

## Install

### Interactivo (elige agentes)

Sin `-y` el CLI pregunta scope y agentes:

```bash
npx skills add haui-ju/haui-deck/suit/design
```

### Suit `design` completo (sin prompts)

```bash
# todos los agentes detectados
npx skills add haui-ju/haui-deck/suit/design --agent '*' -y

# solo algunos
npx skills add haui-ju/haui-deck/suit/design --agent cursor --agent claude-code -y
```

`-y` salta confirmaciones (incluido el menú de agentes). Si quieres que te pregunte, **no uses `-y`**.

### Solo una skill

```bash
npx skills add haui-ju/haui-deck --skill design -y
npx skills add haui-ju/haui-deck --skill deck-hola-mundo -y
```

### Global

```bash
npx skills add haui-ju/haui-deck/suit/design -g --agent cursor -y
```

## Remove

`remove` usa el **nombre de la skill**, no la URL del repo:

```bash
# interactivo
npx skills remove

# por nombre
npx skills remove design deck-hola-mundo -y

# todo el proyecto
npx skills remove --all
```

## Suit

| Suit | Skills | Uso |
|------|--------|-----|
| [`design`](suit/design) | `design`, `deck-hola-mundo` | UI / frontend visual; smoke `/deck-hola-mundo` |

## Uso en chat

- `/design` o contexto de UI → playbook de diseño
- `/deck-hola-mundo` → smoke test del suit

## Estructura

```text
suit/<nombre>/<skill>/SKILL.md
```

Estándar: [create-skill](https://cursor.com/docs/skills) / Agent Skills (`name` + `description`, progressive disclosure).

## Repo portable (varias máquinas)

Este repo versiona también las tools instaladas en el proyecto (`.agents/`, `.claude/`, `skills-lock.json`) para clonar y seguir trabajando sin reinstalar cada vez.

Las skills **publicadas** del deck viven en `suit/`. Las de **autoría/dev** (p. ej. `skill-creator`) viven en `.agents/skills/`.

## Draft

Ideas futuras: ver [`draft.md`](draft.md).
