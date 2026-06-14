# Disciplines CLI

The `disciplines` CLI is a thin installer and resolver wrapper for discipline packages. It keeps v1 advisory: it writes invocation files when asked, runs the local resolver, and prints discipline guidance. It does not hide skills, enforce exclusions, install MCP servers, or install CLIs.

## Commands

```sh
disciplines list [source]
disciplines use <source> --task "..." [--file path] [--command cmd] [--format prompt|json]
disciplines add <source> [--agent claude-code|codex|cursor|*] [--global|--project] [--copy] [--yes] [--list]
```

`source` can be a local path, a GitHub URL, or a GitHub shorthand:

```sh
disciplines list .
disciplines list https://github.com/tomcerdeira/agent-disciplines
disciplines list tomcerdeira/agent-disciplines
```

## Resolve a Task

Use `disciplines use` when you want a copy-paste prelude for a normal agent task:

```sh
disciplines use . \
  --task "Fix keyboard navigation in the candidates desktop view" \
  --file src/modules/candidates/ui/candidates-page.tsx \
  --command "bun run typecheck"
```

The output is a task-local bundle with the selected discipline, score evidence, included skill ids, recommended tools, soft exclusions, and the discipline focus prompt. Use `--format json` when an adapter or script needs structured output.

## Install Invocation Glue

Use `disciplines add` when you want agents to discover discipline preflight without manually copying templates.

```sh
disciplines add tomcerdeira/agent-disciplines --agent claude-code --global --yes
disciplines add . --agent codex --project --yes
disciplines add . --agent cursor --project --yes
disciplines add . --agent '*' --global --project --yes
```

Supported agents:

- `claude-code`: writes Claude Code skill and `/discipline` command files.
- `codex`: writes Codex-compatible skill files and project instructions.
- `cursor`: writes Cursor rule files.
- `*`: installs every supported adapter.

Scopes:

- `--global`: writes to the agent's user-level configuration directory.
- `--project`: writes repo-local instruction or command files under the current working directory.
- no scope flag: defaults to `--global`.

Source handling:

- GitHub sources are cloned into `~/.agent-disciplines/sources/`.
- Local sources are referenced in place by default.
- `--copy` copies a local source into `~/.agent-disciplines/sources/` and reuses an existing cached copy if present.

Overwrite behavior:

- Existing target files are not overwritten unless you confirm interactively.
- In non-interactive shells, existing files are skipped unless `--yes` is passed.
- `--yes` overwrites generated adapter files.

## Inspect Before Installing

Use `--list` with `add` to inspect a source before writing adapter files:

```sh
disciplines add tomcerdeira/agent-disciplines --list
```

This resolves the source and lists the available discipline packages.
