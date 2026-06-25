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
✅ **Done.** Applied in `db/migrations/20260512134000_add_live_page_indexes.sql`.

#### DB-03: Add RLS policies
✅ **Done.** Public SELECT allowed on all tables; anonymous writes blocked. Applied in `db/migrations/20260512135000_enable_rls_public_reads.sql`.

#### DB-04: Add migrations and seed data

- Owner: Database
- Depends on: DB-01
- Work:
  - Add seed demo tournaments for 4, 6, and 8 team formats.
  - Add reset script for local testing.
- Acceptance:
  - Demo data can be reset quickly.
  - Seeded tournaments cover group and knockout scenarios.

### Tournament Engine

#### ENG-01: Expand unit tests for `buildTable`

- Owner: Engine/test
- Depends on: F-01
- Status: Started in `lib/tournament.test.ts`. Needs more edge cases.
- Work:
  - Add edge cases for equal points, equal goal difference, equal goals scored, draws, missing scores, and cancelled matches.
  - Add tests for accidental cross-tournament or unknown team references.
- Acceptance:
  - Standings logic is covered by unit tests before admin/public wiring depends on it.

#### ENG-02: Improve round-robin fixture generation
✅ **Done.** Generates balanced rounds for 4, 6, and 8 teams. Every pair plays exactly once. Unit tests cover all three sizes.

#### ENG-03: Add knockout generation
✅ **Done.** `generateKnockoutFixtures()` in `lib/tournament.ts` supports top-four (1v4, 2v3) and quarter-final (1v8…4v5) modes for 4, 6, and 8 team tournaments.

#### ENG-04: Add knockout progression

- Owner: Engine/backend
- Depends on: ENG-03
- Work:
  - Progress winners into the next round.
  - Support draw scores with explicit winner selection.
  - Allow manual winner override after save.
- Acceptance:
  - Semi-final winners populate the final.
  - Final winner is stored and displayed.
  - Changing a previous result updates or flags dependent matches clearly.

#### ENG-05: Add state transition rules

- Owner: Engine/backend
- Depends on: DB-03
- Work:
  - Define allowed transitions between setup, group stage, knockout stage, and complete.
  - Keep transitions reversible through admin actions.
- Acceptance:
  - App never traps organisers in an irreversible state.
  - Manual reset and rollback paths are documented and tested.

### Admin Experience

#### ADM-01: Finish access-code session handling

- Owner: Admin/security
- Depends on: F-03
- Status: Partially done. Access code checked via `x-hpfc-admin: 1` header stored in `localStorage`. Needs proper expiry and page-level redirect guard.
- Work:
  - Persist successful session locally with reasonable expiry.
  - Protect all admin pages with redirect to `/admin` if no valid session.
- Acceptance:
  - Admin pages redirect to `/admin` without a valid session.
  - Public routes remain open.

#### ADM-02: Build tournament creation flow
✅ **Done.** `app/admin/tournaments/page.tsx` + `CreateTournamentForm` + `POST /api/admin/tournaments`. Saves tournament and teams to Supabase.

#### ADM-03: Generate and manage group fixtures
✅ **Done.** `FixturePanel` component + `POST /api/admin/tournament/[id]/fixtures/generate`. Generates round-robin, persists to Supabase, displays grouped by round. Team mutations locked once fixtures exist.

#### ADM-04: Build rapid score entry
✅ **Done.** Inline score steppers (+/− buttons, 40px tap targets) on every fixture card. Per-match save with saving/saved/error states. Scheduled matches shown first per round. Completed scores pre-filled for editing. New `PATCH /api/admin/tournament/[id]/matches/[matchId]` route. Completed matches have persistent green border and checkmark badge to distinguish from unscored ones (especially 0-0 results).

#### ADM-05: Add knockout admin controls

- Owner: Admin/engine
- Depends on: ENG-03, ENG-04
- Work:
  - Let admins choose 8-team knockout mode.
  - Let admins reorder seeds before generation.
  - Record draw winners by penalties or admin decision.
  - Manually advance teams if needed.
- Acceptance:
  - Generated bracket can be corrected without database surgery.
  - Final winner can be marked and corrected.

#### ADM-06: Add admin reset and demo utilities

- Owner: Admin/backend
- Depends on: DB-04
- Work:
  - Reset a tournament to setup.
  - Delete generated fixtures.
  - Seed a demo tournament locally.
- Acceptance:
  - Reset actions require confirmation.
  - Demo flows can be run repeatedly for testing.

#### ADM-07: Build team management CRUD
✅ **Done.** `ManageTeams` component in `app/admin/tournament/[id]/manage-teams.tsx`. Create, edit, reorder, delete with confirmation. All mutations locked once fixtures exist. Aria-labels on all icon buttons.

