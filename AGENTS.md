# AGENTS

Reglas para **haui-deck**.

## Installs

- Destino proyecto: **`.agents/skills/`**. `npx skills` reparte a otros agentes.
- Source producto: **`suit/<nombre>/<skill>/`**. Meta del repo (p. ej. **`review-skill/`**) en la **raíz**.
- **`npx skills add` no ejecuta post-install.** Tras instalar suit `design`, correr **`/deck-init`** una vez.
- Antes de mergear skills: **`/review-skill`** (auditoría hostil; checklist EN en `review-skill/references/`).
- SKILL.md lean; rúbricas largas en `references/` (progressive disclosure).

## CLI

```bash
npx skills add haui-ju/haui-deck/suit/design
npx skills add haui-ju/haui-deck --skill <skill>
npx skills remove <skill> …
npx skills update
```

## Contexto

- `/deck-init` → script `ensure-haui-deck.mjs`: detecta `DESIGN.md`/`PRODUCT.md` → `.haui-deck/config.json`.
- `/deck-make-button` solo **lee** el config (si falta → pedir `/deck-init`).
- Tests en `tests/` del repo: `pnpm test`. No meter tests dentro de skills instalables.
- SKILL.md corto: sin ensayos que gasten tokens en cada invocación.

## Autoría

create-skill: `name` = carpeta, description WHAT+WHEN, slash → `disable-model-invocation: true`.

## Git

No commit/push salvo pedido explícito.
