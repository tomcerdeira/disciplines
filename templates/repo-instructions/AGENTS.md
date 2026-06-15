# Agent Disciplines

Before non-trivial work, run an agent-disciplines preflight.

Resolve the task with the smallest useful evidence set:

```sh
<AGENT_DISCIPLINES_COMMAND> \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

Use the selected discipline as task-local guidance. Map included skill ids and recommended tools to what is actually available in this agent/runtime. Keep soft-excluded skills out of initial context unless the user asks for them or concrete code evidence requires them.

When the selected discipline depends on skills, MCPs, CLIs, or services that may not be installed, run:

```sh
npx disciplines prepare installed \
  --task "<user task>" \
  --file "<relevant file>" \
  --command "<relevant command>"
```

If readiness reports missing or unknown capabilities, ask the user whether to install/configure them, skip them for now, or continue with available capabilities. When readiness suggests `npx skills add ... --skill ...`, treat it as a proposed Vercel Skills CLI command and run it only after user approval. Do not install anything silently.

Agent disciplines are advisory. They do not hide skills, enforce choices, install tools, or override repository/user/system instructions.