#### ADM-08: Define safe team mutations after fixtures exist

- Owner: Admin/engine/backend
- Depends on: ADM-07, ENG-05
- Work:
  - Decide which post-fixture team changes are permitted (for example rename-only).
  - Define how allowed mutations impact fixtures, standings, and knockout progression.
  - Add confirmation UX and rollback/reset pathways for risky or destructive actions.
- Acceptance:
  - Organisers can understand exactly which team edits are safe after fixtures exist.
  - Unsafe edits are blocked or routed through explicit reset/regenerate flows.
  - Tournament integrity remains valid after any permitted mutation.

### Public Spectator Experience

#### PUB-01: Build public tournament list

- Owner: Public/frontend
- Depends on: F-03
- Work:
  - Wire `app/page.tsx` to real Supabase data (currently mock).
  - Make cards readable outdoors with large tap targets.
  - Include status and next match summary where available.
- Acceptance:
  - Parents can reach any live tournament in one tap from `/`.

#### PUB-02: Build live tournament centre

- Owner: Public/frontend/backend
- Depends on: PUB-01, ADM-04
- Work:
  - Wire `app/tournament/[id]/page.tsx` to real Supabase data (currently mock).
  - Show status, standings, fixtures, recent results, upcoming matches, and bracket.
  - Subscribe to Supabase realtime or poll lightly as fallback.
- Acceptance:
  - Entering a result in admin updates the public page in near real time.
  - Page remains useful if realtime temporarily drops.

#### PUB-03: Add QR code and share links

- Owner: Public/frontend
- Depends on: PUB-02
- Work:
  - Generate QR code for each public tournament page.
  - Add copy/share URL action.
  - Make QR visible from admin and public pages.
- Acceptance:
  - Organisers can show or print a QR code on the day.
  - Public URLs require no login.

#### PUB-04: Add complete-state winner treatment

- Owner: Public/frontend
- Depends on: ENG-04
- Work:
  - Display the tournament winner prominently after completion.
  - Keep the final table and bracket visible.
- Acceptance:
  - Completed tournaments still serve as a clear record of results.

### Offline And Weak-Signal Resilience

#### OFF-01: Add optimistic score saves

- Owner: Resilience/frontend
- Depends on: ADM-04
- Work:
  - Update UI immediately after score entry.
  - Show pending, saved, and failed states.
- Acceptance:
  - Admin does not lose typed scores during a poor connection.

#### OFF-02: Add local retry queue

- Owner: Resilience/frontend/backend
- Depends on: OFF-01
- Work:
  - Store pending score updates locally.
  - Retry when connectivity returns or page reloads.
  - Avoid duplicate writes.
- Acceptance:
  - Turning the network off and back on does not lose a saved result.

#### OFF-03: Add lightweight cache strategy

- Owner: Resilience/frontend
- Depends on: PUB-02
- Work:
  - Cache public data where sensible.
  - Avoid large service-worker complexity unless it proves necessary.
- Acceptance:
  - Repeat visits load quickly on weak mobile signal.

### Design And Accessibility

#### UI-01: Apply HPFC visual identity
✅ **Done.** Brand tokens (ink/blood/chalk/pitch/sky/gold), Bebas Neue display font, hard shadows, and uppercase tracking applied throughout. See `tailwind.config.ts` and `app/globals.css`.

#### UI-02: Mobile touch and readability pass

- Owner: UI/accessibility
- Depends on: ADM-04, PUB-02
- Work:
  - Check tap target sizes.
  - Check table scrolling and text wrapping on small phones.
  - Avoid overlapping content.
- Acceptance:
  - Admin score entry works one-handed.
  - Public table and fixtures are readable on a narrow mobile screen.

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

- Owner: QA/engine
- Depends on: ENG-01, ENG-02, ENG-03, ENG-04
- Work:
  - Cover standings, fixture generation, knockout seeding, and bracket progression.
- Acceptance:
  - Tournament logic can be changed safely.

#### QA-02: Add route and API tests

- Owner: QA/backend
- Depends on: ADM-02, ADM-04, DB-03
- Work:
  - Test admin auth route.
  - Test tournament creation.
  - Test score update and validation.
- Acceptance:
  - Invalid writes are rejected.
  - Valid admin writes persist.

#### QA-03: Add end-to-end smoke test

- Owner: QA
- Depends on: PUB-02, ADM-04
- Work:
  - Create a demo tournament.
  - Generate fixtures.
  - Enter a score.
  - Confirm standings update publicly.
- Acceptance:
  - One command verifies the core day-of-event flow.

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
