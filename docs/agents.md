# Agent Handoff Guide

This file is for AI agents (and humans) picking up work on the HPFC summer party tournament app. Read this alongside `CLAUDE.md` at the repo root, which covers commands, architecture, and code patterns.

## Project Purpose

A mobile-first tournament management app for the Hinksey Park FC summer party. Admins create and manage tournaments pitch-side on a phone; parents and players follow along on a public read-only page. Target device: phone in bright sunlight under time pressure.

## Agent Workflow Standards

1. **Read `docs/build-tasks.md` first** to find what needs doing and what is already done. Never start a task that is already marked complete.
2. **Fetch `main` before starting** — `git fetch origin main && git checkout main && git pull`.
3. **Create a new branch for every change** — branch off `main`, never commit directly to it.
4. **Update `docs/build-tasks.md`** in the same PR as your changes — mark completed tasks with `✅ Done` and a one-line summary of what was done.

## Current State (as of 2026-05-12)

### Recently Completed

- **ADM-07** — Team management CRUD: create, edit, reorder, delete with locking once fixtures exist.
- **ADM-03** — Fixture generation: round-robin group fixtures generated and persisted via `POST /api/admin/tournament/[id]/fixtures/generate`.
- **ENG-02** — Round-robin generation supports 4, 6, and 8 teams with balanced rounds.
- **ENG-03** — Knockout fixture generation implemented in `lib/tournament.ts`.
- **DB-01/02/03** — Schema, indexes, and RLS policies all applied via migrations in `db/migrations/`.
- **F-01/F-03** — Lockfile committed; shared Supabase clients in `lib/supabase/server.ts`.
- **PWA** — Service worker fixed: `offline.html` precached, cold-cache HTML fallback, friendly offline page.

### Next Priority: ADM-04 — Rapid Score Entry

The group-stage admin workflow is unblocked. The next task is building the score entry UI:
- Show scheduled fixtures for the current round at the top.
- Large number controls, one-tap save.
- Allow editing completed scores.
- Goal: score entry in under 10 seconds on mobile.
- See `docs/build-tasks.md` → ADM-04 for full acceptance criteria.

### Blocked / Waiting

- **ADM-01** (session handling) — Admin auth currently uses a header (`x-hpfc-admin: 1`) stored in `localStorage`. A proper session with expiry and redirect is needed before public launch but not blocking day-of-event testing.
- **PUB-01/PUB-02** (public tournament pages with real data) — Currently mock data. Unblocks after ADM-04.

## Architectural Decisions

- **No personal data** — Only tournament names, team names, fixtures, scores.
- **Stateless admin auth** — `x-hpfc-admin: 1` header checked server-side. Session persisted in `localStorage`. Good enough for a one-day event.
- **Service-role client for all writes** — Public client used only for SELECT and realtime. All mutations go through `getSupabaseAdminClient()`.
- **Team count constraint** — Exactly 4, 6, or 8 teams. Enforced in validation, engine, and UI. Do not relax this without updating all three.
- **Fixture lock** — Once fixtures exist for a tournament, team mutations are blocked (`locked` prop on `ManageTeams`). Unlocking requires deleting fixtures first.
- **`confirm()` for destructive actions** — Native browser confirm used for team deletion. Keep this pattern; no custom modal library.

## Do Not

- Do not introduce personal data fields (emails, phone numbers, etc.).
- Do not bypass the `isAdminRequest()` check on API routes.
- Do not commit directly to `main`.
- Do not add npm dependencies without checking bundle impact — keep the client bundle lean.
- Do not use the Supabase service-role key in client-side code.
