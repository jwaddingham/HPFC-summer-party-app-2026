import { NextResponse } from 'next/server';
import { getTournamentDetail } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabasePublicEnv()) {
    return NextResponse.json({ error: 'Supabase environment variables are missing.' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const tournament = await getTournamentDetail(id);
    if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });
    return NextResponse.json(tournament);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load tournament.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
