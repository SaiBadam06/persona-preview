# Plan 01 — Backend ↔ Frontend Integration Plan

> From mock to shipping — without painting ourselves into a corner.

A six-phase plan to move the workspace prototype from pure mocks to a real product running against the live backend, structured so the desktop app drops in afterward as a shell over shared code instead of a rewrite.

- **Read time:** ~25 min
- **Total duration:** 6 phases · ~12 weeks
- **Team:** 6 (1 founder · 1 lead · 4 devs)

---

## Table of contents

1. [Phase 0 — Restructure the repo first](#phase-0--restructure-the-repo-first)
2. [Phase 1 — Build the gap-finding harness](#phase-1--build-the-gap-finding-harness)
3. [Phase 2 — Wire one vertical slice end-to-end](#phase-2--wire-one-vertical-slice-end-to-end)
4. [Phase 3 — Parity wave](#phase-3--parity-wave)
5. [Phase 4 — Rollout](#phase-4--rollout)
6. [Phase 5 — Desktop app](#phase-5--desktop-app)
7. [Keeping the repo clean as it grows](#keeping-the-repo-clean-as-it-grows)
8. [Where to start tomorrow](#where-to-start-tomorrow)
9. [A few things to push back on](#a-few-things-to-push-back-on)

---

## Phase 0 — Restructure the repo first

**Duration:** ~1 week · biggest one-time win

The current `/frontend` + `/backend` split worked for one app. With desktop coming, you need a monorepo so web and desktop share UI, types, and the API client. Doing this now is dramatically cheaper than after both apps exist.

### Recommended structure

```
personaon/
├── apps/
│   ├── web/              ← current /frontend (Next.js shell + marketing + auth)
│   ├── desktop/          ← future Tauri shell
│   └── api/              ← current /backend (FastAPI)
│
├── packages/
│   ├── workspace/        ← THE workspace UI (sidebar, pages, drawers, overlays)
│   │                       both web and desktop import this
│   ├── ui/               ← primitive components (Button, Modal, Toggle)
│   ├── sdk/              ← TypeScript client, auto-generated from FastAPI OpenAPI
│   ├── types/            ← shared TS types (Meeting, Person, Memory)
│   └── tokens/           ← CSS variables + Tailwind preset
│
├── docs/
│   ├── api-map.md        ← workspace surface → backend endpoint mapping (the gap doc)
│   └── adr/              ← architecture decisions
│
├── pnpm-workspace.yaml   ← pnpm + turborepo is the cheapest stack
├── turbo.json
└── package.json
```

> **Why this matters for desktop later.** The desktop app is *not* a rewrite — it's a Tauri (or Electron) shell that mounts `packages/workspace` and adds native features (system tray, global hotkey, meeting auto-join, file watcher). If the workspace is locked to Next.js routing today, splitting it later is painful.

### Concrete moves

1. `mv frontend apps/web && mv backend apps/api`
2. Create `pnpm-workspace.yaml` with `apps/*` and `packages/*`
3. Extract `app/workspace/*` from the web app into `packages/workspace/` — it has no Next-specific deps if you swap `next/link` and `next/navigation` for a tiny router adapter
4. The web app's `app/workspace/page.tsx` becomes a thin re-export

This unlocks every later phase. **Don't ship features during this week** — it's a focused refactor.

---

## Phase 1 — Build the gap-finding harness

**Duration:** ~3-4 days

You can't wire screens without knowing what's missing. Build the tools to make gaps loud.

### 1. The API map

A single Markdown table at `docs/api-map.md`, one row per workspace data need. Sorted by status, then by priority. This is your **gap matrix**.

| Surface | Data need | Endpoint | Status |
|---|---|---|---|
| Today home | Pending counts (review · follow-ups · visitor Qs) | `GET /v2/dashboard/pending` | MISSING |
| Today home | Today's meetings | `GET /v2/meetings/{twin}?day=today` | EXISTS |
| Meeting page | Recap | `GET /v2/meetings/{twin}/{id}/recap` | EXISTS |
| Meeting page | Memory candidates per meeting | `GET /v2/meetings/{twin}/{id}/candidates` | MISSING |
| Meeting page | Approve / ignore candidate | `POST /v2/memory/{id}/approve` | MISSING |
| Review | All pending across types | `GET /v2/review?twin={id}` | PARTIAL |
| Person detail | Persona-mention permission | `PUT /v2/people/{id}/permission` | MISSING |
| Routines | List · create · update · run · history | `/v2/routines/*` | MISSING |
| Visitors | Session list + unanswered detection | `GET /v2/visitors?twin={id}` | PARTIAL |
| Persona drawer | Allowed-topics grouped from memory | `GET /v2/persona/{id}/topics` | MISSING |
| Settings | Export memory dump | `POST /v2/memory/{twin}/export` | MISSING |
| Cmd-K | Search across meetings · people · memory | `GET /v2/search?q=...&twin={id}` | PARTIAL |

Status is one of `EXISTS` · `PARTIAL` · `MISSING`. Build the MISSING ones in dependency order.

### 2. MSW (Mock Service Worker) in the SDK package

The workspace already runs on mocks today. Convert those mocks into MSW handlers in `packages/sdk/mocks/`. Now:

- Frontend devs work against real-looking API shapes
- Backend devs match the contract MSW defines
- When backend is ready, you flip a single env var (`USE_MOCK_API=false`) and the same UI hits the real backend
- Tests run against MSW handlers — no flaky integration

### 3. A typed `useApi()` hook with explicit gaps

Every workspace fetch goes through it. If the endpoint is marked `MISSING` in the API map, the hook throws a helpful error in dev:

```ts
const meetings = useApi('GET /v2/meetings/{twin}', { twin });
const approve  = useApi('POST /v2/memory/{id}/approve', { id });
//                       ⚠ throws "Not implemented yet — see api-map.md"
```

This means gaps surface the *first time* you try to wire a screen. No silent fallbacks.

### 4. Generate the SDK from OpenAPI

FastAPI already produces `/openapi.json`. Run `openapi-typescript-codegen` in CI on every backend deploy. The frontend imports typed clients automatically. **No manual SDK maintenance.**

---

## Phase 2 — Wire one vertical slice end-to-end

**Duration:** ~2-3 weeks

Don't try to ship the whole workspace at once. Pick the **smallest meaningful flow that touches every layer.**

> *"Record a meeting → get a recap → approve a memory → see it become a persona answer."*

That single journey exercises:

- Recording (Recall.ai bot → audio → transcript)
- Recap generation (LLM summarization)
- Memory candidate extraction
- Approval flow (writes to persona's allowed-to-say set)
- Persona answer (retrieval + grounded generation with the new fact)
- View as visitor (sees the answer in public chat)

Ship this slice behind a feature flag (`workspace_v2_enabled`) for yourself + a handful of users. **Don't ship anything else until this loop feels alive end-to-end.** If this works, the rest is mostly more of the same.

> **Why this slice specifically?** It's the unique value prop of PersonaOn in one journey. If this loop doesn't work, the product doesn't work — so fix it first, then expand.

---

## Phase 3 — Parity wave

**Duration:** ~4-6 weeks, parallelisable

Now you systematically work through the API map. Split into tracks that can run in parallel:

| Track | Owner concern | Endpoints to build |
|---|---|---|
| **Memory engine** | Backend | candidates, approve, allowed-topics, embeddings |
| **People intelligence** | Backend | person permissions, private notes, open commitments |
| **Routines** | Backend + infra | model, scheduler (cron), worker, run history, delivery (email + workspace note) |
| **Visitor analytics** | Backend | session aggregation, unanswered detection |
| **Workspace polish** | Frontend | empty states, loading, errors, real toggles |
| **Settings real** | Both | every toggle persists, every integration connects |

Each track has its own gap-map rows + MSW handlers + UI screens. Cross-track integration tests sit on top. With 6 people, two tracks at a time is the sweet spot.

---

## Phase 4 — Rollout

**Duration:** ~2-3 weeks

GrowthBook (already in use). Three cohorts:

**Cohort 1 — Internal + opt-in beta** (5-20 users)
`workspace_v2_enabled = true` for them only. Tight feedback loop with this group for two weeks.

**Cohort 2 — New signups**
Default workspace; old dashboard still accessible via `/legacy` if they navigate there. Existing users see an opt-in banner.

**Cohort 3 — All users**
`/dashboard` redirects to `/workspace`; banner on the redirect explains "new workspace."

After 2-3 weeks at cohort 3 with no fires, delete `/dashboard` entirely.

---

## Phase 5 — Desktop app

**Duration:** ~4-6 weeks · after web is stable

**Stack:** Tauri 2.x. Rust core, web view for UI, ~10MB bundle, native menus/tray/hotkeys/file system. Better fit than Electron for the calm aesthetic. Electron is the safer choice if speed-to-ship trumps everything, but Tauri's bundle and startup time advantage compounds over thousands of installs.

### Structure

```
apps/desktop/
├── src-tauri/         ← Rust: tray · hotkeys · file watcher · system audio capture
│   ├── main.rs
│   └── tauri.conf.json
└── src/
    ├── App.tsx        ← mounts packages/workspace
    ├── shell/         ← desktop-only chrome (menu bar, status)
    └── native/        ← bridges to Rust commands
```

The `packages/workspace` import is the same code as web. Desktop just adds:

- **Global hotkey** (`Cmd+Shift+N`) → opens capture overlay
- **System tray** → recording status + Stop button
- **Meeting auto-join** → reads system calendar, joins bot to Zoom/Meet calls without browser
- **System-level audio capture** → record any meeting, even in-person calls
- **File watcher** → drop a PDF/audio/video file into `~/PersonaOn/` → auto-ingested
- **Auto-update** via Tauri updater

The desktop app's value prop is *zero friction for the meeting-heavy user.* Nothing functional is on desktop that isn't on web; desktop is the always-available capture layer.

---

## Keeping the repo clean as it grows

### Hard rules

1. **`packages/workspace` cannot import from `apps/web`** — enforced via `eslint-plugin-boundaries` or Turborepo's `denyList`. If you violate this, web-and-desktop sharing breaks silently.
2. **Every API call goes through `packages/sdk`** — no `fetch()` in workspace code. Lints fail otherwise.
3. **Every CSS variable lives in `packages/tokens`** — no inline hex anywhere outside tokens. Enforce with a lint.
4. **One ADR per non-trivial decision** in `docs/adr/`. "Why Tauri over Electron." "Why `/workspace` not `/dashboard`." Future-you will thank present-you.
5. **API contract is the source of truth, not the implementation.** Backend changes that break the SDK regenerate the types; frontend build breaks immediately. Catch contract drift at PR-time, not in prod.

### Cleanups to do up front

- Delete `/app/marketplace` (vestigial clone-marketplace route)
- Delete old `/dashboard/widget/leads` if not used
- Move design assets / mockups out of root into `docs/`
- Add a `CONTRIBUTING.md` with the package boundary rules

---

## Where to start tomorrow

If I were doing this:

| When | What |
|---|---|
| **Day 1-3** | **Monorepo restructure.** Don't ship features. Get pnpm + turborepo + workspace packages set up. Confirm `apps/web` builds and runs at parity with current. |
| **Day 4-5** | Extract workspace to `packages/workspace`. Get web's `/workspace/*` re-importing from package. No behavior change. |
| **Day 6-7** | Stand up `packages/sdk` with auto-generated types from current FastAPI. Write the `useApi()` hook with MSW fallback. Convert one or two existing dashboard surfaces (Today + Meeting detail) to use it as proof of concept. |
| **Day 8-10** | Write `docs/api-map.md` covering every workspace surface. Mark each row EXISTS / PARTIAL / MISSING. Now you can see the work. |
| **Day 11+** | Pick the vertical slice ("record → recap → approve → persona answer"), wire it, ship to yourself behind a flag. |

> **The day-1 commit is the most important one in the whole plan.** Get the monorepo shape right and everything else compounds.

---

## A few things to push back on

- **Don't start with the desktop app.** Ship web first, even if the value-add of desktop is obvious to you. Web is faster to iterate; desktop locks behaviors in a release cycle.
- **Don't try to feature-flag-toggle individual workspace components inside the current `/dashboard`.** Cleaner to ship the whole workspace at `/workspace` behind one flag and treat it as the rewrite it is.
- **Don't generate the entire SDK by hand.** Auto-generate from OpenAPI on every backend PR. Hand-written SDKs rot the moment you stop maintaining them.
- **Don't build routines as a feature-of-the-prompt.** Build it as a real scheduled-job system with its own table, its own worker, its own delivery channels. Routines is half the value of the product for sticky users; it needs to be real.

---

**Companion plan:** [Plan 02 — GitHub organisation & team plan](./02-github-org-plan.md)
