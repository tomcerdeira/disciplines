# Agent Disciplines Cursor Rule

Apply this rule to coding, debugging, review, research, and automation tasks that are not trivial one-line edits.

Before starting, resolve the task against installed disciplines:

```sh
<AGENT_DISCIPLINES_COMMAND> \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

Use the resolver output as a task-local prelude. Load only the matched discipline's guidance, then map included skill ids and recommended tools to what is available in this Cursor workspace.

When the selected discipline depends on skills, MCPs, CLIs, or services that may not be installed, run:

```sh
npx disciplines prepare installed \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

If readiness reports missing or unknown capabilities, ask the user whether to install/configure them, skip them for now, or continue with available capabilities. When readiness suggests `npx skills add ... --skill ...`, treat it as a proposed Vercel Skills CLI command and run it only after user approval. Do not install anything silently.

Do not treat soft exclusions as refusals. They only keep unrelated context out until user intent or code evidence justifies expansion.
