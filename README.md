# Agent Disciplines

Agent disciplines are portable capability profiles for coding agents. A discipline does not install, hide, or enforce skills. It curates which skills and focus instructions are likely to matter for a task, and it names the adjacent skills that should stay out of context unless the task gives concrete evidence for them.

The goal of this repository is to define a small, reviewable spec for discipline packages before building any runtime. A discipline should help an agent start with the right context, avoid unrelated skill bloat, and still remain free to expand when the user asks or the code demands it.

## Problem

Modern agent environments can accumulate many skills: React, databases, testing, observability, documents, deployment, browser automation, and more. More skills are useful over time, but they create a context-selection problem:

- The agent may load broad or unrelated instructions before understanding the task.
- Domain-specific instructions can compete with each other.
- A simple task can become noisy because every adjacent capability looks available.
- Different agent runtimes use different skill formats, making curation hard to reuse.

Disciplines provide a portable curation layer above skills. They describe which skills to consider first, when a discipline should activate, and which adjacent skills should be treated as soft exclusions.

## Vocabulary

- **Discipline**: A named capability profile for an agent, stored as a package folder with a `DISCIPLINE.md` entrypoint.
- **Skill**: A runtime-specific instruction bundle, tool guide, or reusable workflow that a discipline can reference by id.
- **Included skill**: A skill id that belongs on the discipline's initial shortlist before full skill bodies are loaded.
- **Recommended tool**: An advisory tool reference, such as an MCP server, CLI, browser, package manager, runtime, or external service.
- **Soft exclusion**: A skill or skill family that should not be loaded by default, but may be loaded when explicitly requested or supported by concrete task evidence.
- **Activation signal**: A structured path pattern, command pattern, prompt signal, or score threshold that helps map a user task to a discipline.
- **Focus prompt**: The markdown body of `DISCIPLINE.md`. It tells the agent how to behave while operating under that discipline.
- **Resolver**: An advisory process or script that compares a task against available disciplines and emits a context bundle.

## Progressive Disclosure

Disciplines should load the same way effective skills load: start with lightweight metadata, then expand only when the task matches.

1. **Discipline metadata**: The agent sees each discipline package id, `name`, `description`, and `activation` signals. This is enough to decide whether a discipline might fit.
2. **Matched `DISCIPLINE.md` body**: After a discipline is selected or composed, the agent loads that discipline's focus prompt, included skill ids, recommended tools, and soft exclusions.
3. **Mapped skills and tools**: The agent then maps `includeSkills` and `recommendedTools` to what the current runtime actually has. Missing skills or tools are reported, not silently replaced.
4. **Skill/resource expansion**: Only after the discipline is active should the agent load the full bodies of matching skills or tool-specific instructions. Soft-excluded skills stay out unless user intent or concrete evidence justifies them.

This keeps the initial context small across both the discipline set and the skill set. A discipline is not itself a runtime skill; it is the layer that decides which skills and tools deserve attention first.

## Package Format

Disciplines are directory packages. The folder name is the canonical package id, and it must match the frontmatter `id`.

```text
disciplines/
  frontend-engineer/
    DISCIPLINE.md
```

`DISCIPLINE.md` uses markdown with YAML frontmatter:

```yaml
---
id: frontend-engineer
name: Frontend Engineer
version: 0.1.0
description: Focuses agents on UI implementation, accessibility, and browser verification.
includeSkills:
  - react-best-practices
  - frontend-design
  - browser-verification
softExcludeSkills:
  - backend-patterns
  - database-migrations
recommendedTools:
  - id: browser
    kind: mcp
    purpose: Verify UI behavior in a real browser.
    when: Use after visible UI changes or when debugging browser-only behavior.
  - id: package-manager
    kind: package-manager
    purpose: Run the repository's configured frontend scripts and package checks.
    when: Prefer the package manager required by local repo instructions.
activation:
  pathPatterns:
    - "**/*.tsx"
    - "src/components/**"
  commandPatterns:
    - "\\b(npm|pnpm|bun|yarn)\\s+run\\s+(dev|build|lint|test)\\b"
  promptSignals:
    phrases:
      - TSX files
      - layout
      - accessibility
    allOf:
      - [browser, verify]
    anyOf:
      - React
      - ARIA
    noneOf:
      - database migration
  minScore: 6.5
---

You are operating under the Frontend Engineer discipline.
Prefer UI, interaction, accessibility, and browser-verification context.
Only load backend, database, or infrastructure skills when the user explicitly asks or the task directly touches those files.
```

The portable schema lives at [schema/discipline.schema.json](schema/discipline.schema.json). The markdown body is intentionally free-form so each runtime can preserve its natural prompt style. See [docs/authoring-disciplines.md](docs/authoring-disciplines.md) before adding new discipline packages.

To start a new discipline, copy [templates/discipline/DISCIPLINE.md](templates/discipline/DISCIPLINE.md) into a new folder such as `disciplines/software-engineer/DISCIPLINE.md`, then update the folder name, frontmatter `id`, activation signals, skill ids, tool recommendations, and focus prompt.

## Intended Workflow

