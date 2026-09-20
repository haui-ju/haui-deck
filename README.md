# haui-deck

Agent Skills por **suit**. Runtime: `.agents/skills/`. Ver [`AGENTS.md`](AGENTS.md).

## Uso

```bash
npx skills add haui-ju/haui-deck/suit/design
# luego /deck-init una vez

npx skills add haui-ju/haui-deck/suit/graphify
# luego /deck-graphify-init

npx skills update
```

## Suit `design`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-init` | `/deck-init` | DESIGN/PRODUCT.md → `.haui-deck/config.json` |
| `deck-make-button` | `/deck-make-button` | Botón (sin texto → `boton`) |

## Suit `graphify`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `deck-graphify-init` | `/deck-graphify-init` | CLI + índice + `memory` |
| `deck-graphify-refresh` | `/deck-graphify-refresh` | Re-index (sin id → `default`) |
| `deck-graphify-status` | `/deck-graphify-status` | Estado |
| `deck-graphify-open` | `/deck-graphify-open` | Abre HTML |
| `deck-graphify-remove` | `/deck-graphify-remove` | Borra un bloque (confirma) |
| `deck-graphify-clear` | `/deck-graphify-clear` | Borra todos (confirma) |

Instalar suit `graphify` completo (las skills delegan a `deck-graphify-init`).

## Suit `meta`

| Skill | Slash | Qué hace |
|-------|-------|----------|
| `review-skill` | `/review-skill` | Auditoría hostil |

## Draft

[`draft.md`](draft.md)
