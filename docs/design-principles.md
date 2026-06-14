# Design Principles

## Advisory, Not Enforcing

Degrees should steer context selection, not police it. A soft exclusion is a reminder to avoid unrelated skill bloat until there is a reason to expand. It is never a hard denial of access to a skill, file, tool, or domain.

## Portable Before Runtime-Specific

The source format should be useful as plain markdown. Runtime adapters can map degree fields to Cursor, Claude Code, Codex, or prompt-only workflows later, but the degree file should remain readable and useful without those adapters.

## Small Initial Context

A degree should help an agent start with the most relevant context. The first bundle should include the focus prompt and the curated skill ids. It should not pull every adjacent domain into the first response.

## Evidence-Based Expansion

Agents can expand beyond a degree when there is evidence:

- The user explicitly asks for another domain.
- The files touched by the task cross a boundary.
- Tests, logs, traces, schemas, or runtime errors point to another domain.
- The selected degree cannot complete the task alone.

When expanding, the agent should state the reason briefly.

## Human-Reviewable

The spec should remain easy to review in a pull request. Prefer short degree files, obvious ids, and examples that show behavior rather than a large ontology.

## No Universal Taxonomy Yet

The example degrees are starting points. Teams should adapt names and skill ids to their own installed skills and agent workflows.
