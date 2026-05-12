import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { validateTeamCount, validateTeamNames } from '@/lib/team-validation';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, teamCount, teamNames } = await req.json();
    const tournamentName = String(name ?? '').trim();
    if (!tournamentName) return NextResponse.json({ error: 'Tournament name is required.' }, { status: 400 });

    validateTeamCount(Number(teamCount));
    const normalizedNames = validateTeamNames(Array.isArray(teamNames) ? teamNames : [], Number(teamCount));

    const supabase = getSupabaseAdminClient();
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({ name: tournamentName })
      .select('id')
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: tournamentError?.message ?? 'Failed to create tournament.' }, { status: 500 });
    }

    const rows = normalizedNames.map((teamName) => ({ tournament_id: tournament.id, name: teamName }));
    const { error: teamError } = await supabase.from('teams').insert(rows);

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    return NextResponse.json({ id: tournament.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
