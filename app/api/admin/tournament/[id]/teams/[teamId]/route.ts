import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { validateMutableTeamCount } from '@/lib/team-validation';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> },
) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, teamId } = await params;
    const supabase = getSupabaseAdminClient();

    const { count: fixtureCount, error: fixtureError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', id);

    if (fixtureError) return NextResponse.json({ error: fixtureError.message }, { status: 500 });
    if ((fixtureCount ?? 0) > 0) {
      return NextResponse.json({ error: 'Team changes are locked once fixtures exist.' }, { status: 409 });
    }

    const { data: teams, error: teamsError } = await supabase.from('teams').select('id').eq('tournament_id', id);
    if (teamsError) return NextResponse.json({ error: teamsError.message }, { status: 500 });

    validateMutableTeamCount((teams?.length ?? 0) - 1);

    const { error } = await supabase.from('teams').delete().eq('id', teamId).eq('tournament_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
