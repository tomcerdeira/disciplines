# Adapter Notes

Adapters are future work. V1 defines the portable degree format and manual resolution behavior only.

## Generic Prompt-Only Usage

A generic adapter can concatenate:

1. The selected degree markdown body.
2. A short list of included skill ids.
3. A soft-exclusion note.
4. A reminder that excluded skills may be loaded with explicit user request or concrete evidence.

This works even when the agent runtime has no formal skill system.

## Cursor

A Cursor adapter could translate a selected degree into a prompt prelude or project rule. It should not mutate installed rules automatically. The safest first version would generate text the user can review and paste into the relevant Cursor instruction surface.

## Claude Code

A Claude Code adapter could emit an instruction prelude plus a list of local skill or command references. It should keep soft exclusions advisory and avoid hiding files or disabling tools.

## Codex

A Codex adapter could map `includeSkills` to available Codex skills when ids match, then add the degree body as a task-local focus instruction. If a matching skill is unavailable, the adapter should report the missing id rather than silently substituting unrelated context.

## Resolver Output Shape

A future resolver can produce a small bundle:

```json
{
  "degreeId": "frontend-engineer",
  "confidence": 0.78,
  "includeSkills": ["react-best-practices", "frontend-design", "browser-verification"],
  "softExcludeSkills": ["backend-patterns", "database-migrations"],
  "reason": "Task mentions TSX files, layout, and accessibility.",
  "prompt": "You are operating under the Frontend Engineer degree..."
}
```

This is an adapter contract sketch, not a committed runtime API.
