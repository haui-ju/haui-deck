# Review checklist (haui-deck)

TOC: [Spec](#1-spec--frontmatter) · [Triggering](#2-triggering--description) · [Disclosure](#3-progressive-disclosure) · [Tokens](#4-token-economy) · [Responsibility](#5-responsibility-split) · [Install](#6-install-footprint) · [Layout](#7-repo--suit-layout) · [Docs](#8-docs-sync)

Any **Critical** miss ⇒ overall FAIL.

## 1. Spec / frontmatter

| ID | Check | Sev |
|----|--------|-----|
| S1 | `SKILL.md` starts with YAML `---` … `---` | Critical |
| S2 | Required fields: `name`, `description` (non-empty) | Critical |
| S3 | `name` matches folder; `^[a-z0-9]+(-[a-z0-9]+)*$`; ≤64 chars; no leading/trailing/consecutive hyphens ([agentskills.io](https://agentskills.io/specification)) | Critical |
| S4 | `description` ≤1024 chars | Critical |
| S5 | Unknown frontmatter keys are intentional or removed | Nit |
| S6 | Optional `compatibility` only if real env constraints exist | Nit |

## 2. Triggering / description

| ID | Check | Sev |
|----|--------|-----|
| G1 | Description is third person; states **what** and **when** (triggers) | Critical |
| G2 | Includes concrete user phrases and `/skill-name` when slash-invoked | Warning |
| G3 | Not vague (“helps with X”) and not absurdly narrow | Warning |
| G4 | Pushy enough to avoid under-trigger; not so broad it steals unrelated tasks | Warning |
| G5 | Side-effect / slash workflows set `disable-model-invocation: true` (Cursor) | Critical |
| G6 | Auto-context skills omit `disable-model-invocation` on purpose | Warning |

## 3. Progressive disclosure

| ID | Check | Sev |
|----|--------|-----|
| P1 | SKILL.md body lean (prefer ≪500 lines; aim few screens) | Warning |
| P2 | Details live in `references/` / `assets/` with **when to read** pointers | Warning |
| P3 | References are **one level deep** from SKILL.md (no reference chains) | Critical |
| P4 | Long refs (>100 lines) have a TOC | Nit |
| P5 | Domain variants split by file; SKILL.md only routes | Warning |
| P6 | No duplicate “When to Use” essay that repeats the description | Warning |

## 4. Token economy

| ID | Check | Sev |
|----|--------|-----|
| E1 | No meta-essays paid on every invoke (“don’t run every time…”) — encode as a one-line rule or move to init | Critical |
| E2 | Imperative steps; no motivational filler | Warning |
| E3 | Tables/lists over paragraphs where possible | Nit |
| E4 | Examples are minimal and concrete | Nit |
| E5 | Does not instruct loading large unrelated files “just in case” | Critical |

## 5. Responsibility split

| ID | Check | Sev |
|----|--------|-----|
| J1 | One job per skill | Critical |
| J2 | Init/scaffold ≠ action/make (separate skills) | Critical |
| J3 | Action skills **read** project config; they do not re-bootstrap every call | Critical |
| J4 | Smoke/test skills do not load DESIGN/PRODUCT/.haui-deck | Warning |
| J5 | Fragile FS/config done via `scripts/`; prose does not improvise paths | Warning |

## 6. Install footprint

| ID | Check | Sev |
|----|--------|-----|
| I1 | Skill dir contains only runtime: `SKILL.md`, prod `scripts/`, useful `references/`/`assets/` | Critical |
| I2 | No `*.test.*`, fixtures, or maintainer-only docs inside the skill | Critical |
| I3 | Repo tests live under `tests/` (or equivalent outside installable skill dirs) | Critical |
| I4 | No secrets, `.env`, or machine-local paths hardcoded | Critical |

## 7. Repo / suit layout

| ID | Check | Sev |
|----|--------|-----|
| L1 | Product skills under `suit/<suit>/<skill>/` | Critical |
| L2 | Repo meta skills (e.g. `review-skill`) at **repo root**, not inside a product suit | Critical |
| L3 | No orphan `SKILL.md`, half-deleted trees, or stale paths in docs | Critical |
| L4 | Suit README lists exactly the skills that exist | Warning |
| L5 | haui-deck design rules in [haui-deck.md](haui-deck.md) applied when reviewing `suit/design/*` | Critical |

## 8. Docs sync

| ID | Check | Sev |
|----|--------|-----|
| O1 | Root README skill table matches reality | Warning |
| O2 | `AGENTS.md` matches current init/action/token rules | Warning |
| O3 | `draft.md` not treated as shipped behavior | Nit |
