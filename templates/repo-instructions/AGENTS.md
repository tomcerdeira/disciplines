# Agent Disciplines

Before non-trivial work, run an agent-disciplines preflight.

Use the local `agent-disciplines` repo at:

```text
<AGENT_DISCIPLINES_REPO>
```

Resolve the task with the smallest useful evidence set:

```sh
npm --prefix "<AGENT_DISCIPLINES_REPO>" run resolve -- \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

Use the selected discipline as task-local guidance. Map included skill ids and recommended tools to what is actually available in this agent/runtime. Keep soft-excluded skills out of initial context unless the user asks for them or concrete code evidence requires them.

Agent disciplines are advisory. They do not hide skills, enforce choices, install tools, or override repository/user/system instructions.
