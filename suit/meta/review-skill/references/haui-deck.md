# haui-deck layout rules

Apply when the target is under this repository.

## Suits

| Kind | Path |
|------|------|
| Product skill | `suit/<suit>/<skill>/SKILL.md` (e.g. `suit/design/…`) |
| Maintainer / meta skill | `suit/meta/<skill>/SKILL.md` (e.g. `suit/meta/review-skill/`) |
| Local install (runtime) | `.agents/skills/<skill>/` via `npx skills add` — not source |

Never place skills at repo root.

## Suit `design` (current)

| Skill | Job | May touch `.haui-deck` / DESIGN / PRODUCT |
|-------|-----|------------------------------------------|
| `deck-init` | Detect MD → write `.haui-deck/config.json` via `scripts/ensure-haui-deck.mjs` | Yes (create config only; never invent MD) |
| `deck-hola-mundo` | Smoke reply | No |
| `deck-make-button` | Create button; default label `boton` | Read config only; if missing → tell user to `/deck-init` |

## Suit `meta` (current)

| Skill | Job |
|-------|-----|
| `review-skill` | Hostile audit of skills in this repo |

## Consumer project contract

- Optional `.haui-deck/config.json` with `design` / `product` paths or `null`.
- Shared with Impeccable-style workflows: root `DESIGN.md`, `PRODUCT.md`.
- No mandatory `components.md` / `tokens.md` index in v0.

## Install paths

```bash
npx skills add haui-ju/haui-deck/suit/design
npx skills add haui-ju/haui-deck/suit/meta
# or
npx skills add haui-ju/haui-deck --skill review-skill --full-depth
```
