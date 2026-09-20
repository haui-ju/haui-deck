# Suit `graphify`

Memoria Graphify en el **proyecto consumidor** (un solo `memory.mjs` en `deck-graphify-init`; el resto usa `scripts/run.mjs`).

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

- Instalar el **suit completo** (wrappers resuelven `deck-graphify-init`).
- Paths de `scope` / `artifacts` siempre **dentro** del proyecto.
- `memory.enabled=false` → skills no-op (el usuario no quiere memoria).
- `/deck-graphify-clear` no quita la línea `**/graphify-out/` del `.gitignore`.
