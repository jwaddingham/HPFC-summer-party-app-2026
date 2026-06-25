# HPFC Tournament App Build Tasks

This file is a handoff list for agents and people building the Hinksey Park Football Club summer party tournament app properly. Pick one task at a time, keep changes small, and leave the app in a runnable state after each task.

See `docs/agents.md` for agent workflow standards and current state. See `CLAUDE.md` for commands, architecture, and code patterns.

## Product Priorities

- Mobile-first, fast, readable outdoors, and forgiving under pressure.
- No personal data. Store only tournament names, team names, fixtures, and scores.
- Admin score entry should be possible in under 10 seconds pitch-side.
- Public pages should be read-only and shareable without login.
- Organisers must always be able to correct mistakes, reset state, and manually override generated structure.

## Recommended Build Order

1. Make the local app reliably runnable and tested.
2. Wire Supabase persistence and security.
3. Finish the group-stage admin workflow end to end.
4. Add public live tournament pages.
5. Add knockout generation and progression.
6. Add QR sharing and public polish.
7. Add offline and weak-signal resilience.
8. Run mobile/browser verification and deployment checks.

## Task Backlog

### Foundation

#### F-01: Install dependencies and commit a lockfile
✅ **Done.** `package-lock.json` committed. `npm run build`, `npm run lint`, and `npm run test` all work.

#### F-02: Add environment examples
✅ **Done.** `.env.example` lists the required local, Supabase, CI, and Vercel variables with placeholder values. README documents local Supabase setup, Vercel runtime variables, migration secrets, and the purpose of each key.

#### F-03: Add shared Supabase clients
✅ **Done.** `lib/supabase/server.ts` exports `getSupabasePublicClient()` and `getSupabaseAdminClient()`. Missing env vars throw with useful messages.

#### F-04: Configure linting and dependency audit policy
✅ **Done.** Added a real ESLint config for JavaScript and TypeScript files, replaced `next lint` with the non-interactive ESLint CLI, and documented a production audit policy. `npm run audit:prod` fails on high or critical production dependency vulnerabilities.

### Database And Security

#### DB-01: Enforce match teams belong to the same tournament
✅ **Done.** Composite foreign keys applied to home, away, and winner team columns in `db/schema.sql`.

#### DB-02: Add indexes for live pages
✅ **Done.** Applied in `supabase/migrations/20260512134000_add_live_page_indexes.sql`.

#### DB-03: Add RLS policies
✅ **Done.** Public SELECT allowed on all tables; anonymous writes blocked. Applied in `supabase/migrations/20260512135000_enable_rls_public_reads.sql`.

#### DB-04: Add migrations and seed data
✅ **Done.** `supabase/seed.sql` seeds deterministic 4, 6, and 8 team demo tournaments covering setup, group-stage, and knockout/complete scenarios. `npm run db:reset:local` resets the local Supabase database and applies the seed.

### Tournament Engine

#### ENG-01: Expand unit tests for `buildTable`
✅ **Done.** `lib/tournament.test.ts` covers points, goal difference, goals scored, alphabetical tie-breaks, draws, missing scores, cancelled matches, non-group matches, and unknown/cross-tournament team references.

#### ENG-02: Improve round-robin fixture generation
✅ **Done.** Generates balanced rounds for 4, 6, and 8 teams. Every pair plays exactly once. Unit tests cover all three sizes.

#### ENG-03: Add knockout generation
✅ **Done.** `generateKnockoutFixtures()` in `lib/tournament.ts` supports top-four (1v4, 2v3) and quarter-final (1v8…4v5) modes for 4, 6, and 8 team tournaments.

#### ENG-04: Add knockout progression
✅ **Done.** `resolveMatchWinner()` and `computeNextKnockoutRound()` in `lib/tournament.ts` advance winners (QF→SF→Final), with explicit winner selection for level scores. The match `PATCH` route records `winner_team_id` and `progressKnockout()` (`lib/knockout-server.ts`) populates the next round, marks the tournament complete when the final is decided, and resets/flags dependent matches when an earlier result changes. Unit-tested in `lib/tournament.test.ts`.

#### ENG-05: Add state transition rules
✅ **Done.** `TOURNAMENT_TRANSITIONS` plus `canTransition()`/`assertTransition()` in `lib/tournament.ts` define reversible setup↔group↔knockout↔complete moves. The knockout generate route enforces `group_stage → knockout_stage`; `POST .../knockout/reset` rolls back to the group stage (deleting knockout matches, keeping group results). Transitions and the never-trapped guarantee are covered by unit tests.

### Admin Experience

#### ADM-01: Finish access-code session handling
✅ **Done.** Successful admin logins now create a 12-hour local session, migrate/clear the previous legacy flag, and all admin screens use `AdminGuard` to redirect expired or missing sessions back to `/admin`. Public routes remain open.

#### ADM-02: Build tournament creation flow
✅ **Done.** `app/admin/tournaments/page.tsx` + `CreateTournamentForm` + `POST /api/admin/tournaments`. Saves tournament and teams to Supabase.

#### ADM-03: Generate and manage group fixtures
✅ **Done.** `FixturePanel` component + `POST /api/admin/tournament/[id]/fixtures/generate`. Generates round-robin, persists to Supabase, displays grouped by round. Team mutations locked once fixtures exist.

#### ADM-04: Build rapid score entry
✅ **Done.** Inline score steppers (+/− buttons, 40px tap targets) on every fixture card. Per-match save with saving/saved/error states. Scheduled matches shown first per round. Completed scores pre-filled for editing. New `PATCH /api/admin/tournament/[id]/matches/[matchId]` route. Completed matches have persistent green border and checkmark badge to distinguish from unscored ones (especially 0-0 results).

