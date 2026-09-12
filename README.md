# haui-deck

Agent Skills por **suit**. Destino: `.agents/skills/`. Ver [`AGENTS.md`](AGENTS.md).

## Uso

```bash
# 1) instalar suit
npx skills add haui-ju/haui-deck/suit/design

# 2) init una vez (npx skills NO corre post-install solo)
#    en el chat: /deck-init
#    o: node .agents/skills/deck-init/scripts/ensure-haui-deck.mjs

# skill concreta
npx skills add haui-ju/haui-deck --skill deck-init
npx skills add haui-ju/haui-deck --skill deck-hola-mundo
npx skills add haui-ju/haui-deck --skill deck-make-button

npx skills remove deck-init deck-hola-mundo deck-make-button
npx skills update
```

## Suit `design`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-init` | `/deck-init` | Detecta DESIGN/PRODUCT.md → `.haui-deck/config.json` |
| `deck-hola-mundo` | `/deck-hola-mundo` | Smoke test |
| `deck-make-button` | `/deck-make-button` | Botón simple (sin texto → `boton`) |

| Agent | Notas |
|-------|--------|
| — | Ninguno aún |

## Mantenedores

```bash
# auditar skills de este repo
# /review-skill
npx skills add . --skill review-skill
```

## Draft

[`draft.md`](draft.md)
