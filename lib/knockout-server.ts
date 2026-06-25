import type { SupabaseClient } from '@supabase/supabase-js';
import {
  canTransition,
  computeNextKnockoutRound,
  isKnockoutRoundComplete,
  nextKnockoutStage,
} from './tournament';
import type { Match, MatchStage, TournamentStatus } from './types';

type AdminClient = SupabaseClient;

export const KNOCKOUT_MATCH_COLUMNS =
  'id, tournament_id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status';

/**
 * Update a tournament's status while respecting the state machine. Invalid or
 * no-op transitions are skipped silently so callers can request a target state
 * without first checking the current one.
 */
export async function setTournamentStatus(
  supabase: AdminClient,
  tournamentId: string,
  target: TournamentStatus,
): Promise<void> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('status')
    .eq('id', tournamentId)
    .single();
  if (error || !data) return;

  const current = data.status as TournamentStatus;
  if (current === target) return;
  if (!canTransition(current, target)) return;

  await supabase.from('tournaments').update({ status: target }).eq('id', tournamentId);
}

export interface KnockoutProgressResult {
  warning?: string;
}

/**
 * Advance or flag the knockout bracket after a match in `stage` was scored.
 *
 * - When the round is complete, draw the next round — inserting it, or updating
 *   an existing next round in place. If a previously decided result changed who
 *   advances, the dependent match is reset and the caller is warned.
 * - When the final is decided, move the tournament to `complete`.
 */
export async function progressKnockout(
  supabase: AdminClient,
  tournamentId: string,
  stage: MatchStage,
): Promise<KnockoutProgressResult> {
  if (stage === 'group') return {};

  const { data, error } = await supabase
    .from('matches')
    .select(KNOCKOUT_MATCH_COLUMNS)
    .eq('tournament_id', tournamentId)
    .neq('stage', 'group');
  if (error || !data) return {};

  const knockoutMatches = data as Match[];

  if (stage === 'final') {
    const final = knockoutMatches.find((match) => match.stage === 'final');
    if (final && isKnockoutRoundComplete([final])) {
      await setTournamentStatus(supabase, tournamentId, 'complete');
    }
    return {};
  }

  const nextStage = nextKnockoutStage(stage);
  if (!nextStage) return {};

  const stageMatches = knockoutMatches.filter((match) => match.stage === stage);
  if (!isKnockoutRoundComplete(stageMatches)) return {};

  let fixtures;
  try {
    fixtures = computeNextKnockoutRound(stage, stageMatches);
  } catch {
    return {};
  }

  const existingNext = knockoutMatches.filter((match) => match.stage === nextStage);

  if (existingNext.length === 0) {
    const rows = fixtures.map((fixture) => ({
      tournament_id: tournamentId,
      stage: fixture.stage,
      round_number: fixture.round,
      home_team_id: fixture.home,
      away_team_id: fixture.away,
      status: 'scheduled',
    }));
    await supabase.from('matches').insert(rows);
    return {};
  }

  let flagged = 0;
  for (const fixture of fixtures) {
    const target = existingNext.find((match) => match.round_number === fixture.round);
    if (!target) {
      await supabase.from('matches').insert({
        tournament_id: tournamentId,
        stage: fixture.stage,
        round_number: fixture.round,
        home_team_id: fixture.home,
        away_team_id: fixture.away,
        status: 'scheduled',
      });
      continue;
    }

    if (target.home_team_id !== fixture.home || target.away_team_id !== fixture.away) {
      await supabase
        .from('matches')
        .update({
          home_team_id: fixture.home,
          away_team_id: fixture.away,
          home_score: null,
          away_score: null,
          winner_team_id: null,
          status: 'scheduled',
        })
        .eq('id', target.id)
        .eq('tournament_id', tournamentId);
      flagged += 1;
    }
  }

  if (flagged > 0) {
    // A later round was rebuilt, so the tournament can no longer be complete.
    await setTournamentStatus(supabase, tournamentId, 'knockout_stage');
    return {
      warning: `That result changed who advances, so ${flagged} later ${
        flagged === 1 ? 'match was' : 'matches were'
      } reset and need replaying.`,
    };
  }

  return {};
}
