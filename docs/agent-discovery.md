# Agent Discovery

Disciplines do not require an agent runtime to implement a new protocol. The CLI installs small pieces of agent-native glue that tell Claude Code, Codex, or Cursor to run the discipline resolver before non-trivial work.

## Install Glue

Install the discipline packages only:

```sh
npx disciplines add tomcerdeira/disciplines --all --global --yes
```

Install packages plus all supported agent glue:

```sh
npx disciplines add tomcerdeira/disciplines --all --agent '*' --global --yes
```

For project-local setup, omit `--global`:

```sh
npx disciplines add tomcerdeira/disciplines --all --agent '*' --project --yes
```

## Claude Code

Global install writes:

```text
~/.claude/skills/agent-disciplines/SKILL.md
~/.claude/skills/discipline/SKILL.md
~/.claude/commands/discipline.md
```

Expected behavior:

- Claude Code can discover the `agent-disciplines` skill when a task asks to use disciplines or asks which discipline applies.
- `/discipline <task>` runs the same preflight as the skill and should return the resolver output before implementation work.
- If `/discipline` is missing after installation, restart Claude Code and run `npx disciplines doctor`.

## Codex

Global install writes:

```text
~/.codex/skills/agent-disciplines/SKILL.md
~/.agents/skills/agent-disciplines/SKILL.md
```

Project install writes:

```text
AGENTS.md
```

Expected behavior:

- Codex can discover `agent-disciplines` as a skill in environments that load local skills.
- In project mode, `AGENTS.md` tells Codex to run `npx disciplines use installed` before non-trivial implementation, debugging, review, or research work.
- If the skill is not listed in a new session, run `npx disciplines doctor` and verify the global skill path exists.

## Cursor

Global install writes:

```text
~/.cursor/rules/agent-disciplines.mdc
```

Project install writes:

```text
.cursor/rules/agent-disciplines.mdc
```

Expected behavior:

- Cursor sees the rule as workspace or global rule context, depending on the install scope.
- The rule asks Cursor to run the resolver before non-trivial tasks and use the selected discipline as task-local context.
- Cursor rule loading can vary by workspace settings, so verify with `npx disciplines doctor` and inspect the generated rule when behavior is unclear.

## Prompt-Only Usage

Any agent can use disciplines without installed glue:

```sh
npx disciplines use installed \
  --task "Fix keyboard navigation in the candidates page" \
  --file src/modules/candidates/CandidatesPage.tsx
```

Paste the resolver output above the normal task prompt. Use [templates/adapters/generic-prompt.md](../templates/adapters/generic-prompt.md) when you want a reusable prompt wrapper.

## Capability Readiness

Disciplines can name skills and tools that are useful for a task, but a user's runtime may not have them installed. Agents should run `prepare` when they plan to rely on a selected discipline's skills or recommended tools:

```sh
npx disciplines prepare installed \
  --task "Fix keyboard navigation in the candidates page" \
  --file src/modules/candidates/CandidatesPage.tsx \
  --agent-name codex
```

If `prepare` reports `MISSING` or `UNKNOWN`, the agent should ask the user whether to install/configure the capability, skip it for now, or continue with available capabilities. When `prepare` suggests `npx skills add ... --skill ...`, the agent should present it as the proposed Vercel Skills CLI command and run it only after approval. The agent should not install skills, MCPs, CLIs, plugins, or services silently.

## Verification

Run:

```sh
npx disciplines doctor
npx disciplines smoke
```

`doctor` checks installed stores, manifests, config files, lockfiles, generated agent glue, and stale `agent-degrees` leftovers. `smoke` creates a temporary project, installs a discipline, runs `doctor`, and resolves a realistic task.
