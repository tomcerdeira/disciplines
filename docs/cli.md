# Disciplines CLI

The `disciplines` CLI is a small package manager for discipline packages. It intentionally mirrors the `skills` workflow while keeping disciplines advisory: it installs `DISCIPLINE.md` packages, writes lightweight agent glue when asked, resolves tasks, and prints prompt bundles. It does not hide skills, enforce exclusions, install MCP servers, or install CLIs.

## Commands

```sh
disciplines add <source> [--discipline <ids...>|--all] [--agent <agents...>] [--global|--project] [--copy] [--yes] [--list]
disciplines install [--config path] [--lockfile path] [--no-lock] [--agent <agents...>] [--global|--project] [--copy] [--yes]
disciplines use <source[@discipline]|installed> [--discipline <ids...>] [--task "..."] [--file path] [--command cmd] [--format prompt|json]
disciplines prepare <source[@discipline]|installed> [--discipline <ids...>] [--task "..."] [--file path] [--command cmd] [--agent-name codex|claude-code|cursor|*] [--format prompt|json]
disciplines catalog|browse [query] [--verbose] [--catalog path]
disciplines search [query] [--verbose] [--catalog path]
disciplines list|ls [source] [--global|--project]
disciplines find [query] [--global|--project]
disciplines check [ids...] [--discipline <ids...>] [--global|--project]
disciplines remove|rm [ids...] [--discipline <ids...>] [--all] [--global|--project] [--yes]
disciplines update [ids...] [--discipline <ids...>] [--global|--project] [--yes]
disciplines init [name]
disciplines doctor [--global|--project]
disciplines cleanup [--global|--project] [--disciplines] [--all] [--yes]
disciplines smoke [--source source] [--keep]
```

## Source Formats

```sh
disciplines add owner/disciplines
disciplines add https://github.com/org/disciplines
disciplines add https://github.com/org/disciplines/tree/main/disciplines/software-engineer
disciplines add https://gitlab.com/org/repo
disciplines add https://gitlab.com/org/repo/-/tree/main/disciplines/software-engineer
disciplines add git@github.com:org/disciplines.git
disciplines add ./local-disciplines
```

Use `@id` when selecting one discipline from a source:

```sh
disciplines use owner/disciplines@software-engineer
```

## Install

Install one discipline:

```sh
disciplines add owner/disciplines --discipline software-engineer
```

Install every discipline and every supported adapter globally:

```sh
disciplines add owner/disciplines --all --agent '*' --global --yes
```

Supported agents:

- `claude-code`: writes Claude Code skills and `/discipline` command files.
- `codex`: writes Codex-compatible skill files and project instructions.
- `cursor`: writes Cursor rule files.
- `*`: installs every supported adapter.

If `--agent` is omitted, `add` installs only discipline packages and does not write Claude Code, Codex, or Cursor glue.

Restore from a project config:

```sh
disciplines install
disciplines install --config disciplines.json --project --yes
disciplines install --no-lock
```

`disciplines.json` is intentionally small and portable:

```json
{
  "version": 1,
  "disciplines": [
    {
      "source": "tomcerdeira/disciplines",
      "discipline": "software-engineer",
      "agents": ["codex"]
    }
  ]
}
```

Each entry supports `source`, `discipline` or `disciplines`, `all`, `agents`, and `copy`. Command flags such as `--project`, `--global`, and `--yes` still control the restore scope and overwrite behavior.

By default `install` reads and writes `disciplines-lock.json` beside the config. The lockfile records installed ids, source paths, install modes, and git revisions. Commit it with `disciplines.json` for repeatable setup, or pass `--no-lock` for one-off local restores.

Schemas are available in [../schema/disciplines.config.schema.json](../schema/disciplines.config.schema.json) and [../schema/disciplines.lock.schema.json](../schema/disciplines.lock.schema.json).

Scopes:

- `--project`: installs under `.agents/disciplines/` in the current project.
- `--global`: installs under `~/.agent-disciplines/disciplines/`.
- no scope flag: defaults to `--project` for `add`, and auto-detects project before global for `list`, `find`, `remove`, and `update`.

Installation method:

- default: symlink each installed discipline to the resolved source package.
- `--copy`: copy package files into the target store.

Overwrite behavior:

- Existing target files are not overwritten unless you confirm interactively.
- In non-interactive shells, existing files are skipped unless `--yes` is passed.
- `--yes` overwrites generated adapter files and installed discipline packages.

## Use

Use without installing:

```sh
disciplines use owner/disciplines@software-engineer
```

Resolve a task against installed disciplines:

```sh
disciplines use installed \
  --task "Fix keyboard navigation in the candidates desktop view" \
  --file src/modules/candidates/ui/candidates-page.tsx \
  --command "bun run typecheck"
```

The output is a task-local bundle with selected disciplines, score evidence, included skill ids, recommended tools, soft exclusions, and focus prompts. Use `--format json` when an adapter or script needs structured output.

