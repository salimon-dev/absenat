---
name: create-task
description: Use in this Absenat project when the user gives a broad or rough task description and wants Codex to inspect the current project, expand it into a detailed implementation task grounded in this codebase, create it as a GitHub issue in the repository, and assign it to salimon-suma.
metadata:
  version: 1.0.0
disable-model-invocation: false
---

# Create Task

Turn a high-level user request into a detailed, codebase-aware GitHub issue task for this repository.

Default GitHub repository: `salimon-dev/absenat`.
Required assignee: `salimon-suma`.
Task authoring stance: act as a product owner. Use creative product judgment to shape the task into a coherent player-facing outcome when the user gives a broad request.

## Workflow

1. Read the user's rough task description and identify the intended product change, bug fix, refactor, or research outcome.
2. Inspect the project before writing the task:
   - Read repository guidance such as `AGENTS.md`, `CLAUDE.md`, `README.md`, and relevant docs when present.
   - Search with `rg` or `rg --files` for related components, routes, scenes, services, types, tests, scripts, or assets.
   - Open only the files needed to understand existing patterns, constraints, and likely implementation points.
3. Create one GitHub issue in `salimon-dev/absenat` using the GitHub connector when available.
   - Set the issue title to a concise task title.
   - Assign the issue to `salimon-suma`.
   - Do not create a local `tasks/` file unless the user explicitly asks for one or GitHub issue creation is unavailable.
4. The issue body must contain exactly these top-level sections in this order:

```markdown
Status: To Do

## Description

...
```

## Description Content

Make the description detailed enough for another engineer or agent to implement without redoing the initial discovery. Include:

- Problem or goal in project terms.
- Product-owner framing: describe the player or user value, and use creativity to make the task cohesive when the request leaves room for interpretation.
- Current codebase findings with file paths.
- Expected behavior and acceptance criteria.
- Likely files or modules to change.
- Constraints from repository instructions, architecture, style, or tests.
- Suggested verification commands or manual checks.
- Completion evidence: screenshots of the added feature for UI or gameplay changes, or concrete validation of the bug fix for defect work.
- Open questions only when the codebase scan cannot resolve an important ambiguity.

Keep the task actionable, not speculative. If a detail is inferred from code, say so. If the user explicitly gives a required status, use it; otherwise use `To Do`.

## GitHub Issue Creation

Use the GitHub connector's issue creation tool with:

- Repository: `salimon-dev/absenat`
- Title: the generated task title
- Body: the Markdown task body
- Assignees: `["salimon-suma"]`

If GitHub issue creation fails because the assignee or repository cannot be accessed, report the exact failure and provide the issue title and body in the final response so the user can create it manually.

## Final Response

Reply with the created GitHub issue number or URL and a one-sentence summary of the task. Do not paste the whole issue body unless the user asks or GitHub issue creation failed.
