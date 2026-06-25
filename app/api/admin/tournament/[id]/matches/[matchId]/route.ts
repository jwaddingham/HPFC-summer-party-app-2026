import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { progressKnockout } from '@/lib/knockout-server';
import type { MatchStage } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, matchId } = await params;
    const body = await req.json();
    const homeScore = Number(body.home_score);
    const awayScore = Number(body.away_score);

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ error: 'Scores must be non-negative integers.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from('matches')
      .select('id, stage, home_team_id, away_team_id')
      .eq('id', matchId)
      .eq('tournament_id', id)
      .single();

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

    const stage = existing.stage as MatchStage;
    const isKnockout = stage !== 'group';

    // Knockout matches must always resolve to a single advancing team. A
    // decisive score decides it; a level score needs an explicit winner
    // (penalties or an organiser's decision).
    let winnerTeamId: string | null = null;
    if (isKnockout) {
      if (homeScore > awayScore) {
        winnerTeamId = existing.home_team_id;
      } else if (awayScore > homeScore) {
        winnerTeamId = existing.away_team_id;
      } else {
        const explicit = body.winner_team_id != null ? String(body.winner_team_id) : null;
        if (!explicit) {
          return NextResponse.json(
            { error: 'This knockout match is level. Choose which team advances (penalties or decision).' },
            { status: 400 },
          );
        }
        if (explicit !== existing.home_team_id && explicit !== existing.away_team_id) {
          return NextResponse.json(
            { error: 'The advancing team must be one of the two teams in this match.' },
            { status: 400 },
          );
        }
        winnerTeamId = explicit;
      }
    }

    const { data, error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status: 'complete', winner_team_id: winnerTeamId })
      .eq('id', matchId)
      .eq('tournament_id', id)
      .select('id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

    if (!isKnockout) return NextResponse.json(data);

    const progress = await progressKnockout(supabase, id, stage);
    return NextResponse.json(progress.warning ? { ...data, warning: progress.warning } : data);
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
