import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

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
    const { data, error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status: 'complete' })
      .eq('id', matchId)
      .eq('tournament_id', id)
      .select('id, stage, round_number, home_team_id, away_team_id, home_score, away_score, status')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Match not found.' }, { status: 404 });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
