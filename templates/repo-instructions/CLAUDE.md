# Agent Disciplines

Run an agent-disciplines preflight before non-trivial implementation, debugging, review, or research work.

Command shape:

```sh
<AGENT_DISCIPLINES_COMMAND> \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

Use the resolver output as task-local guidance:

- `select` or `compose`: start from the matched discipline prompt.
- `ask`: ask the user to choose or provide stronger evidence.
- `none`: proceed without a discipline or suggest authoring one.

Treat included skills as a shortlist, recommended tools as optional evidence sources, and soft exclusions as advisory boundaries.

When the selected discipline depends on skills, MCPs, CLIs, or services that may not be installed, run:

```sh
npx disciplines prepare installed \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

If readiness reports missing or unknown capabilities, ask the user whether to install/configure them, skip them for now, or continue with available capabilities. When readiness suggests `npx skills add ... --skill ...`, treat it as a proposed Vercel Skills CLI command and run it only after user approval. Do not install anything silently.
