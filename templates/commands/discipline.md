# `/discipline <task>` Command Template

Use this as the body for a custom command in an agent that supports slash/custom commands.

## Purpose

Resolve the requested task against `agent-disciplines` and return the selected discipline prelude.

The result is advisory and task-local. It guides which discipline, skills, and tools should enter context first, but it does not hide capabilities or override user, repository, system, or developer instructions.

## Command Body

````md
Resolve this task with agent-disciplines before doing implementation work:

Task:
<COMMAND_ARGUMENTS>

Run:

```sh
npx disciplines use installed --task "<COMMAND_ARGUMENTS>"
```

If relevant files, commands, logs, or errors are already known, include them as `--file` and `--command` arguments.

Then check whether the selected discipline's skills and recommended tools are available:

```sh
npx disciplines prepare installed --task "<COMMAND_ARGUMENTS>"
```

Return the resolver output first. If readiness reports missing or unknown capabilities, ask the user whether to install/configure them, skip them for now, or continue with available capabilities. When readiness suggests `npx skills add ... --skill ...`, treat it as a proposed Vercel Skills CLI command and run it only after user approval. Do not install anything silently.

Then proceed with the task under the selected discipline. If the resolver returns `ask`, ask the user to choose. If it returns `none`, proceed without a discipline and mention that no discipline matched.
````
