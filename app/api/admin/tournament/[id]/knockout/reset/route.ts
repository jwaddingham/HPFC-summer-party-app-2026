import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { assertTransition } from '@/lib/tournament';
import type { TournamentStatus } from '@/lib/types';

/**
 * Roll the knockout stage back: delete every non-group match and return the
 * tournament to the group stage so organisers can re-seed or re-draw the
 * bracket. Group results are preserved.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });
    if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });

    const status = tournament.status as TournamentStatus;
    if (status !== 'knockout_stage' && status !== 'complete') {
      return NextResponse.json({ error: 'There is no knockout stage to reset.' }, { status: 409 });
    }
    assertTransition(status, 'group_stage');

    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', id)
      .neq('stage', 'group');

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    const { error: statusError } = await supabase
      .from('tournaments')
      .update({ status: 'group_stage', third_place_playoff: false })
      .eq('id', id);

    if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

    return NextResponse.json({ ok: true, status: 'group_stage' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reset the knockout stage.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
