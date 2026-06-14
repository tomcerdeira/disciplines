# Design Principles

## Advisory, Not Enforcing

Disciplines should steer context selection, not police it. A soft exclusion is a reminder to avoid unrelated skill bloat until there is a reason to expand. It is never a hard denial of access to a skill, file, tool, or domain.

## Portable Before Runtime-Specific

The source format should be useful as plain markdown. Runtime adapters can map discipline fields to Cursor, Claude Code, Codex, or prompt-only workflows later, but the discipline package should remain readable and useful without those adapters.

## Small Initial Context

A discipline should help an agent start with the most relevant context. The first bundle should include the selected focus prompt and curated skill ids, not every matching skill body. It should not pull every adjacent domain into the first response.

## Progressive Disclosure Across Disciplines

Discipline selection should itself use progressive disclosure. An agent should first inspect lightweight metadata for all available disciplines, then load only the selected `DISCIPLINE.md` body. It should not load every discipline prompt into context before deciding.

After a discipline is active, the same rule applies to skills and tools: included skill ids and recommended tool ids are a shortlist, not an instruction to load every full skill body or tool guide immediately.

The intended layers are:

1. Discipline metadata across the discipline set.
2. Selected discipline body and frontmatter.
3. Mapped skill/tool metadata from the selected discipline.
4. Full skill bodies, references, scripts, or tool docs only when the task needs them.

## Tools Are Recommendations

Tool recommendations are advisory, like skills. A discipline can say that browser automation, GitHub, a database client, a package manager, or a document tool is usually useful for the domain. It should not assume the tool exists, install it automatically, or invoke it before the task needs it.

When a recommended tool is missing, an adapter should either skip it with a note or ask the user before installing/configuring anything.

## Evidence-Based Expansion

Agents can expand beyond a discipline when there is evidence:

- The user explicitly asks for another domain.
- The files touched by the task cross a boundary.
- Tests, logs, traces, schemas, or runtime errors point to another domain.
- A recommended tool can provide necessary evidence for the selected task.
- The selected discipline cannot complete the task alone.

When expanding, the agent should state the reason briefly.

## Human-Reviewable

The spec should remain easy to review in a pull request. Prefer short `DISCIPLINE.md` entrypoints, obvious ids, and examples that show behavior rather than a large ontology.

## No Universal Taxonomy Yet

The example disciplines are starting points. Teams should adapt names and skill ids to their own installed skills and agent workflows.
