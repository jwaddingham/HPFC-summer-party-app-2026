import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

const DELETE_CONFIRMATION = 'DELETE_TOURNAMENT';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { confirm?: string };

    if (body.confirm !== DELETE_CONFIRMATION) {
      return NextResponse.json({ error: 'Delete confirmation is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('id', id)
      .single();

    if (tournamentError) {
      if (tournamentError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });
      }
      return NextResponse.json({ error: tournamentError.message }, { status: 500 });
    }
    if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });

    const { data: deletedMatches, error: matchDeleteError } = await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', id)
      .select('id');

    if (matchDeleteError) return NextResponse.json({ error: matchDeleteError.message }, { status: 500 });

    const { data: deletedTournament, error: tournamentDeleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (tournamentDeleteError) return NextResponse.json({ error: tournamentDeleteError.message }, { status: 500 });
    if (!deletedTournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });

    return NextResponse.json({
      ok: true,
      deletedTournament: tournament.name,
      deletedMatches: deletedMatches?.length ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete tournament.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
