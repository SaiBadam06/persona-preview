# PersonaOn — Workspace Preview

> **A memory engine for people who live in meetings.** Capture every meeting, build an archive you can ask back like ChatGPT, and publish parts of it as a public persona where strangers chat with what you've approved. Every public answer is sourced. Nothing leaks.

This repo is the self-contained workspace UX prototype — a fresh Next.js app, fully mocked, no backend wired. Clone, install, run.

---

## 🌐 Live demo (ephemeral)

**https://wolf-auction-elect-deemed.trycloudflare.com**

> ⚠️ Cloudflare quick-tunnel running on a dev machine — works as long as the host keeps it running. URL changes if it restarts. Don't post in public channels. For a persistent URL, switch to a Vercel preview deploy.

---

## 🚀 Run it locally

```bash
git clone git@github.com:snsettitech/personaon-workspace-preview.git
cd personaon-workspace-preview
npm install
npm run dev
```

Open **http://localhost:3011**. You'll be redirected to `/welcome` (the onboarding hero).

**Requirements:** Node ≥20 <25, npm ≥10.

### Available scripts

| Command | What |
|---|---|
| `npm run dev` | Dev server with hot reload on `:3011` |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

---

## 🗺️ Demo flow

Open these in order to land the full positioning in ~4 minutes:

| # | URL | What you see |
|---|---|---|
| 1 | `/welcome` | Onboarding hero — *"Your meetings, asked back"* |
| 2 | `/workspace` | Today view — calm home, pending line, meeting list |
| 3 | `/workspace/meeting/m-live-acme` | Live recording UX — clean red strip + Stop |
| 4 | `/workspace/meeting/m-sales-acme` | Completed meeting · Summary tab → **Memory candidates** with "Unlocks visitor questions like…" |
| 5 | `/workspace/people/jordan-reyes` | Person detail — "Your persona may mention this person" |
| 6 | `/workspace/visitors` | Visitor conversations with unanswered flagging |
| 7 | `/workspace/routines` | Scheduled prompts (Morning Brief, etc.) |
| 8 | `/plans/index.html` | The two engineering plans, polished HTML |

### Things to try on any workspace page

- Click the **persona chip** (bottom-left of sidebar) → drawer with "What your persona can say · from meetings"
- Click the **gear icon** (top-right) → settings modal (ChatGPT/Littlebird-style centered modal with left nav)
- Click **"View as visitor"** (top-right) → public-chat preview with clickable source attribution
- Press **⌘K / Ctrl-K** → command palette across meetings · people · memory · actions
- Drag the window narrow → sidebar collapses to a hamburger; bottom controls reflow
- Click any task in **"Build your persona"** rail → toggles done state, persists in localStorage

All data is mocked in [`app/workspace/mockData.ts`](./app/workspace/mockData.ts) — no backend calls, no auth, no env vars required.

---

## 📋 Engineering plans

Two plans for getting from this prototype to a shipping product:

- **[Plan 01 — Backend ↔ frontend integration](./docs/plans/01-integration-plan.md)** (~25 min)
  Monorepo restructure, gap-finding harness, vertical slice, parity wave, rollout, desktop app.

- **[Plan 02 — GitHub organisation & team](./docs/plans/02-github-org-plan.md)** (~20 min)
  Org structure, five teams for six people, CODEOWNERS, branch protection, CI/CD, secrets, seven-day setup sequence.

Polished HTML versions also live in [`docs/plans/html/`](./docs/plans/html/) for sharing as standalone artifacts or printing to PDF.

---

## 🏗️ Repo structure

```
personaon-workspace-preview/
├── app/
│   ├── globals.css                    ← minimal Tailwind import + body reset
│   ├── layout.tsx                     ← root layout (fonts only)
│   ├── page.tsx                       ← redirects to /welcome
│   ├── welcome/                       ← onboarding (hero + seed + calendar)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── workspace/                     ← THE workspace
│       ├── workspace-tokens.css       ← all warm-parchment design tokens, scoped
│       ├── mockData.ts                ← all demo data (meetings, people, routines, etc.)
│       ├── layout.tsx
│       ├── page.tsx                   ← Today view
│       ├── WorkspaceShell.tsx
│       ├── WorkspaceSidebar.tsx
│       ├── WorkspaceTopBar.tsx
│       ├── WorkspaceOverlays.tsx      ← persona drawer, settings modal, visitor mode, record modal, cmd-K
│       ├── WorkspaceShellContext.tsx
│       ├── PromptInput.tsx
│       ├── meeting/[id]/page.tsx
│       ├── people/page.tsx
│       ├── people/[id]/page.tsx
│       ├── visitors/page.tsx
│       ├── review/page.tsx
│       └── routines/page.tsx
├── public/
│   └── plans/                         ← polished HTML plans (also viewable in browser)
├── docs/
│   └── plans/                         ← markdown plans (render natively on GitHub)
├── package.json                       ← Next.js 16 · React 19 · lucide-react · Tailwind 4
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

The workspace is **fully scoped** — every CSS variable lives under `.workspace-root` in `workspace-tokens.css`. Nothing leaks into the global namespace. When the time comes for the monorepo restructure (Plan 01 Phase 0), this entire `app/workspace/` folder becomes `packages/workspace/` essentially unchanged.

---

## ✅ What's working

- ✅ Production build passes (`npm run build`)
- ✅ TypeScript clean (`npm run typecheck`)
- ✅ All 9 routes serve at runtime
- ✅ Persona drawer · settings modal · view-as-visitor · record modal · Cmd-K palette all functional
- ✅ Mobile responsive (sidebar collapses to off-canvas drawer)
- ✅ localStorage persistence for sidebar state + progress rail

## ⏳ What's NOT in this preview

- ⏳ Backend wiring (see Plan 01)
- ⏳ Real recording (uses mock transcripts)
- ⏳ Real persona answers (uses canned responses)
- ⏳ Real memory candidate extraction (hardcoded in `mockData.ts`)
- ⏳ Auth / multi-user (single mocked persona "Avery Stone")
- ⏳ Desktop app (planned for Plan 01 Phase 5)

---

## 🎯 The product positioning

**One sentence:** *Your meetings, asked back. Privately by you. Publicly by your persona.*

**Three nouns** in the sidebar: meetings, people, visitors.
**One verb:** approve (in Review).
**One always-on:** the prompt.
**One drawer:** persona.
**One modal:** settings.
**One demo:** view as visitor with sources.

That's the entire product surface. Read Plan 01 for the full thinking.

---

## 📜 License

Proprietary — see [LICENSE](./LICENSE). Internal preview, not for public distribution.
