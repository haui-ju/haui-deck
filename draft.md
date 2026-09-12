# Draft — backlog haui-deck

No implementado aún. Ideas para más adelante.

## Suit futuros

| Suit | Skills tentativas | Notas |
|------|-------------------|--------|
| `core` | `code`, `git` | estándares + workflow git |
| `web` | `ui` + paquete `@haui-deck/web` | design system web |
| `app` | `native` + `@haui-deck/app` | móvil / Expo |
| `py` | `py` | Python |
| `api` | `api` | backend / server |
| `mem` | `graphify` | memoria Graphify |

## Install por suit (patrón)

```bash
# pack completo
npx skills add haui-ju/haui-deck/suit/<nombre> -y

# preciso
npx skills add haui-ju/haui-deck --skill <skill-name> -y
```

## Pendiente

- [ ] Archivos `config` del deck
- [ ] Comandos / CLI propia (alias cortos tipo `deck add design`)
- [ ] Paquetes npm `@haui-deck/*`
- [ ] Más agentes dentro de `suit/design/design/agents/`
- [ ] Skills slash adicionales (`code-review`, …)
