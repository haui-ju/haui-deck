# haui-deck

Agent Skills por **suit**. Runtime: `.agents/skills/`. Ver [`AGENTS.md`](AGENTS.md).

## Uso

```bash
npx skills add haui-ju/haui-deck/suit/design
# luego /deck-init una vez

npx skills add haui-ju/haui-deck/suit/graphify
# luego /deck-graphify-init (memoria en el proyecto consumidor)

npx skills add haui-ju/haui-deck --skill <skill> --full-depth
npx skills update
```

## Suit `design`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-init` | `/deck-init` | DESIGN/PRODUCT.md → `.haui-deck/config.json` |
| `deck-hola-mundo` | `/deck-hola-mundo` | Smoke test |
| `deck-make-button` | `/deck-make-button` | Botón (sin texto → `boton`) |

## Suit `graphify`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-graphify-init` | `/deck-graphify-init` | CLI + índice + `memory` en config |
| `deck-graphify-refresh` | `/deck-graphify-refresh` | Re-index (sin id → `default`) |
| `deck-graphify-status` | `/deck-graphify-status` | Estado CLI + bloques |
| `deck-graphify-open` | `/deck-graphify-open` | Abre HTML (sin id → `default`) |
| `deck-graphify-remove` | `/deck-graphify-remove` | Borra un bloque (confirma) |
| `deck-graphify-clear` | `/deck-graphify-clear` | Borra todos + `memory: null` (confirma) |

haui-deck **no** empaca Graphify; el CLI vive en el consumidor.

## Suit `meta`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `review-skill` | `/review-skill` | Auditoría hostil de skills del repo |

```bash
npx skills add haui-ju/haui-deck/suit/meta
```

## Draft

[`draft.md`](draft.md)
