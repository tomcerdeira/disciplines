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
