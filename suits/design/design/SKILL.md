---
name: design
description: >-
  Apply haui-deck UI composition rules for landings, marketing pages, and
  frontend visuals: brand-first hero, expressive typography, atmospheric
  backgrounds, restrained cards, intentional motion, and anti AI-slop patterns.
  Use when the user asks for UI design, redesign, landing pages, visual polish,
  frontend layout, hero sections, branding on a page, or mentions /design.
---

# Design

Playbook de composición UI para agentes. Prioriza una sola idea visual clara por viewport.

## When to use

- Landings, páginas promocionales, redesign visual
- Hero, brand presence, tipografía, atmósfera
- El usuario invoca `/design`

## Principles

1. **One composition** — El primer viewport se lee como una composición, no como un dashboard (salvo que el producto sea un dashboard).
2. **Brand first** — El nombre de marca/producto es señal hero-level, no solo texto de nav. Si quitando el nav la página podría ser de otra marca, el branding es débil.
3. **Typography** — Fuentes expresivas y con propósito. Evitar stacks por defecto (Inter, Roboto, Arial, system) salvo que el sistema del proyecto ya los imponga.
4. **Background** — No planos de un solo color: gradientes, imagen o patrón sutil que den atmósfera.
5. **Full-bleed hero** — En landings, la imagen hero es plano edge-to-edge. Evitar heroes inset, side-panel, cards redondeadas de media, collages o bloques flotantes salvo que el design system del repo lo exija.
6. **Hero budget** — Primer viewport: marca, un headline, una frase de apoyo, un grupo de CTAs, una imagen dominante. Sin stats, schedules, listings, direcciones ni promos secundarias en ese viewport.
7. **No hero overlays** — Sin badges flotantes, stickers, chips o callouts encima del media del hero.
8. **Cards** — Default: sin cards. Nunca en el hero. Solo cuando son contenedor de interacción real; si quitar border/shadow/radius no duele, no es card.
9. **One job per section** — Una sección = un propósito, un headline, una frase de apoyo.
10. **Real visual anchor** — La imagen muestra producto, lugar o contexto. Gradientes abstractos no cuentan como idea visual principal.
11. **Reduce clutter** — Evitar pill clusters, stat strips, icon rows, boxed promos y bloques de texto compitiendo.
12. **Motion** — Al menos 2–3 motions intencionales para presencia y jerarquía, no ruido.
13. **Color** — Dirección clara con CSS variables. Evitar defaults AI-slop: purple-on-white / purple-indigo; cream #F4F1EA + serif + terracotta; broadsheet denso sin radius. Evitar sesgo a dark mode, purple, glow, pills `rounded-full`, multi-shadow, emojis decorativos.
14. **Responsive** — Desktop y mobile cargan bien.

## Workflow

1. Identificar marca, audiencia y una idea visual dominante.
2. Bloquear el primer viewport (hero budget) antes del resto.
3. Definir tokens (color, type, spacing) y aplicar sección a sección (one job each).
4. Pasar el checklist en [references/checklist.md](references/checklist.md).
5. Si el repo ya tiene design system, **respetarlo** y adaptar este playbook a sus patrones.

## Output

- Cambios de UI concretos (código o especificación clara).
- Explicar decisiones solo cuando el usuario lo pida; preferir diffs mínimos.

## Agents

Subagentes opcionales del suit: ver [agents/](agents/).
