# Composed Degrees

Some tasks need more than one degree. Composition should stay explicit and small.

## Full-Stack Feature

Task:

> Add a billing settings page that lets an admin update invoice recipients.

Primary degree: `frontend-engineer`

Secondary degree: `backend-engineer`

Why:

- The visible workflow is UI-heavy.
- The task also requires API and permission changes.

Composition guidance:

- Start with the primary degree's focus prompt.
- Add only the secondary degree skills needed for the crossed boundary.
- Keep unrelated backend domains excluded unless the implementation touches them.

## Analysis to Automation

Task:

> Analyze failed imports from this CSV, then create a script that retries the safe ones.

Primary degree: `data-analyst`

Secondary degree: `automation-engineer`

Why:

- The first step is evidence and classification.
- The second step is repeatable execution.

Composition guidance:

- Do the analysis before writing automation.
- Make the retry criteria explicit.
- Keep the script idempotent and reviewable.

## Product Discovery to Implementation

Task:

> Turn these interview notes into a small MVP plan and build the first settings screen.

Primary degree: `product-researcher`

Secondary degree: `frontend-engineer`

Why:

- The task starts with synthesis and scope selection.
- It ends with UI implementation.

Composition guidance:

- Use the product degree to define the problem and acceptance criteria.
- Switch to the frontend degree for component work and browser verification.

## Composition Rules

- Prefer one primary degree.
- Add a secondary degree only when the task crosses a concrete boundary.
- Do not merge every skill from both degrees by default.
- Preserve each degree's soft exclusions unless the task supplies evidence to override them.
- If three or more degrees seem necessary, ask the user to narrow the first milestone.
