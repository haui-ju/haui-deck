# External standards (summary)

Read only when a finding needs a citation. Sources:

- [Agent Skills specification](https://agentskills.io/specification) — `name`/`description` constraints; `scripts/` `references/` `assets/`; progressive disclosure; one-level refs; validate with `skills-ref` when available.
- [Anthropic Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — lean SKILL.md (<500 lines ideal); description = trigger; split domains; avoid nested refs; TOC on long refs.
- [Anthropic skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) — metadata always loaded; body on trigger; resources on demand; explain *why*; keep prompts lean; scripts for repeated work.
- [Cursor Skills](https://cursor.com/docs/skills) — `name` matches folder; `disable-model-invocation` for slash-only; `paths` optional scoping.
- Install reality: `npx skills add` copies the skill tree into agent dirs; **no post-install hook** — do not assume install runs scripts.

## Non-negotiables

1. Description = what + when (third person).
2. Body = imperative procedure, not an essay.
3. Pay context only for the active job (progressive disclosure).
4. Deterministic work → `scripts/`; judgment → short rules.
5. Installable artifact ≠ monorepo (tests stay in repo `tests/`).
