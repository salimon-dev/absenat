---
name: create-task
description: Use in this Absenat project when the user gives a broad or rough task description and wants Codex to inspect the current project, expand it into a detailed implementation task grounded in this codebase, and save it as a task file under the repository's tasks folder.
metadata:
  version: 1.0.0
disable-model-invocation: false
---

# Create Task

Turn a high-level user request into a detailed, codebase-aware task file for this repository.

## Workflow

1. Read the user's rough task description and identify the intended product change, bug fix, refactor, or research outcome.
2. Inspect the project before writing the task:
   - Read repository guidance such as `AGENTS.md`, `CLAUDE.md`, `README.md`, and relevant docs when present.
   - Search with `rg` or `rg --files` for related components, routes, scenes, services, types, tests, scripts, or assets.
   - Open only the files needed to understand existing patterns, constraints, and likely implementation points.
3. Create the repository `tasks/` folder if it does not exist.
4. Write one Markdown file in `tasks/` using a kebab-case filename based on the task title, for example `tasks/add-player-inventory.md`.
   - If the filename already exists, append a short numeric suffix such as `-2`.
5. The file must contain exactly these top-level sections in this order:

```markdown
# Title

Status: To Do

## Description

...
```

## Description Content

Make the description detailed enough for another engineer or agent to implement without redoing the initial discovery. Include:

- Problem or goal in project terms.
- Current codebase findings with file paths.
- Expected behavior and acceptance criteria.
- Likely files or modules to change.
- Constraints from repository instructions, architecture, style, or tests.
- Suggested verification commands or manual checks.
- Open questions only when the codebase scan cannot resolve an important ambiguity.

Keep the task actionable, not speculative. If a detail is inferred from code, say so. If the user explicitly gives a required status, use it; otherwise use `To Do`.

## Final Response

Reply with the created file path and a one-sentence summary of the task. Do not paste the whole task file unless the user asks.
