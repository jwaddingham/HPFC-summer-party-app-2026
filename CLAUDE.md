# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Workflow

Follow these steps for every session:

1. Read `docs/build-tasks.md` to understand what needs doing and what is already done.
2. Pull or fetch from `main` to get the latest code before starting.
3. Create a new branch for every change — never commit directly to `main`.
4. When a task is complete, mark it done in `docs/build-tasks.md` in the same PR.

See `docs/agents.md` for the full agent handoff guide, current task state, and architectural decisions.

## Commands

```bash
npm run dev        # Start dev server (also auto-runs pending DB migrations)
npm run build      # Production build + type-check
npm run lint       # ESLint via Next.js
npm run test       # Vitest unit tests
npm run db:migrate # Run Supabase migrations manually
```

Run a single test file:
```bash
npx vitest run lib/tournament.test.ts
```

## Environment Variables

Required in `.env.local`:

```
ADMIN_ACCESS_CODE=          # Shared admin passcode
NEXT_PUBLIC_SUPABASE_URL=   # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-side only — never expose to client
```

## Architecture

### Stack
- **Next.js 15 App Router** with TypeScript strict mode
- **Supabase** for Postgres, RLS, and realtime subscriptions
- **Tailwind CSS** with HPFC brand tokens (see Brand Tokens below)
- **Vitest** for unit tests
- **Vercel** for deployment; GitHub Actions for DB migrations on push to main

### Route Layout

```
app/
  page.tsx                          # Public tournament list
  tournament/[id]/page.tsx          # Public tournament centre (table/fixtures/bracket)
  admin/page.tsx                    # Access-code login gate
  admin/dashboard/page.tsx          # Admin home
  admin/tournaments/page.tsx        # Tournament list + create form
  admin/tournament/[id]/page.tsx    # Admin tournament detail
  api/admin/
    login/route.ts
    tournaments/route.ts
    tournament/[id]/teams/route.ts
    tournament/[id]/teams/[teamId]/route.ts
    tournament/[id]/fixtures/generate/route.ts
```

### Key Libraries

| File | Purpose |
|---|---|
| `lib/tournament.ts` | Pure engine: round-robin generation, knockout seeding, standings (`buildTable`) |
| `lib/types.ts` | Shared enums: `TournamentStatus`, `MatchStage`, `MatchStatus` |
| `lib/team-validation.ts` | Team name rules: max 32 chars, unique, 4/6/8 count only |
| `lib/supabase/server.ts` | `getSupabasePublicClient()` and `getSupabaseAdminClient()` |
| `lib/admin-auth.ts` | `isAdminRequest(req)` — checks `x-hpfc-admin: 1` header |

### API Route Pattern

All admin API routes follow this shape:

```typescript
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('table').insert(row).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

Client components send the admin header via:
```typescript
function getAdminHeaders(): Record<string, string> {
  return localStorage.getItem('hpfc_admin') === '1' ? { 'x-hpfc-admin': '1' } : {};
}
```

### Database Schema

Tables: `tournaments`, `teams`, `matches`. All have RLS enabled with public SELECT and no anonymous writes. Admin mutations go through server routes using the service-role client.

Migrations live in `db/migrations/` and run automatically on `npm run dev`.

Allowed team counts: **4, 6, or 8** (enforced in `lib/team-validation.ts` and the engine).

### Tournament Status Flow

```
setup → group_stage → knockout_stage → complete
```

Fixtures are locked once generated; team mutations are blocked after fixtures exist.

## Brand Tokens

| Token | Value | Use |
|---|---|---|
| `ink` | #0B0B0B | Primary text, borders, buttons |
| `blood` | #B11226 | HPFC red — CTAs, badges, destructive actions |
| `chalk` | #FAFAF7 | Page backgrounds |
| `pitch` | #1E5A3A | Grass green — occasional accents |
| `sky` | #1E5BA8 | Blue — secondary actions |
| `gold` | #E8B83B | Warnings, highlights |

Fonts: `font-display` = Bebas Neue (headings), `font-sans` = Inter (body), `font-hand` = Permanent Marker.

Visual language: hard shadows (`shadow-hard`), uppercase tracking, large tap targets, strong contrast for outdoor readability.

## Testing

Unit tests cover the tournament engine (`lib/tournament.test.ts`). Run before pushing any changes to `lib/tournament.ts`.

No E2E tests yet — manual smoke test flow is documented in `docs/build-tasks.md` under QA-03.
