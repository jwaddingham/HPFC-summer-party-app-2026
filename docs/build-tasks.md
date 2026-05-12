# HPFC Tournament App Build Tasks

This file is a handoff list for agents and people building the Hinksey Park Football Club summer party tournament app properly. Pick one task at a time, keep changes small, and leave the app in a runnable state after each task.

## Product Priorities

- Mobile-first, fast, readable outdoors, and forgiving under pressure.
- No personal data. Store only tournament names, team names, fixtures, and scores.
- Admin score entry should be possible in under 10 seconds pitch-side.
- Public pages should be read-only and shareable without login.
- Organisers must always be able to correct mistakes, reset state, and manually override generated structure.

## Current Baseline

- Next.js App Router scaffold exists.
- Public and admin routes exist as MVP screens.
- `lib/tournament.ts` contains round-robin generation and standings calculation.
- `db/schema.sql` contains the first Supabase schema.
- Unit test setup has been added with Vitest.
- Supabase integration, realtime subscriptions, persistence, RLS policies, and offline retry queues still need implementation.
- Magic Patterns MCP server is configured in `.mcp.json` (https://mcp.magicpatterns.com/mcp) for fetching the agreed visual design.
- Scaffold components added to `app/tournament/[id]/` for `standings.tsx`, `fixtures.tsx`, and `bracket.tsx`. These currently use mock data and are not yet wired into `app/tournament/[id]/page.tsx`.

## Magic Patterns Design Integration

The visual design lives at https://www.magicpatterns.com/c/flaswdbi6nzmeedknwr5rr. WebFetch cannot access it without auth; the Magic Patterns MCP server is configured for this purpose.

### Status

- ✅ MCP server registered in `.mcp.json`.
- ⏳ Design has not yet been pulled in — the actual JSX, colors, and component structure from Magic Patterns still need to replace the scaffold mock components listed above.
- ⏳ Scaffold components are placeholders only. They illustrate the data shape (Standing, Match) and rough layout, but the visual identity should come from the Magic Patterns export, not these scaffolds.

### Next steps for design integration

1. Use the Magic Patterns MCP server to fetch the design content from the URL above.
2. Replace mock data in `app/tournament/[id]/standings.tsx`, `fixtures.tsx`, and `bracket.tsx` with the Magic Patterns layout.
3. Wire the components into `app/tournament/[id]/page.tsx` so the public tournament centre shows standings + fixtures + bracket on one page (per PUB-02).
4. Audit any additional screens in the design that aren't yet scaffolded (e.g. a QR share screen, a "tournament complete" winner treatment, an admin score-entry redesign) and add a sub-task for each under PUB or UI.
5. Apply colors and typography from the design to `tailwind.config.ts` and `app/globals.css` (currently `hpfcRed` and `hpfcGold` are referenced but may not be defined).

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

- Owner: Build/setup
- Depends on: None
- Work:
  - Run package install.
  - Commit `package-lock.json` or the selected package-manager lockfile.
  - Confirm `npm run build`, `npm run lint`, and `npm run test` are available.
- Acceptance:
  - A fresh clone can install and run the project from documented commands.
  - Test script exits successfully.

#### F-02: Add environment examples

- Owner: Build/setup
- Depends on: F-01
- Work:
  - Add `.env.example` with required keys.
  - Document local Supabase setup and Vercel env vars.
- Acceptance:
  - README explains exactly which env vars are needed and what each one does.
  - No secrets are committed.

#### F-03: Add shared Supabase clients

- Owner: Backend/frontend
- Depends on: F-02
- Work:
  - Add browser client for public reads and realtime subscriptions.
  - Add server/admin client for protected mutations where needed.
  - Keep client bundle small.
- Acceptance:
  - Routes use a single shared Supabase helper pattern.
  - Missing env vars produce useful local errors.

#### F-04: Configure linting and dependency audit policy

- Owner: Build/setup
- Depends on: F-01
- Work:
  - Add a real ESLint setup or replace the placeholder `next lint` script with the current Next.js-supported lint command.
  - Decide whether dependency audits should fail CI and at which severity.
  - Upgrade vulnerable framework packages before production launch.
- Acceptance:
  - `npm run lint` runs non-interactively.
  - Dependency audit expectations are documented.
  - Known critical production dependency warnings are resolved before deployment.

### Database And Security

#### DB-01: Enforce match teams belong to the same tournament

- Owner: Database
- Depends on: None
- Status: Done in `db/schema.sql`; verify against Supabase locally.
- Work:
  - Use composite foreign keys from `matches(tournament_id, team_id)` to `teams(tournament_id, id)`.
  - Apply this to home team, away team, and winner team.
- Acceptance:
  - A match cannot reference a team from another tournament.
  - Existing tournament delete behavior still works.

#### DB-02: Add indexes for live pages

- Owner: Database
- Depends on: DB-01
- Work:
  - Index `teams(tournament_id)`.
  - Index `matches(tournament_id, stage, status)`.
  - Index `matches(tournament_id, round_number)`.
- Acceptance:
  - Public tournament page queries are simple and indexed.

#### DB-03: Add RLS policies

- Owner: Database/security
- Depends on: F-03
- Work:
  - Public can read tournaments, teams, and matches.
  - Public cannot write.
  - Admin writes go through protected server routes or verified Supabase policies.
- Acceptance:
  - Anonymous writes fail.
  - Public tournament pages still load without authentication.
  - Admin write flow succeeds only after access-code auth.

#### DB-04: Add migrations and seed data

- Owner: Database
- Depends on: DB-01
- Work:
  - Move schema into a migration-friendly structure.
  - Add seed demo tournaments for 4, 6, and 8 team formats.
  - Add reset script for local testing.
- Acceptance:
  - Demo data can be reset quickly.
  - Seeded tournaments cover group and knockout scenarios.

### Tournament Engine

#### ENG-01: Expand unit tests for `buildTable`

- Owner: Engine/test
- Depends on: F-01
- Status: Started in `lib/tournament.test.ts`.
- Work:
  - Add edge cases for equal points, equal goal difference, equal goals scored, draws, missing scores, and cancelled matches.
  - Add tests for accidental cross-tournament or unknown team references.
- Acceptance:
  - Standings logic is covered by unit tests before admin/public wiring depends on it.

#### ENG-02: Improve round-robin fixture generation

- Owner: Engine
- Depends on: ENG-01
- Work:
  - Generate sensible rounds rather than only sequential match numbers.
  - Support 4, 6, and 8 teams.
  - Keep output deterministic for testing.
- Acceptance:
  - Every pair plays exactly once.
  - No team appears twice in the same generated round where avoidable.
  - Unit tests cover 4, 6, and 8 team fixtures.

#### ENG-03: Add knockout generation

- Owner: Engine
- Depends on: ENG-01
- Work:
  - Generate top-four semi-finals for 4 and 6 team tournaments.
  - For 8 teams, support both top-four and quarter-final modes.
  - Use default seeding rules from the product brief.
- Acceptance:
  - 1st vs 4th and 2nd vs 3rd are generated for top-four mode.
  - 1st vs 8th, 2nd vs 7th, 3rd vs 6th, and 4th vs 5th are generated for quarter-final mode.
  - Admin can preview seeds before saving fixtures.

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
- Work:
  - Store shared admin code in env vars.
  - Persist successful session locally with reasonable expiry.
  - Protect all admin pages.
- Acceptance:
  - Admin pages redirect to `/admin` without a valid session.
  - Public routes remain open.

#### ADM-02: Build tournament creation flow

- Owner: Admin/frontend/backend
- Depends on: ADM-01, DB-03
- Work:
  - Create tournament name.
  - Select team count.
  - Enter team names quickly.
  - Save tournament and teams to Supabase.
- Acceptance:
  - An organiser can create a 4, 6, or 8 team tournament on a phone.
  - Empty team names are handled clearly.

#### ADM-03: Generate and manage group fixtures

- Owner: Admin/engine
- Depends on: ADM-02, ENG-02
- Work:
  - Generate fixtures from saved teams.
  - Let admins edit fixture teams, reset fixtures, cancel matches, or replay matches.
  - Prevent duplicate generation accidents unless confirmed.
- Acceptance:
  - Fixtures are persisted.
  - Manual edits are reflected immediately in admin and public views.

#### ADM-04: Build rapid score entry

- Owner: Admin/frontend/backend
- Depends on: ADM-03
- Work:
  - Show next scheduled fixtures at the top.
  - Provide large score controls and a fast save action.
  - Allow editing completed scores.
- Acceptance:
  - Score entry can be completed in under 10 seconds on mobile.
  - Failed saves keep the entered result locally and show retry state.

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

- Owner: Admin/frontend/backend
- Depends on: ADM-02, DB-03
- Work:
  - Add create, edit, reorder, and delete controls for teams in admin setup flows.
  - Persist team changes to Supabase with clear validation for empty or duplicate names.
  - Lock all team mutations once fixtures exist for the tournament.
- Acceptance:
  - Teams are no longer hard-coded in admin or public tournament views.
  - Organisers can fully manage 4, 6, or 8 team rosters before fixtures are generated.
  - Attempts to mutate teams after fixtures exist are blocked with clear guidance.

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
  - Show active tournaments.
  - Make cards readable outdoors with large tap targets.
  - Include status and next match summary where available.
- Acceptance:
  - Parents can reach any live tournament in one tap from `/`.

#### PUB-02: Build live tournament centre

- Owner: Public/frontend/backend
- Depends on: PUB-01, ADM-04
- Work:
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

- Owner: UI
- Depends on: Core routes existing
- Work:
  - Use black and deep red as dominant colors.
  - Use white for readability.
  - Use blue and gold only as subtle accents.
  - Keep the feel sporty, practical, and grassroots.
- Acceptance:
  - Screens feel like a football tournament wall chart, not corporate SaaS.
  - Contrast is strong in sunlight.

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
- README or this task file is updated if setup or workflow changes.
