# haui-deck layout rules

Apply when the target is under this repository.

## Suits

| Kind | Path |
|------|------|
| Product skill | `suit/<suit>/<skill>/SKILL.md` (e.g. `suit/design/…`, `suit/graphify/…`) |
| Maintainer / meta skill | `suit/meta/<skill>/SKILL.md` (e.g. `suit/meta/review-skill/`) |
| Local install (runtime) | `.agents/skills/<skill>/` via `npx skills add` — not source |

Never place skills at repo root. Never ship `graphifyy` as a dependency of this repo.

## Suit `design` (current)

| Skill | Job | May touch `.haui-deck` / DESIGN / PRODUCT |
|-------|-----|------------------------------------------|
| `deck-init` | Detect MD → write `.haui-deck/config.json` via `scripts/ensure-haui-deck.mjs` | Yes (create config only; never invent MD; **preserve `memory`**) |
| `deck-make-button` | Create button; default label `boton` | Read config only; if missing → `/deck-init` |

## Suit `graphify` (current)

| Skill | Job |
|-------|-----|
| `deck-graphify-init` | Ensure Graphify CLI; sole owner of `scripts/memory.mjs` |
| `deck-graphify-refresh` | Re-index via `scripts/run.mjs` → init’s memory.mjs |
| `deck-graphify-status` | Status via run.mjs |
| `deck-graphify-open` | Open HTML via run.mjs |
| `deck-graphify-remove` | Remove one block after confirm |
| `deck-graphify-clear` | Wipe all memory after confirm |

Require full suit install so `../../deck-graphify-init/scripts/memory.mjs` resolves.

## Suit `meta` (current)

| Skill | Job |
|-------|-----|
| `review-skill` | Hostile audit of skills in this repo |

## Consumer project contract

- `.haui-deck/config.json`: `design` / `product` / optional `memory` (`enabled`, `default`, `blocks[]` with `provider`/`scope`/`artifacts`).
- `memory: null` or absent → no Graphify memory yet.
- Shared with Impeccable-style workflows: root `DESIGN.md`, `PRODUCT.md`.
- Ignore `**/graphify-out/`.

## Install paths

```bash
npx skills add haui-ju/haui-deck/suit/design
npx skills add haui-ju/haui-deck/suit/graphify
npx skills add haui-ju/haui-deck/suit/meta
```
