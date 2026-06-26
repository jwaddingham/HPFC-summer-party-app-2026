import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { assertTransition } from '@/lib/tournament';
import type { TournamentStatus } from '@/lib/types';

const RESET_CONFIRMATION = 'RESET_TO_SETUP';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { confirm?: string };

    if (body.confirm !== RESET_CONFIRMATION) {
      return NextResponse.json({ error: 'Reset confirmation is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });
    if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });

    const status = tournament.status as TournamentStatus;
    assertTransition(status, 'setup');

    const { data: deletedMatches, error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', id)
      .select('id');

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    const { error: statusError } = await supabase
      .from('tournaments')
      .update({ status: 'setup', third_place_playoff: false })
      .eq('id', id);

    if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      status: 'setup',
      deletedMatches: deletedMatches?.length ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reset tournament.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
