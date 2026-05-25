# Plan 02 — GitHub Organisation & Team Plan

> Six people, one product — set up so nobody steps on each other.

How to structure the GitHub organisation, distribute review load off you and the lead, lock down `main`, automate deploys, and onboard the four developers in a week without burning a sprint.

- **Read time:** ~20 min
- **Sections:** 10
- **Team:** 1 founder · 1 lead · 4 devs

---

## Table of contents

1. [GitHub organisation structure](#1-github-organisation-structure)
2. [Teams — the people structure](#2-teams--the-people-structure)
3. [CODEOWNERS — where reviews actually get enforced](#3-codeowners--where-reviews-actually-get-enforced)
4. [Branch strategy + protection](#4-branch-strategy--protection)
5. [CI/CD with GitHub Actions](#5-cicd-with-github-actions)
6. [Secrets management — three layers](#6-secrets-management--three-layers)
7. [Project management](#7-project-management)
8. [Day-one files](#8-day-one-files)
9. [The seven-day setup sequence](#9-the-seven-day-setup-sequence)
10. [What to avoid](#10-what-to-avoid)

---

## 1. GitHub organisation structure

Create org `personaon` (or `personaon-inc` if taken). Inside it, **one main monorepo** plus a couple of supporting repos. At 6 people on one product, monorepo wins decisively — atomic full-stack PRs, shared CI, one clone for onboarding, no cross-repo sync drift between API and clients.

```
personaon/
├── personaon              ← main monorepo (web + api + desktop + shared packages)
├── .github                ← org-wide PR templates, security policy, profile README
├── infra                  ← Terraform/Pulumi for GCP + Supabase + Cloudflare
│                            (separate so infra has tighter access controls)
└── brand                  ← logos, brand kit, marketing assets (private)
```

That's it. **Resist the urge to split web/api/desktop into separate repos** — at 6 people it costs more than it saves.

---

## 2. Teams — the people structure

Five teams, mapped to how reviews and access actually work:

| Team | Members | What they own |
|---|---|---|
| `@personaon/leadership` | 2 | You + lead. Admin · org settings · secrets · merging to `main` |
| `@personaon/engineers` | 6 | All 6. Write access · code review · merge to `staging` |
| `@personaon/backend-reviewers` | 2-3 | Lead + 1-2 backend devs. CODEOWNER for `apps/api/**` |
| `@personaon/frontend-reviewers` | 2-3 | Lead + 1-2 frontend devs. CODEOWNER for `apps/web/**` & `packages/workspace/**` |
| `@personaon/desktop-reviewers` | 1-2 | Lead + whoever does desktop. CODEOWNER for `apps/desktop/**` (when it exists) |

> **Why reviewer-teams exist:** to distribute the review load off you and the lead. Assign 2-3 people per area so any of them can unblock a PR. Granular per-feature teams matter at 30+ — for 6 people, this is plenty.

---

## 3. CODEOWNERS — where reviews actually get enforced

Put this at `.github/CODEOWNERS`:

```
# Default — falls through to leadership
*                              @personaon/leadership

# Backend
apps/api/                      @personaon/backend-reviewers
apps/api/modules/auth/         @personaon/leadership   # auth needs founder/lead eyes
apps/api/modules/billing/      @personaon/leadership   # billing too

# Web
apps/web/                      @personaon/frontend-reviewers
packages/workspace/            @personaon/frontend-reviewers
packages/ui/                   @personaon/frontend-reviewers

# Desktop (when it exists)
apps/desktop/                  @personaon/desktop-reviewers

# Shared contract — extra careful
packages/sdk/                  @personaon/leadership @personaon/backend-reviewers @personaon/frontend-reviewers
packages/types/                @personaon/leadership

# Infrastructure & CI
infra/                         @personaon/leadership
.github/                       @personaon/leadership
**/Dockerfile                  @personaon/leadership
**/*.tf                        @personaon/leadership
```

This means a backend dev can review a backend PR without bothering you. **The lead and you only get tagged on touchy stuff** (auth, billing, infra, shared contract).

---

## 4. Branch strategy + protection

Keep your current `staging → main` model — your team already uses it and production deploys auto-trigger from `main`.

### Workflow

```
feat/short-name  →  PR  →  staging  →  PR  →  main
```

### Branch protection on `main`

Settings → Branches → Add rule:

- Require pull request before merging
- Require **2 approvals**, one of whom must be `@personaon/leadership`
- Require status checks to pass: `lint`, `typecheck`, `build`, `test`
- Require branches to be up to date
- Require linear history (squash merge only)
- **Restrict who can push to** → `@personaon/leadership` only
- Do not allow force pushes
- Do not allow deletions

### Branch protection on `staging`

More lenient for velocity:

- Require pull request before merging
- Require **1 approval** from CODEOWNER
- Require the same status checks
- Allow squash merges only
- Allow `@personaon/engineers` to push

### Naming convention

Enforce via PR title lint:

- `feat/xxx` · `fix/xxx` · `chore/xxx` · `refactor/xxx` · `docs/xxx`
- Squash commit message = PR title in conventional-commits format

---

## 5. CI/CD with GitHub Actions

Four workflows under `.github/workflows/`:

| File | Trigger | What it does |
|---|---|---|
| `ci.yml` | PR to staging or main | Turborepo affected: lint + typecheck + test + build the packages this PR actually touches. Skip unchanged. Fast feedback. |
| `deploy-staging.yml` | Push to staging | Deploy api to Cloud Run staging service, deploy web to Vercel preview, run E2E smoke against staging URL. |
| `deploy-prod.yml` | Push to main | Same, prod targets. Manual approval gate from `@personaon/leadership` via GitHub Environments. |
| `security.yml` | Weekly + on PR | Dependabot updates, CodeQL scan, secret scanning, npm audit, pip-audit. |

> ⚠️ **Turborepo affected-package detection is critical at this size.** Without it, every PR runs every test and reviewers stop trusting the green check. Within a week of slow CI, your team will start merging without waiting — that's where bad changes leak through.

### GitHub Environments for the prod deploy

- Create environment `production` with required reviewers = `@personaon/leadership`
- Production secrets live here, NOT in repo or org secrets
- Means: a PR merge to `main` triggers the deploy workflow, which pauses waiting for one of you to click "approve" in the Actions UI

---

## 6. Secrets management — three layers

| Layer | Where | What |
|---|---|---|
| **CI-time** | GitHub Environments (per-env) | Deploy tokens (GCP service account, Vercel token, Supabase service key for migrations) |
| **Runtime** | GCP Secret Manager + Supabase Vault | API keys actually consumed by the app (Gemini, Pinecone, Stripe, Recall.ai) |
| **Developer-local** | 1Password / Doppler / Infisical | `.env.local` rotation for the team |

### Hard rules (put in CONTRIBUTING.md)

- Never commit `.env`, `.env.local`, `*.key`, `*.pem`
- Use `.env.example` files only — actual values come from 1Password
- Secret scanning is on; if push protection blocks you, **investigate**, don't bypass

---

## 7. Project management

**GitHub Projects v2** is now genuinely good and free with the org. One project, multiple views:

- **Sprint board** — Today / In progress / In review / Done (this week)
- **Backlog** — prioritized list
- **By area** — backend / frontend / desktop / infra columns
- **Roadmap** — by milestone (Phase 1 vertical slice, Phase 2 parity, etc.)

### Issue templates

At `.github/ISSUE_TEMPLATE/`:

- `bug.yml` — repro steps · expected · actual · env
- `feature.yml` — user story · acceptance criteria · designs link
- `chore.yml` — refactor / cleanup
- `incident.yml` — for production issues, links to postmortem template

### PR template

At `.github/PULL_REQUEST_TEMPLATE.md`:

- What & why
- Screenshots (for UI changes)
- Test plan
- Risk + rollback plan
- Linked issues

> **If your team already uses Linear,** skip GitHub Projects and just link Linear to GitHub via the integration. Don't run two trackers — pick one and commit.

---

## 8. Day-one files

Drop these in the monorepo immediately — they set the tone:

```
.github/
├── CODEOWNERS
├── PULL_REQUEST_TEMPLATE.md
├── ISSUE_TEMPLATE/
│   ├── bug.yml
│   ├── feature.yml
│   └── chore.yml
├── workflows/
│   ├── ci.yml
│   ├── deploy-staging.yml
│   ├── deploy-prod.yml
│   └── security.yml
└── dependabot.yml

CONTRIBUTING.md         ← how to set up local, branch naming, PR process
SECURITY.md             ← how to report vulnerabilities
CODE_OF_CONDUCT.md      ← short, standard one
README.md               ← project overview, links to CONTRIBUTING
docs/adr/
├── 0001-monorepo.md
├── 0002-staging-then-main.md
└── 0003-tauri-for-desktop.md
LICENSE                 ← decide: closed source? proprietary header on each file?
```

---

## 9. The seven-day setup sequence

| Day | What |
|---|---|
| **Day 1** | **Create the org as `personaon`.** Don't transfer the repo yet. Create the five teams above. Invite your lead + 4 devs to the org. Add everyone to the correct teams. |
| **Day 2** | Set up `personaon/.github` repo. Drop in the workflows, CODEOWNERS, PR/issue templates. This is your org-wide policy repo. |
| **Day 3** | Create `personaon/personaon` (the monorepo). Don't transfer the current repo yet — set up the monorepo restructure locally, then push as the first commit. Old repo becomes archive. *Or*, if the current repo's git history is valuable, transfer it via "Transfer ownership" then restructure in-place over a series of PRs. |
| **Day 4** | Set up branch protection rules on `main` and `staging`. Test by trying to push directly (should fail). Set up GitHub Environments for `staging` and `production`. Move secrets in. |
| **Day 5** | Write `CONTRIBUTING.md` and a short README walking through local setup. **Have your lead try the onboarding from a fresh clone** — they'll find gaps you can't see. |
| **Day 6-7** | Onboard the 4 devs. Pair each with the lead for their first PR. Watch for friction in the workflow. |

---

## 10. What to avoid

1. **Don't transfer the current repo with un-rotated secrets in history.** First, audit git history for any leaked tokens (`gitleaks detect`), rotate anything found, *then* transfer.
2. **Don't make the lead the sole reviewer on every PR.** CODEOWNERS distributes load. If you set it up right, lead reviews only the touchy areas (auth, billing, shared contract).
3. **Don't merge to main from feature branches.** Always go through staging.
4. **Don't store production secrets at the org level.** Environment-scoped only.
5. **Don't allow direct pushes to main, ever, even for emergencies.** Hot-fix flow = PR with `hotfix/` prefix, 1 approval from leadership, fast-tracked through CI.
6. **Don't underinvest in the README on day one.** A 6-person team with a bad README burns 30+ developer-hours per onboarding. A good README pays back instantly.

---

**Companion plan:** [Plan 01 — Backend ↔ frontend integration plan](./01-integration-plan.md)
