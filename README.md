# HPFC Summer Party Tournament App

## Architecture plan
- **Frontend**: Next.js App Router, Tailwind, mobile-first cards + large tap targets.
- **Backend**: Supabase Postgres + Realtime + RLS. Server routes validate admin code.
- **Data flow**: Admin writes results -> optimistic UI -> persist to DB -> realtime fanout to public pages.
- **Resilience**: local draft cache for pending score updates, retry queue, stateless public pages.

## Component structure
- `app/page.tsx`: public tournament list.
- `app/tournament/[id]/page.tsx`: live tournament centre (table, fixtures, bracket).
- `app/admin/page.tsx`: shared-code gate.
- `app/admin/tournaments/page.tsx`: today dashboard.
- `app/admin/tournament/[id]/page.tsx`: rapid score entry + manual overrides.
- `lib/tournament.ts`: fixture + standings engine.
- `db/schema.sql`: Supabase schema.

## MVP build order status
1. ✅ Multiple tournaments/public list
2. ✅ Team setup and fixtures engine utilities
3. ✅ Score entry UI + live table calculation
4. ✅ Admin access code route
5. ⏳ Next: browser verification, deployment checks, and event-day launch rehearsal

See `docs/build-tasks.md` for a handoff-ready backlog with owners, dependencies, and acceptance criteria.

## Local setup
```bash
npm install
cp .env.example .env.local
# edit .env.local with your Supabase project values and admin code
npm run dev
npm run test
```

To reset a local Supabase database and load deterministic 4, 6, and 8 team demo tournaments:
```bash
npm run db:reset:local
```

To create a fresh demo tournament through the app APIs while the dev server is running:
```bash
npm run demo:seed
```

To smoke-test the core day-of-event flow against a running local or preview app:
```bash
# Optional when testing a deployed preview:
# HPFC_BASE_URL=https://your-preview-url HPFC_ADMIN_CODE=your-code npm run smoke:e2e
npm run smoke:e2e
```

The smoke flow logs in, creates a demo tournament, generates fixtures, enters one score, and verifies that the public tournament table updates. It reads `.env.local` automatically for local runs.

### Environment variables

The app reads environment variables from `.env.local` in development and from the deployment provider in hosted environments. Use `.env.example` as the template and never commit real secrets.

| Variable | Required where | Purpose |
| --- | --- | --- |
| `ADMIN_ACCESS_CODE` | Local, Vercel server runtime | Shared organiser code checked by `POST /api/admin/login`. Keep it server-only and use a long event-specific value. |
| `NEXT_PUBLIC_SUPABASE_URL` | Local, Vercel client/server runtime | Public Supabase project URL used by browser and server Supabase clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local, Vercel client/server runtime | Public anon key used for read-only public data access. RLS policies protect writes from anonymous users. |
| `SUPABASE_SERVICE_ROLE_KEY` | Local, Vercel server runtime | Server-only key used by admin API routes for trusted writes. Never prefix with `NEXT_PUBLIC_`. |
| `SUPABASE_DB_URL` | CI/explicit remote migration commands | Postgres connection string used when pushing migrations to an explicit database with `--db-url`. |
| `SUPABASE_DB_PASSWORD` | CI/Vercel project setup | Database password used by GitHub Actions/Supabase CLI workflows that push migrations. |

### Local Supabase setup

1. Install and authenticate the Supabase CLI.
2. Start a local Supabase stack or create a hosted Supabase project.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings. For local Supabase, use the values printed by `supabase start`.
5. Run `npm run db:migrate:local` to apply the schema to the local Supabase stack, or run `npm run dev` which runs local migrations before starting Next.js.

### Vercel environment setup

Add the runtime variables below in Vercel Project Settings → Environment Variables for Preview and Production:

- `ADMIN_ACCESS_CODE`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

These are the only Vercel runtime variables the app needs. Keep `SUPABASE_DB_URL` and `SUPABASE_DB_PASSWORD` in GitHub repository secrets for migration workflows rather than adding them to Vercel or exposing them to the browser.


## Linting and dependency audits

`npm run lint` runs the ESLint CLI non-interactively across JavaScript and TypeScript files. The generated design-reference files under `docs/Magic Patterns design/` and the placeholder icon helper script are ignored so linting focuses on runnable app and configuration code.

Run production dependency audits with:
```bash
npm run audit:prod
```

CI should fail on high or critical vulnerabilities in production dependencies. Development-only audit findings should be reviewed before release, but they do not block day-of-event preview builds unless they affect runtime code, secrets, or deployment tooling.

## Database migrations
Apply SQL migrations to the local Supabase stack with:
```bash
npm run db:migrate:local
```

Local migrations auto-run before the development server:
```bash
npm run dev
```

`db:migrate` is a local-safe alias for `db:migrate:local`, and `dev:migrate` is kept as an explicit alias.
`db:reset:local` runs Supabase's local reset flow, applying migrations from `supabase/migrations` and then `supabase/seed.sql`.

To push migrations to a hosted database outside the GitHub workflow, set `SUPABASE_DB_URL` and `SUPABASE_DB_PASSWORD`, then run:
```bash
npm run db:migrate:remote
```

## CI migration workflow
- PRs to `main` run a blocking dry-run check: `supabase-dry-run`.
- Pushes to `main` run `supabase db push --db-url "$SUPABASE_DB_URL" --password "$SUPABASE_DB_PASSWORD"` before deployment workflows.

Required GitHub repository secrets:
- `SUPABASE_DB_URL`
- `SUPABASE_DB_PASSWORD`
