# Validation Matrix

Use this matrix to manually evaluate whether degrees reduce unrelated context without blocking useful expansion.

| Scenario | Input signal | Expected degree behavior | Success check |
| --- | --- | --- | --- |
| Frontend task with many backend skills installed | TSX file, layout issue, accessibility request | Select `frontend-engineer`; keep backend and database skills soft-excluded | First plan focuses on component, styling, a11y, and browser verification |
| Backend API task with tempting frontend context | Endpoint, auth, unit tests | Select `backend-engineer`; keep UI and browser skills soft-excluded | First plan reads API path and tests before discussing UI |
| Dataset analysis | CSV, trend, chart request | Select `data-analyst`; avoid runtime implementation skills | Output includes assumptions, data checks, and chart/report plan |
| Workflow automation | Repeatable task, GitHub Actions, schedule, webhook, or script | Select `automation-engineer`; avoid research and visual design skills | Plan covers inputs, permissions, retries, idempotency, and verification |
| Product research | Interview notes, PRD, market context, requirements | Select `product-researcher`; avoid implementation skills | Output synthesizes user needs and tradeoffs before code details |
| Full-stack task | UI plus API or persistence change | Select one primary degree and add one secondary degree for the crossed boundary | Context stays bounded; secondary skills are justified by concrete evidence |
| Debugging crosses a boundary | Initial degree is plausible, but logs or errors point elsewhere | Expand beyond the selected degree | Agent states why the soft exclusion was overridden |
| Ambiguous request | Broad phrase such as "improve onboarding" | Ask the user to choose or narrow the first milestone | Agent does not pretend high confidence from weak hints |

## Review Questions

- Did the chosen degree match the strongest task evidence?
- Were excluded skills kept out of the initial context?
- Did the agent expand when concrete evidence required another domain?
- Was any expansion explained briefly?
- Was the resulting context smaller and easier to audit than loading every available skill?
