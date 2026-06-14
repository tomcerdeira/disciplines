# Validation Matrix

Use this matrix to manually evaluate whether disciplines reduce unrelated context without blocking useful expansion.

| Scenario | Input signal | Expected discipline behavior | Success check |
| --- | --- | --- | --- |
| Frontend task with many backend skills installed | TSX file, layout issue, accessibility request | Select `frontend-engineer`; recommend browser and package-manager tools; keep backend and database skills soft-excluded | First plan focuses on component, styling, a11y, and browser verification |
| Backend API task with tempting frontend context | Endpoint, auth, unit tests | Select `backend-engineer`; recommend source-control, test, database, and observability tools as needed; keep UI and browser skills soft-excluded | First plan reads API path and tests before discussing UI |
| Dataset analysis | CSV, trend, chart request | Select `data-analyst`; recommend Python, spreadsheet, or SQL tools; avoid runtime implementation skills | Output includes assumptions, data checks, and chart/report plan |
| Workflow automation | Repeatable task, GitHub Actions, schedule, webhook, or script | Select `automation-engineer`; recommend shell, GitHub, CI, and scheduler tools; avoid research and visual design skills | Plan covers inputs, permissions, retries, idempotency, and verification |
| Product research | Interview notes, PRD, market context, requirements | Select `product-researcher`; recommend web, document, and issue-tracking tools; avoid implementation skills | Output synthesizes user needs and tradeoffs before code details |
| Full-stack task | UI plus API or persistence change | Select one primary discipline and add one secondary discipline for the crossed boundary | Context stays bounded; secondary skills are justified by concrete evidence |
| Debugging crosses a boundary | Initial discipline is plausible, but logs or errors point elsewhere | Expand beyond the selected discipline | Agent states why the soft exclusion was overridden |
| Ambiguous request | Broad phrase such as "improve onboarding" | Ask the user to choose or narrow the first milestone | Agent does not pretend high confidence from weak hints |

## Review Questions

- Did the chosen discipline match the strongest task evidence?
- Were recommended tools relevant to the selected task?
- Did the agent avoid assuming unavailable tools were installed?
- Were excluded skills kept out of the initial context?
- Did the agent expand when concrete evidence required another domain?
- Was any expansion explained briefly?
- Was the resulting context smaller and easier to audit than loading every available skill?
