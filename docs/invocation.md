# Invoking Agent Disciplines

The v1 resolver works without runtime integration, but you can make it feel more like a skill by adding lightweight entrypoints to the agents and repos where you work.

The easiest path is the CLI:

```sh
npx disciplines add tomcerdeira/agent-disciplines --agent claude-code --global --yes
npx disciplines add . --agent '*' --project --yes
```

See [cli.md](cli.md) for supported sources, agents, scopes, and overwrite behavior. The manual options below are useful when you want to inspect or customize the generated files.

## Options

### 1. Meta-Skill

Copy [../templates/meta-skill/agent-disciplines/SKILL.md](../templates/meta-skill/agent-disciplines/SKILL.md) into a skill-capable runtime.

Example:

```text
agent-disciplines/
  SKILL.md
```

Then invoke it with language such as:

```md
Use agent-disciplines for this task: fix keyboard shortcuts in the candidates page.
```

The skill tells the agent to run the resolver first, then load the matched discipline guidance before expanding into task-specific skills and tools.

### 2. Repo Instructions

Copy one of the repo snippets into projects where disciplines should be checked automatically:

- [AGENTS.md](../templates/repo-instructions/AGENTS.md)
- [CLAUDE.md](../templates/repo-instructions/CLAUDE.md)
- [cursor-rule.md](../templates/repo-instructions/cursor-rule.md)

Replace `<AGENT_DISCIPLINES_REPO>` with the absolute path to your cloned `agent-disciplines` repo.

These snippets make discipline preflight part of the project workflow without installing an MCP server or plugin.

### 3. Slash or Custom Command

Use [../templates/commands/discipline.md](../templates/commands/discipline.md) as the body for a slash/custom command in runtimes that support them.

For shell-friendly workflows, copy [../templates/commands/discipline.sh](../templates/commands/discipline.sh) somewhere on your path and set:

```sh
export AGENT_DISCIPLINES_HOME="/absolute/path/to/agent-disciplines"
```

Then run:

```sh
discipline.sh "Fix keyboard navigation in SearchResults.tsx" --file src/components/SearchResults.tsx
```

## Behavior

All invocation options preserve the same rules:

- Disciplines are advisory.
- Soft exclusions are not refusals.
- Missing skills and tools should be reported, not silently substituted.
- No tools or plugins are installed automatically.
- The resolver output is task-local guidance and does not override higher-priority instructions.
