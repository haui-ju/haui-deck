# haui-deck layout rules

Apply when the target is under this repository.

## Product vs meta

| Kind | Path |
|------|------|
| Product suit skill | `suit/<suit>/<skill>/SKILL.md` |
| Repo meta skill | `/<skill>/SKILL.md` at repo root (e.g. `review-skill/`) |

## Suit `design` (current)

| Skill | Job | May touch `.haui-deck` / DESIGN / PRODUCT |
|-------|-----|------------------------------------------|
| `deck-init` | Detect MD → write `.haui-deck/config.json` via `scripts/ensure-haui-deck.mjs` | Yes (create config only; never invent MD) |
| `deck-hola-mundo` | Smoke reply | No |
| `deck-make-button` | Create button; default label `boton` | Read config only; if missing → tell user to `/deck-init` |

## Consumer project contract

- Optional `.haui-deck/config.json` with `design` / `product` paths or `null`.
- Shared with Impeccable-style workflows: root `DESIGN.md`, `PRODUCT.md`.
- No mandatory `components.md` / `tokens.md` index in v0.

## Discovery note

Listing from repo root may need `--full-depth` to see suit skills alongside root meta skills. Product install path remains `haui-ju/haui-deck/suit/design`.
