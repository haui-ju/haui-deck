# haui-deck

Deck de **Agent Skills** instalables (Cursor, Claude, Codex, Copilot, …).

Organizado en **suits** (bloques). Cada suit contiene una o más skills.

## Install

### Suit `design` completo

```bash
npx skills add haui-ju/haui-deck/suits/design -y
```

### Solo una skill

```bash
npx skills add haui-ju/haui-deck --skill design -y
npx skills add haui-ju/haui-deck --skill deck-hola-mundo -y
```

### Global / todos los agentes

```bash
npx skills add haui-ju/haui-deck/suits/design -g --agent '*' -y
```

## Suits

| Suit | Skills | Uso |
|------|--------|-----|
| [`design`](suits/design) | `design`, `deck-hola-mundo` | UI / frontend visual; smoke `/deck-hola-mundo` |

## Uso en chat

- `/design` o contexto de UI → playbook de diseño
- `/deck-hola-mundo` → smoke test del suit

## Estructura

```text
suits/<suit>/<skill>/SKILL.md
```

Estándar: [create-skill](https://cursor.com/docs/skills) / Agent Skills (`name` + `description`, progressive disclosure).

## Draft

Ideas futuras (otros suits, npm, config, CLI): ver [`draft.md`](draft.md).
