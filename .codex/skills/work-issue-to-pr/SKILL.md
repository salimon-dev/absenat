---
name: work-issue-to-pr
description: Use in this Absenat project when the user asks Codex to find an open GitHub issue without active PR work, implement it locally, validate it, commit it, push it, and open or update a pull request.
metadata:
  version: 1.0.0
disable-model-invocation: false
---

# Work Issue To PR

Find one actionable open GitHub issue in `salimon-dev/absenat`, implement it, and publish the result as a pull request.

Default repository: `salimon-dev/absenat`.
Branch naming: `issue-#<number>` exactly, for example `issue-#42`.
PR target: the repository default branch unless the user explicitly says otherwise.
PR labels: do not add labels.

## Required GitHub And Git Flow

1. Inspect current git state before changing anything.
   - Do not revert unrelated local changes.
   - If local changes block checkout or branch operations, preserve them or ask only when there is no safe path.
2. Fetch remote refs and pull the latest default branch before starting implementation.
   - Discover the default branch from GitHub metadata or local remote HEAD.
   - Prefer non-destructive commands such as `git fetch`, `git switch <default>`, and `git pull --ff-only`.
3. Search open GitHub issues in `salimon-dev/absenat`.
4. Select one open issue that does not already have active work:
   - Skip issues with a linked open PR.
   - Skip issues whose comments or recent activity clearly show someone is actively working on them.
   - If an `issue-#<number>` branch or PR already exists for an issue, continue that branch or PR instead of starting another issue.
5. For an existing PR on the selected issue:
   - Inspect PR comments, reviews, unresolved threads, and failing checks.
   - Resolve actionable comments through code changes.
   - Do not add PR labels.
6. Create or switch to the local branch named `issue-#<number>`.
   - If the remote branch exists, track it locally.
   - If starting new work, branch from the freshly updated default branch.
7. Implement the issue with the repository's existing patterns and `AGENTS.md` rules.
8. Add or update tests when the change has meaningful logic, regression risk, or user-visible behavior.
9. Validate with relevant tools:
   - Run `npm run lint`.
   - Run `npm run build`.
   - Run project tests if a test script exists.
   - Use Playwright or the Browser plugin for browser, game, React UI, or interaction behavior.
   - For asset/tile changes, run `npm run generate-tiles` when applicable.
10. Commit completed work with a concise message referencing the issue.
11. Push the branch to GitHub.
12. Open a pull request targeting the default branch, or update the existing PR.
13. Finish the run after the PR exists and report the PR URL.

## Issue Discovery

Use the GitHub connector when available. `gh` is an acceptable fallback for timeline details, linked PR detection, checks, and review thread state.

Recommended checks:

```bash
gh repo view salimon-dev/absenat --json defaultBranchRef
gh issue list --repo salimon-dev/absenat --state open --limit 50 --json number,title,assignees,labels,updatedAt,url
gh pr list --repo salimon-dev/absenat --state open --limit 100 --json number,title,headRefName,baseRefName,url,body
```

When choosing an issue, look for references in open PR titles, branch names, PR bodies, issue comments, and linked closing keywords such as `Fixes #<number>`, `Closes #<number>`, or `Resolves #<number>`.

If no eligible issue exists, stop and report that every open issue appears to have active PR work or clear in-progress ownership.

## Implementation Rules

Follow the project instructions in `AGENTS.md`, especially:

- TypeScript only and no `any`.
- Phaser game state belongs in Phaser; React overlay state belongs in React.
- Use component subfolders with CSS modules for React components.
- Keep game logic modular under `src/game`.
- Extract long class methods into same-directory helper files with a typed `this` parameter.
- Prefer enums plus exported type aliases for domain literals.
- Keep functions small and focused.
- Keep assets pixel art.

Use `docs/player-stats.md` for player stat definitions when the issue touches stats or player mechanics.

## PR Description

The PR body must include:

```markdown
Closes #<number>

## Summary
- ...

## Verification
- ...
```

Use `Closes #<number>` so GitHub closes the issue when the PR merges. Include the issue number, a concise summary of completed work, and every validation command or manual/browser check performed. If a relevant validation could not be run, state why.

Do not add labels to the PR.

## Final Response

Reply with:

- Selected issue number and title.
- PR URL.
- Brief verification summary.

Keep the final response short. Do not paste logs unless the user asks.
