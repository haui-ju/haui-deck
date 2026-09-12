# haui-deck

Agent Skills por **suit**. Runtime: `.agents/skills/`. Ver [`AGENTS.md`](AGENTS.md).

## Uso

```bash
npx skills add haui-ju/haui-deck/suit/design
# luego /deck-init una vez

npx skills add haui-ju/haui-deck --skill deck-init --full-depth
npx skills add haui-ju/haui-deck --skill deck-hola-mundo --full-depth
npx skills add haui-ju/haui-deck --skill deck-make-button --full-depth

npx skills remove deck-init deck-hola-mundo deck-make-button
npx skills update
```

## Suit `design`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-init` | `/deck-init` | DESIGN/PRODUCT.md → `.haui-deck/config.json` |
| `deck-hola-mundo` | `/deck-hola-mundo` | Smoke test |
| `deck-make-button` | `/deck-make-button` | Botón (sin texto → `boton`) |

## Suit `meta`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `review-skill` | `/review-skill` | Auditoría hostil de skills del repo |

```bash
npx skills add haui-ju/haui-deck/suit/meta
```

## Draft

[`draft.md`](draft.md)
