# Suit `graphify`

Memoria Graphify en el **proyecto consumidor** (`memory.mjs` + `paths.mjs` en init; el resto usa `scripts/run.mjs`).

| Skill | Slash |
|-------|-------|
| [`deck-graphify-init`](deck-graphify-init/) | `/deck-graphify-init` |
| [`deck-graphify-refresh`](deck-graphify-refresh/) | `/deck-graphify-refresh` |
| [`deck-graphify-status`](deck-graphify-status/) | `/deck-graphify-status` |
| [`deck-graphify-open`](deck-graphify-open/) | `/deck-graphify-open` |
| [`deck-graphify-remove`](deck-graphify-remove/) | `/deck-graphify-remove` |
| [`deck-graphify-clear`](deck-graphify-clear/) | `/deck-graphify-clear` |

```bash
npx skills add haui-ju/haui-deck/suit/graphify
```

- Instalar el **suit completo**.
- Paths siempre **dentro** del proyecto (skills + `.haui-deck/run-graphify.mjs` + `paths.mjs`).
- `memory.enabled=false`: noop en init/refresh/open/query (**exit 0** + `"noop": true` = pausa, no error); **status / remove / clear** siguen. Agentes: leer `noop` / `enabled` en el JSON.
- Clear **no** revierte gitignore ni quita scripts/`run-graphify.mjs`.
- Remove/clear con path o symlink escapado: limpian el bloque del config; symlink → solo unlink del link (target fuera intacto).
- Scripts sin agente (tras init):

```bash
pnpm graphify:query -- "App"
pnpm graphify:explain -- "App"
pnpm graphify:path -- "A" "B"
pnpm graphify:update
pnpm graphify:diagnose
# sub-scope / bloque concreto:
pnpm graphify:query -- --block components "App"
node .haui-deck/run-graphify.mjs query --block components "App"
```

`graphify:path` puede salir 0 sin path dirigido (ambigüedad del CLI Graphify, no del deck).