Adapters can also import the resolver directly:

```ts
import { createResolverBundle, loadDisciplines } from "disciplines/resolver";
```

## Prepare

```sh
disciplines prepare installed \
  --task "Fix keyboard navigation in the candidates desktop view" \
  --file src/modules/candidates/ui/candidates-page.tsx \
  --agent-name codex

disciplines prepare owner/disciplines@software-engineer --agent-name claude-code
disciplines prepare installed --task "Analyze a CSV export" --format json
```

`prepare` resolves the same discipline bundle as `use`, then checks whether the selected discipline's `includeSkills` and `recommendedTools` appear available in the current runtime.

Current detection is intentionally conservative:

- Codex skills: `~/.codex/skills/<id>/SKILL.md` and `~/.agents/skills/<id>/SKILL.md`
- Claude Code skills: `~/.claude/skills/<id>/SKILL.md`
- CLI/runtime tools: executable on `PATH`
- package managers: lockfile-aware `bun`, `pnpm`, `yarn`, then `npm`
- MCPs and services: reported as `UNKNOWN` unless a runtime adapter can prove availability

The command does not install missing capabilities. Its prompt output tells the agent to ask the user whether to install/configure missing or unknown skills, MCPs, CLIs, plugins, or services, skip them for now, or continue with available capabilities.

When a discipline declares `skillInstallHints`, `prepare` includes Vercel Skills CLI commands for missing skills. For example:

```text
install after approval: npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
```

Agents should treat those commands as proposed actions, not automatic actions. Ask the user first, then run the approved `npx skills add ... --skill ...` command.

## Catalog, Browse, and Search

```sh
disciplines catalog
disciplines browse frontend --verbose
disciplines search react
```

`catalog`, `browse`, and `search` inspect the package-shipped catalog at [../catalog/disciplines.json](../catalog/disciplines.json). They do not require installed disciplines and they do not call a hosted registry.

Use `--verbose` to print descriptions, tags, recommended tool hints, and a copyable install command:

```sh
disciplines add owner/disciplines --discipline software-engineer
```

Use `--catalog path/to/catalog.json` to test a local catalog file with the same schema.

## List and Find

```sh
disciplines list
disciplines ls --global
disciplines list owner/disciplines --discipline software-engineer
disciplines find react
```

`list` without a source shows installed disciplines. `list <source>` inspects a source without installing. `find` searches installed disciplines by id, name, description, aliases, included skills, and recommended tools.

## Check, Remove, and Update

```sh
disciplines check
disciplines check software-engineer --global
disciplines remove software-engineer
disciplines rm --all --global --yes
disciplines update
disciplines update software-engineer --project
```

`check` fetches git metadata for installed sources and compares each manifest-recorded revision with the latest known source revision. It reports `UPDATE` rows when newer source revisions are available, but it does not relink, recopy, or otherwise mutate installed packages.

`update` refreshes cached git sources and relinks or recopies installed packages based on their manifest entries.

Each project or global store includes a local `.disciplines-manifest.json`. The manifest records source roots, source paths, install mode, and git revisions. `doctor` validates this manifest and warns about entries that no longer have an installed package.

## Init

```sh
disciplines init software-engineer
```

This creates `software-engineer/DISCIPLINE.md` from the template.

Names are normalized into schema-valid ids, so `disciplines init "Software Engineer"` also creates `software-engineer/DISCIPLINE.md`.

In an interactive terminal, `disciplines init` prompts for a name with Clack. In non-interactive shells it keeps the script-friendly behavior of creating `DISCIPLINE.md` in the current directory.

## Doctor

```sh
disciplines doctor
disciplines doctor --project
disciplines doctor --global
```

`doctor` checks project and global discipline stores, manifests, symlinks, resolver health, project `disciplines.json`, project `disciplines-lock.json`, installed agent glue, and old `agent-degrees` files that may need cleanup. Missing installs are warnings. Broken installed packages, invalid manifests, invalid config, and invalid lockfiles are failures.

## Cleanup

```sh
disciplines cleanup
disciplines cleanup --global --yes
disciplines cleanup --project --yes
disciplines cleanup --global --disciplines --yes
```

`cleanup` removes stale `agent-degrees` artifacts from older installs, such as `/degree`, `agent-degrees` skills, and old Cursor rules. By default it does not remove current `agent-disciplines` installs. Add `--disciplines` or `--all` when you also want to remove current discipline stores, manifests, source cache entries, and installed agent glue.

## Smoke

```sh
disciplines smoke --source owner/disciplines
disciplines smoke --source . --keep
```

`smoke` creates a temporary project, installs a discipline with project Codex glue, runs `list`, resolves a realistic task with `use installed`, and runs `doctor --project`.

Use `--source` to test a GitHub repo, GitLab repo, git URL, or local path that contains at least one discipline package. Use `--keep` when you want to inspect the temporary project after the run.
