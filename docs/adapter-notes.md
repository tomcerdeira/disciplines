# Adapter Notes

Adapters are future work. V1 defines the portable degree format and manual resolution behavior only.

## Shared Loading Model

Adapters should mirror skill-style progressive disclosure:

1. Read lightweight metadata for every degree package: folder id, `name`, `description`, `activation`, aliases, and thresholds.
2. Resolve the task to `select`, `compose`, `ask`, or `none`.
3. Load the full body only for selected degree packages.
4. Map `includeSkills` and `recommendedTools` to runtime-specific skills, tools, MCPs, CLIs, or commands.
5. Load full skill bodies, tool docs, or adapter-specific resources only after that mapping shows they are relevant.

Do not concatenate every degree body into the initial prompt. The degree layer should reduce context before the skill layer expands it.

## Generic Prompt-Only Usage

A generic adapter can first show or consider the available degree metadata, then concatenate:

1. The selected degree markdown body.
2. A short list of included skill ids.
3. A short list of recommended tools, grouped by kind.
4. A short explanation of matched activation signals when useful.
5. A soft-exclusion note.
6. A reminder that excluded skills may be loaded with explicit user request or concrete evidence.

This works even when the agent runtime has no formal skill system.

## Cursor

A Cursor adapter could translate a selected degree into a prompt prelude or project rule. It should not mutate installed rules automatically. The safest first version would generate text the user can review and paste into the relevant Cursor instruction surface.

Cursor output should be generated from selected degree packages only. Degree metadata can be indexed broadly, but full degree bodies should stay out of the prompt until selected.

If the degree recommends tools, Cursor output should describe them as preferred evidence sources or commands. It should not assume MCPs or CLIs are configured unless the local environment confirms them.

## Claude Code

A Claude Code adapter could emit an instruction prelude plus a list of local skill or command references. It should keep soft exclusions advisory and avoid hiding files or disabling tools.

It should resolve from degree metadata first, then load only the selected `DEGREE.md` body before suggesting local skills or commands.

Recommended CLIs can be rendered as suggested commands or tool preferences. Recommended MCPs should be rendered only when the adapter can map the portable id to a configured MCP server.

## Codex

A Codex adapter could map `includeSkills` to available Codex skills when ids match, then add the degree body as a task-local focus instruction. If a matching skill is unavailable, the adapter should report the missing id rather than silently substituting unrelated context.

Codex already exposes skill metadata before loading skill bodies. A Codex degree adapter should do the same for degree metadata: select the degree first, load its body second, and then load mapped skill bodies only as needed.

Recommended tools can map to Codex MCP tools, shell CLIs, browser tools, or app connectors. Missing tools should be reported explicitly, and installations should remain user-approved.

## Resolver Output Shape

A future resolver can produce a small bundle:

```json
{
  "decision": "select",
  "selectedDegrees": [
    {
      "id": "frontend-engineer",
      "role": "primary",
      "confidence": 0.78
    }
  ],
  "activationMatches": [
    {
      "degreeId": "frontend-engineer",
      "pathPatterns": ["**/*.tsx"],
      "commandPatterns": [],
      "promptSignals": ["TSX files", "layout", "accessibility"]
    }
  ],
  "includeSkills": ["react-best-practices", "frontend-design", "browser-verification"],
  "recommendedTools": [
    {
      "id": "browser",
      "kind": "mcp",
      "purpose": "Inspect and verify user-visible behavior in a real browser."
    },
    {
      "id": "package-manager",
      "kind": "package-manager",
      "purpose": "Run the repository's configured frontend scripts such as typecheck, lint, test, and build."
    }
  ],
  "softExcludeSkills": ["backend-patterns", "database-migrations"],
  "reason": "Task mentions TSX files, layout, and accessibility.",
  "prompt": "You are operating under the Frontend Engineer degree..."
}
```

This is an adapter contract sketch, not a committed runtime API.