1. A user gives the agent a task.
2. The agent, user, or resolver compares the task with lightweight discipline metadata and `activation` signals.
3. The best matching discipline is selected or composed. If confidence is low, the agent asks the user to choose.
4. The agent loads only the selected discipline's `DISCIPLINE.md` body and frontmatter bundle.
5. The agent maps the discipline's `includeSkills` and `recommendedTools` to available local skills, MCPs, CLIs, package managers, runtimes, or services.
6. The agent loads matching skill bodies or tool instructions only when they are needed for the task.
7. The agent treats `softExcludeSkills` as advisory boundaries, not hard blocks.
8. If direct evidence appears, the agent may load an excluded or adjacent skill and should state why.

## Prompt-Only Usage

V1 includes a small resolver script that turns a normal task into a copy-paste discipline bundle. It is advisory and local: it reads discipline metadata, selects/composes/asks/none, and prints the selected discipline prompt plus skill/tool shortlists. It does not install tools, hide skills, or run task commands.

```sh
npm run resolve -- \
  --task "Fix keyboard shortcuts in the desktop candidates page" \
  --file src/modules/candidates/client/hooks/use-candidates-page.ts \
  --file src/modules/candidates/ui/candidate-bucket-tabs.tsx \
  --command "bun run typecheck"
```

Paste the prompt output above your normal request in Cursor, Claude Code, Codex, or a generic chat model. For integrations or debugging, emit structured JSON instead:

```sh
npm run resolve -- --format json --task "Analyze exports/activation.csv" --file exports/activation.csv
```

Copy-paste templates live in [templates/adapters/](templates/adapters/). They provide task-local preludes for generic chat, Cursor, Claude Code, and Codex.

If the resolver returns `ask`, choose the discipline manually or provide stronger task/file/command evidence. If it returns `none`, proceed without a discipline or author a new one.

## CLI Usage

The `disciplines` CLI wraps the same resolver and installs lightweight invocation glue for supported agents.

```sh
npx disciplines list .
npx disciplines use . --task "Fix keyboard navigation in SearchResults.tsx" --file src/components/SearchResults.tsx
npx disciplines add tomcerdeira/agent-disciplines --agent claude-code --global --yes
```

`disciplines add` can install Claude Code, Codex, and Cursor entrypoints such as meta-skills, slash/custom commands, and repo instruction snippets. It asks before overwriting existing files unless `--yes` is passed. It still preserves the v1 advisory model: no hard enforcement, no automatic tool/plugin installation, and no mutation of installed skills beyond explicitly requested adapter files.

See [docs/cli.md](docs/cli.md) for source formats, flags, scopes, and examples.

## Skill-Like Invocation

To reduce copy-paste, use the lightweight invocation templates in [docs/invocation.md](docs/invocation.md):

- copy the `agent-disciplines` meta-skill into a skill-capable runtime
- add repo snippets to `AGENTS.md`, `CLAUDE.md`, or Cursor rules
- create a `/discipline <task>` custom command that runs the resolver

These entrypoints make agents check disciplines before work without installing an MCP server, mutating runtime configuration, or enforcing discipline choices.

## Example Disciplines

This repo includes advisory discipline examples:

- [Frontend Engineer](disciplines/frontend-engineer/DISCIPLINE.md)
- [Backend Engineer](disciplines/backend-engineer/DISCIPLINE.md)
- [Data Analyst](disciplines/data-analyst/DISCIPLINE.md)
- [Automation Engineer](disciplines/automation-engineer/DISCIPLINE.md)
- [Product Researcher](disciplines/product-researcher/DISCIPLINE.md)

These are examples, not a universal ontology. Real teams should rename skills to match their installed skill ids and local conventions.

## V1 Scope

This first version is deliberately spec-first:

- No full runtime integration or agent plugin.
- No hidden state beyond explicitly requested adapter files and source cache entries.
- No mutation of unrelated installed skills.
- No automatic installation of MCP servers, CLIs, or services.
- No hard enforcement of exclusions.
- No claim that one discipline must cover every task.

Future adapters can translate the same discipline packages into Cursor, Claude Code, Codex, or generic prompt-only workflows. See [docs/adapter-notes.md](docs/adapter-notes.md).

Resolver behavior is specified in [docs/resolver-spec.md](docs/resolver-spec.md). V1 includes a local prompt-only resolver script for usability, but treats resolution as advisory semantics rather than runtime enforcement.

## Manual Validation

Use [examples/task-resolution.md](examples/task-resolution.md), [examples/composed-disciplines.md](examples/composed-disciplines.md), [examples/resolver-output.jsonc](examples/resolver-output.jsonc), and [examples/validation-matrix.md](examples/validation-matrix.md) to test whether a discipline makes the initial context smaller and more relevant. The expected v1 outcome is better steering, not perfect classification.

Use [docs/manual-evaluation.md](docs/manual-evaluation.md) and the bundles in [examples/manual-bundles/](examples/manual-bundles/) to compare baseline agent behavior against discipline-guided behavior on real tasks.

## Repository Validation

Run the local validator before changing discipline packages:

```sh
npm run resolve -- --task "Fix keyboard navigation in SearchResults.tsx" --file src/components/SearchResults.tsx
npm run validate
npm run check:fixtures
```

The resolver command prints an advisory prompt bundle for real tasks. The validator checks the portable schema JSON, package layout, frontmatter, required fields, duplicate ids, skill ids, recommended tool entries, resolver fixture shape, and non-empty markdown bodies. The fixture check runs the same resolver heuristic against fixture cases to pressure-test activation metadata. None of these scripts execute recommended tools.
