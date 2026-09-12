# haui-deck

Agent Skills por **suit**. Destino típico: `.agents/skills/`. Convenciones: [`AGENTS.md`](AGENTS.md).

## Uso

```bash
# suit completo
npx skills add haui-ju/haui-deck/suit/design

# skill concreta
npx skills add haui-ju/haui-deck --skill deck-hola-mundo
npx skills add haui-ju/haui-deck --skill deck-make-button

# quitar (por nombre, no por URL)
npx skills remove deck-hola-mundo deck-make-button

# actualizar
npx skills update
```

Sin `-y` el CLI pregunta scope/agentes. Con `-y` instala sin prompts.

## Suit `design`

UI mínima. [`suit/design`](suit/design)

### Skills

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-hola-mundo` | `/deck-hola-mundo` | Smoke test del suit |
| `deck-make-button` | `/deck-make-button` | Botón simple (sin texto → `boton`) |

### Agents

| Agent | Notas |
|-------|--------|
| — | Ninguno aún |

## Draft

[`draft.md`](draft.md)
