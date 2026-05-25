# PersonaOn — Engineering Plans

Two artifacts: how to wire the workspace prototype to a real backend without painting ourselves into a corner for the desktop app, and how to set up the GitHub organisation so six people can ship without stepping on each other.

## Plans

- **[01 — Backend ↔ frontend integration plan](./01-integration-plan.md)** (~25 min read)
  Monorepo restructure, gap-finding harness, the single vertical slice to wire end-to-end first, parity wave, GrowthBook rollout, and how the desktop app drops in afterward without a rewrite.

- **[02 — GitHub organisation & team plan](./02-github-org-plan.md)** (~20 min read)
  Org structure, five teams for six people, CODEOWNERS that distributes review load off the lead, branch protection, CI/CD workflows, secrets management across three layers, and the seven-day setup sequence.

## Context

Both plans assume the workspace prototype at `D:\PersonaOn-dashboard-ux-v2` on branch `codex/dashboard-ux-v2-from-staging` as the starting point.

Polished HTML versions are also available at [`/frontend/public/plans/`](../../frontend/public/plans/) — viewable in any browser, printable to PDF for sharing with non-technical stakeholders.
