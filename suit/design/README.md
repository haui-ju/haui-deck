# Suit: design

Skills de diseño UI / frontend visual.

## Install

```bash
# interactivo (elige agentes)
npx skills add haui-ju/haui-deck/suit/design

# sin prompts, agentes concretos
npx skills add haui-ju/haui-deck/suit/design --agent cursor --agent claude-code -y

# preciso
npx skills add haui-ju/haui-deck --skill design -y
npx skills add haui-ju/haui-deck --skill deck-hola-mundo -y

# quitar (por nombre de skill, no por URL)
npx skills remove design deck-hola-mundo -y
```

## Skills

| Skill | Slash | Rol |
|-------|-------|-----|
| [`design`](design/) | `/design` | Playbook de composición UI |
| [`deck-hola-mundo`](deck-hola-mundo/) | `/deck-hola-mundo` | Smoke test del suit |
