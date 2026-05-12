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
5. ⏳ Next: knockout generation + bracket progression + QR links + offline queue

See `docs/build-tasks.md` for a handoff-ready backlog with owners, dependencies, and acceptance criteria.

## Local setup
```bash
npm install
npm run dev
npm run test
```
Set `.env.local`:
```bash
ADMIN_ACCESS_CODE=your-code
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Database migrations
Apply SQL migrations with Supabase CLI:
```bash
npm run db:migrate
```

Migrations currently auto-run on app start for this project:
```bash
npm run dev
npm run start
```

`dev:migrate` is kept as an explicit alias.

## CI migration workflow
- PRs to `main` run a blocking dry-run check: `supabase-dry-run`.
- Pushes to `main` run `supabase db push` before deployment workflows.

Required GitHub repository secrets:
- `SUPABASE_DB_URL`
- `SUPABASE_DB_PASSWORD`