#### ADM-05: Add knockout admin controls
✅ **Done.** `KnockoutPanel` (`app/admin/tournament/[id]/knockout-panel.tsx`) lets organisers choose the format (top-4 semis, or quarter-finals when there are 8 teams), reorder seeds before drawing, and draw the bracket (`POST .../knockout/generate`). Knockout score entry records draw winners by penalties/decision and re-scoring corrects results without database surgery; the final winner is marked and editable. `Reset knockout stage` (`POST .../knockout/reset`) rebuilds the bracket from scratch.

#### ADM-06: Add admin reset and demo utilities
✅ **Done.** Admin tournament pages now include typed-confirmation reset utilities that delete generated group/knockout fixtures and scores, return the tournament to setup, and keep teams for regeneration. The reset route also requires a server-side confirmation token. `npm run demo:seed` creates a fresh local demo tournament through the app APIs, so rehearsal data can be generated repeatedly without hand editing.

#### ADM-07: Build team management CRUD
✅ **Done.** `ManageTeams` component in `app/admin/tournament/[id]/manage-teams.tsx`. Create, edit, reorder, delete with confirmation. All mutations locked once fixtures exist. Aria-labels on all icon buttons.

#### ADM-08: Define safe team mutations after fixtures exist
✅ **Done.** Once fixtures exist, team IDs and tournament structure are locked but team names remain editable. Renames are safe because fixtures, standings, and knockout progression reference team IDs; add/remove/reorder attempts remain blocked and the admin UI routes organisers to the confirmed reset/regenerate pathway for structural changes.

### Public Spectator Experience

#### PUB-01: Build public tournament list
✅ **Done.** `/` reads live tournaments, teams, and matches from Supabase, showing status, team count, leader, and next match summary with the HPFC card UI.

#### PUB-02: Build live tournament centre
✅ **Done.** `/tournament/[id]` is server-rendered from Supabase data, calculates live standings from saved matches, shows fixtures/recent results/bracket data, and polls `/api/tournament/[id]` every 15 seconds as the lightweight realtime fallback.

#### PUB-03: Add QR code and share links
✅ **Done.** Added `/tournament/[id]/share` with generated QR code, copy action, and native share action. The tournament header links to the QR/share page and public URLs require no login.

#### PUB-04: Add complete-state winner treatment
✅ **Done.** Completed tournaments display the stored/inferred final winner above the live table while keeping final table, fixtures, and bracket visible.

### Offline And Weak-Signal Resilience

#### OFF-01: Add optimistic score saves
✅ **Done.** Score saves update the admin UI immediately, distinguish saved/queued states, and preserve entered scores when the network call fails.

#### OFF-02: Add local retry queue
✅ **Done.** Failed score saves are stored in a local retry queue, deduped by match, retried on page load and browser `online`, and can be manually retried from the score panel.

#### OFF-03: Add lightweight cache strategy
✅ **Done.** The service worker now separates static assets, public pages, and public tournament JSON. Public tournament payloads use stale-while-revalidate for fast repeat loads on weak signal, while admin routes and write requests stay network-only.

### Design And Accessibility

#### UI-01: Apply HPFC visual identity
✅ **Done.** Brand tokens (ink/blood/chalk/pitch/sky/gold), Bebas Neue display font, hard shadows, and uppercase tracking applied throughout. See `tailwind.config.ts` and `app/globals.css`.

#### UI-02: Mobile touch and readability pass
✅ **Done.** Score steppers and utility controls meet 44px touch targets, admin team controls avoid narrow-grid overflow, and public tables/match/bracket cards use stable columns with wrapping or horizontal scrolling where needed.

#### UI-03: Browser verification pass

- Owner: QA/UI
- Depends on: UI-02
- Work:
  - Run desktop and mobile viewport checks.
  - Capture screenshots of admin and public flows.
  - Fix console errors and layout problems.
- Acceptance:
  - No critical console errors.
  - Main flows pass visual inspection on mobile and desktop.

### Testing And Quality

#### QA-01: Add engine unit tests
✅ **Done.** `lib/tournament.test.ts` covers standings, round-robin generation, knockout seeding/progression, winner resolution, round completeness, and reversible/resettable tournament state transitions.

#### QA-02: Add route and API tests
✅ **Done.** `app/api/admin/admin-routes.test.ts` covers admin login, tournament creation, score validation/persistence, post-fixture rename-only team edits, blocked structural team changes, and confirmed tournament reset behavior with mocked Supabase clients.

#### QA-03: Add end-to-end smoke test
✅ **Done.** `npm run smoke:e2e` runs the day-of-event flow against a running app: login, create a demo tournament, generate fixtures, enter a score, and confirm the public fixture and standings update. `npm run demo:seed` runs the same setup flow without scoring for repeatable demo data.

### Deployment

#### DEP-01: Prepare Vercel deployment

- Owner: Deployment
- Depends on: F-02, DB-03
- Work:
  - Configure Vercel project.
  - Set env vars.
  - Confirm build command and output.
- Acceptance:
  - Preview deployment builds successfully.

#### DEP-02: Production launch checklist

- Owner: Deployment/event organiser
- Depends on: DEP-01, QA-03
- Work:
  - Verify admin access code.
  - Verify Supabase project and backups.
  - Verify public QR links on real phones.
  - Run demo tournament reset before event day.
- Acceptance:
  - Organisers can run through the tournament flow before the summer party.

## Definition Of Done For Any Task

- The relevant route or function works locally.
- Any changed tournament logic has unit coverage.
- Admin changes preserve manual override and correction paths.
- Public pages remain readable without login.
- No personal data collection is introduced.
- `docs/build-tasks.md` is updated in the same PR as your changes.
