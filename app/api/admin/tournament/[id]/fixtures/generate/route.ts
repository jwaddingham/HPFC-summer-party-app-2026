import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { validateTeamCount } from '@/lib/team-validation';
import { generateRoundRobin } from '@/lib/tournament';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const supabase = getSupabaseAdminClient();

    const { count, error: countError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('tournament_id', id);

    if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: 'Fixtures already exist for this tournament.' }, { status: 409 });
    }

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('tournament_id', id)
      .order('name', { ascending: true });

    if (teamsError) return NextResponse.json({ error: teamsError.message }, { status: 500 });

    validateTeamCount(teams?.length ?? 0);

    const fixtures = generateRoundRobin((teams ?? []).map((team) => team.id));
    const rows = fixtures.map((fixture) => ({
      tournament_id: id,
      stage: 'group',
      round_number: fixture.round,
      home_team_id: fixture.home,
      away_team_id: fixture.away,
      status: 'scheduled',
    }));

    const { data: matches, error: insertError } = await supabase
      .from('matches')
      .insert(rows)
      .select('id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status');

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    const { error: tournamentError } = await supabase
      .from('tournaments')
      .update({ status: 'group_stage' })
      .eq('id', id);

    if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });

    const orderedMatches = [...(matches ?? [])].sort((a, b) => a.round_number - b.round_number);
    return NextResponse.json({ matches: orderedMatches }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate fixtures.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
