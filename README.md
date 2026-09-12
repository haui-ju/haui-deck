# haui-deck

## Uso

```bash
# suit completo
npx skills add haui-ju/haui-deck/suit/design

# skill concreta
npx skills add haui-ju/haui-deck --skill design
npx skills add haui-ju/haui-deck --skill deck-hola-mundo

# quitar (por nombre, no por URL)
npx skills remove design deck-hola-mundo

# actualizar
npx skills update
```

Sin `-y` el CLI pregunta scope/agentes. Con `-y` instala sin prompts.

## Suit `design`

UI / composición frontend. [`suit/design`](suit/design)

### Skills

| Skill             | Slash              | Qué hace                   |
| ----------------- | ------------------ | -------------------------- |
| `design`          | `/design`          | Playbook de composición UI |
| `deck-hola-mundo` | `/deck-hola-mundo` | Smoke test del suit        |

### Agents

| Agent | Notas                                    |
| ----- | ---------------------------------------- |
| —     | Ninguno aún (`design/agents/` reservado) |

## Draft

[`draft.md`](draft.md)
