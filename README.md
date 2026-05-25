# PersonaOn — Workspace Preview

> **A memory engine for people who live in meetings.** Capture every meeting, build an archive you can ask back like ChatGPT, and publish parts of it as a public persona where strangers chat with what you've approved. Every public answer is sourced. Nothing leaks.

---

## 🌐 Live demo

**https://wolf-auction-elect-deemed.trycloudflare.com**

> ⚠️ Ephemeral Cloudflare tunnel — works as long as the host machine keeps it running. URL changes if it restarts. Don't post in public channels. For a persistent URL, switch to Vercel preview deploys.

### Demo flow — open in this order

| # | URL | What you see |
|---|---|---|
| 1 | [`/welcome`](https://wolf-auction-elect-deemed.trycloudflare.com/welcome) | Onboarding hero — *"Your meetings, asked back"* |
| 2 | [`/workspace`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace) | Today view — calm home, pending line, meeting list |
| 3 | [`/workspace/meeting/m-live-acme`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace/meeting/m-live-acme) | Live recording UX — clean red strip + Stop |
| 4 | [`/workspace/meeting/m-sales-acme`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace/meeting/m-sales-acme) | Completed meeting · Summary tab → **Memory candidates** with "Unlocks visitor questions like…" |
| 5 | [`/workspace/people/jordan-reyes`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace/people/jordan-reyes) | Person detail — "Your persona may mention this person" |
| 6 | [`/workspace/visitors`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace/visitors) | Visitor conversations with unanswered flagging |
| 7 | [`/workspace/routines`](https://wolf-auction-elect-deemed.trycloudflare.com/workspace/routines) | Scheduled prompts (Morning Brief, etc.) |

### Things to try on any page

- Click the **persona chip** (bottom-left of sidebar) → persona drawer with "What your persona can say · from meetings"
- Click the **gear icon** (top-right) → settings modal (ChatGPT/Littlebird-style centered modal)
- Click **"View as visitor"** (top-right) → public-chat preview with clickable source attribution
- Press **⌘K / Ctrl-K** → command palette across meetings · people · memory · actions
- Drag the window narrow → sidebar collapses to a hamburger; bottom controls reflow

All data is mocked — no backend wired yet. The intent is to react to the **shape** of the product, not the wiring.

---

## 📋 Engineering plans

Two plans for getting from this prototype to a shipping product:

- **[Plan 01 — Backend ↔ frontend integration](./docs/plans/01-integration-plan.md)**
  Monorepo restructure, gap-finding harness, vertical slice, parity wave, rollout, desktop app. ~25 min read.

- **[Plan 02 — GitHub organisation & team](./docs/plans/02-github-org-plan.md)**
  Org structure, five teams for six people, CODEOWNERS, branch protection, CI/CD, secrets, seven-day setup sequence. ~20 min read.

Polished HTML versions also live in [`docs/plans/html/`](./docs/plans/html/) — open in any browser, print to PDF if you want to send to investors.

---

## What's in this preview

The prototype implements the workspace UX shift we landed on:

- **Granola/ChatGPT/Claude-inspired shell** — warm parchment background, serif headings, hairline borders, sidebar with grouped meetings list, sticky prompt at the bottom
- **Six surfaces**: Today · People · Visitors · Review · Routines · Settings (modal)
- **Persona as a drawer**, not a primary route — opens from the chip at the bottom-left
- **View-as-visitor mode** as a full-canvas takeover for demoing the public surface
- **Recording UX** that stays out of the way — clean live strip + Stop, no floating dock collision with the prompt
- **Routines** as a first-class concept — scheduled prompts against memory (Morning Brief, End-of-Day Wrap-Up, Weekly Reflection)
- **Collapsible sidebar** + mobile off-canvas drawer
- **Interactive "Build your persona" progress rail** (clickable checkboxes, persists in localStorage)

The full source lives in the upstream worktree at `D:\PersonaOn-dashboard-ux-v2` on branch `codex/dashboard-ux-v2-from-staging`.

---

## Status

- ✅ UX prototype complete and visually QA'd
- ✅ Engineering plans documented (integration + GitHub org)
- ⏳ Backend wiring — not started (see Plan 01)
- ⏳ GitHub organisation — not created yet (see Plan 02)
- ⏳ Desktop app — planned for after web is stable (see Plan 01 Phase 5)

---

## Sharing this repo

To push to GitHub:

```bash
cd D:\personaon-workspace-preview
git remote add origin git@github.com:<your-username-or-org>/personaon-workspace-preview.git
git push -u origin main
```

For the eventual personaon org:

```bash
git remote set-url origin git@github.com:personaon/workspace-preview.git
```

---

*Internal preview · not for public distribution*
