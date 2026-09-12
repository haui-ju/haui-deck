# Anti-patterns (fail these)

## Authorship

- Mega-skill that init + builds + reviews + documents.
- SKILL.md that re-explains Agent Skills theory on every invoke.
- “When to use” sections that clone the YAML `description`.
- Deep `references/a.md` → `references/b.md` → `references/c.md` chains.
- Time-bombs (“before Aug 2025 use…”).
- Windows paths (`scripts\foo.py`).
- Offering five libraries with no default.

## Triggering

- Description: “Helps with design.”
- Slash workflow without `disable-model-invocation: true`.
- Auto skill that mutates the repo with no explicit user intent.

## Tokens / performance

- Instructing “always run ensure/bootstrap” inside an action skill.
- Instructing “read all markdown in the repo” before a small edit.
- Shipping eval workspaces, screenshots, or novels inside the skill folder.

## haui-deck specific

- Putting `ensure-haui-deck` inside `deck-make-button`.
- Writing `DESIGN.md` / `PRODUCT.md` from an action skill without being asked.
- Requiring `.haui-deck/index/*` when DESIGN.md already holds the system.
- Leaving skill sources at repo root (use `suit/<suit>/` or `suit/meta/`)
- Leaving deleted skill trees (`suit/design/design/…`) or docs that still advertise them
- Tests under `suit/**/**/*.test.*`
