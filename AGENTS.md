# AGENTS

Reglas para **haui-deck**.

## Installs

- Destino runtime: **`.agents/skills/`** (copia local tras `npx skills add`).
- Source siempre bajo **`suit/`**:
  - producto: `suit/<suit>/<skill>/`
  - meta/mantenedores: `suit/meta/<skill>/` (p. ej. `review-skill`)
- Nunca dejar skills en la raíz del repo.
- Tras editar source: `npx skills add ./suit/<suit> --skill <name> -y` o `npx skills update`.
- **`npx skills add` no ejecuta post-install.** Tras suit `design` → **`/deck-init`** una vez. Tras suit `graphify` → **`/deck-graphify-init`**.
- Antes de mergear: **`/review-skill`**.
- SKILL.md lean; rúbricas en `references/`.

## CLI

```bash
npx skills add haui-ju/haui-deck/suit/design
npx skills add haui-ju/haui-deck/suit/graphify
npx skills add haui-ju/haui-deck/suit/meta
npx skills add haui-ju/haui-deck --skill <skill> --full-depth
npx skills remove <skill> …
npx skills update
```

## Contexto

- `/deck-init` → `ensure-haui-deck.mjs` → `.haui-deck/config.json` (preserva `memory` si ya existe).
- `/deck-make-button` solo lee config (si falta → `/deck-init`).
- Memoria: `/deck-graphify-init|refresh|status|open|remove|clear`. Si `memory?.enabled === true`, skills de acción pueden consultar el grafo (`memory.default` o id); si `false` / `memory` null, no.
- Graphify CLI se instala en el **consumidor**, no como dep de haui-deck.
- Tests en `tests/`: `pnpm test`.

## Autoría

create-skill: `name` = carpeta, description WHAT+WHEN, slash → `disable-model-invocation: true`.

## Git

No commit/push salvo pedido explícito. Ignorar `**/graphify-out/`.
