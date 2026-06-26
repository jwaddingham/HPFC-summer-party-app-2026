import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { assertTransition, buildTable, generateKnockoutFixtures } from '@/lib/tournament';
import type { Match, Team, TournamentStatus } from '@/lib/types';

const KNOCKOUT_MODES = ['top4', 'quarter_finals'] as const;
type KnockoutMode = (typeof KNOCKOUT_MODES)[number];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const supabase = getSupabaseAdminClient();

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, status, knockout_mode, third_place_playoff')
      .eq('id', id)
      .single();

    if (tournamentError) return NextResponse.json({ error: tournamentError.message }, { status: 500 });
    if (!tournament) return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 });

    const status = tournament.status as TournamentStatus;
    if (status !== 'group_stage') {
      return NextResponse.json(
        { error: 'Finish the group stage before drawing the knockout bracket.' },
        { status: 409 },
      );
    }
    assertTransition(status, 'knockout_stage');

    const [{ data: teams, error: teamsError }, { data: matches, error: matchesError }] = await Promise.all([
      supabase.from('teams').select('id, tournament_id, name').eq('tournament_id', id),
      supabase
        .from('matches')
        .select('id, tournament_id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status')
        .eq('tournament_id', id),
    ]);

    if (teamsError) return NextResponse.json({ error: teamsError.message }, { status: 500 });
    if (matchesError) return NextResponse.json({ error: matchesError.message }, { status: 500 });

    const allMatches = (matches ?? []) as Match[];
    if (allMatches.some((match) => match.stage !== 'group')) {
      return NextResponse.json(
        { error: 'Knockout fixtures already exist. Reset the knockout stage first.' },
        { status: 409 },
      );
    }

    const groupMatches = allMatches.filter((match) => match.stage === 'group');
    if (groupMatches.length === 0) {
      return NextResponse.json({ error: 'Generate and play the group stage first.' }, { status: 409 });
    }
    if (groupMatches.some((match) => match.status === 'scheduled')) {
      return NextResponse.json(
        { error: 'Finish every group match before drawing the knockout bracket.' },
        { status: 409 },
      );
    }

    const mode = (body.mode ?? tournament.knockout_mode ?? 'top4') as KnockoutMode;
    if (!KNOCKOUT_MODES.includes(mode)) {
      return NextResponse.json({ error: 'Unknown knockout mode.' }, { status: 400 });
    }
    const thirdPlacePlayoff =
      typeof body.thirdPlacePlayoff === 'boolean'
        ? body.thirdPlacePlayoff
        : Boolean(tournament.third_place_playoff);

    const teamList = (teams ?? []) as Team[];
    const teamIds = new Set(teamList.map((team) => team.id));
    const defaultOrder = buildTable(teamList, groupMatches).map((row) => row.teamId);

    const seeds: string[] =
      Array.isArray(body.seeds) && body.seeds.length > 0 ? body.seeds.map(String) : defaultOrder;

    if (new Set(seeds).size !== seeds.length) {
      return NextResponse.json({ error: 'Seed order cannot repeat a team.' }, { status: 400 });
    }
    if (seeds.some((seedId) => !teamIds.has(seedId))) {
      return NextResponse.json({ error: 'Seed order includes an unknown team.' }, { status: 400 });
    }
    if (seeds.length !== teamList.length) {
      return NextResponse.json({ error: 'Seed order must include every team.' }, { status: 400 });
    }

    let fixtures;
    try {
      fixtures = generateKnockoutFixtures(seeds, mode);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to draw the knockout bracket.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const rows = fixtures.map((fixture) => ({
      tournament_id: id,
      stage: fixture.stage,
      round_number: fixture.round,
      home_team_id: fixture.home,
      away_team_id: fixture.away,
      status: 'scheduled',
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert(rows)
      .select('id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status');

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    const { error: statusError } = await supabase
      .from('tournaments')
      .update({ status: 'knockout_stage', knockout_mode: mode, third_place_playoff: thirdPlacePlayoff })
      .eq('id', id);

    if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });

    return NextResponse.json({ matches: inserted, mode, thirdPlacePlayoff }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate the knockout bracket.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
