import { Match, MatchStage, Team, TournamentStatus } from './types';

/**
 * Allowed tournament status transitions. Every forward step has a matching
 * reverse step so organisers can always roll back a mistake and are never
 * trapped in an irreversible state (ENG-05).
 */
export const TOURNAMENT_TRANSITIONS: Record<TournamentStatus, TournamentStatus[]> = {
  setup: ['group_stage'],
  group_stage: ['setup', 'knockout_stage'],
  knockout_stage: ['group_stage', 'complete'],
  complete: ['knockout_stage', 'group_stage'],
};

export function canTransition(from: TournamentStatus, to: TournamentStatus) {
  if (from === to) return true;
  return TOURNAMENT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: TournamentStatus, to: TournamentStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Cannot move tournament from ${from} to ${to}.`);
  }
}

type WinnerInput = Pick<Match, 'home_team_id' | 'away_team_id' | 'home_score' | 'away_score' | 'winner_team_id'>;

/**
 * Resolve which team won a match. A decisive score wins automatically. A level
 * score must be settled with an explicit winner (penalties or admin decision);
 * until that is recorded the winner is undecided and this returns null.
 */
export function resolveMatchWinner(match: WinnerInput): string | null {
  if (match.winner_team_id) {
    if (match.winner_team_id !== match.home_team_id && match.winner_team_id !== match.away_team_id) {
      throw new Error('Winner must be one of the two competing teams.');
    }
    return match.winner_team_id;
  }

  if (match.home_score === null || match.away_score === null) return null;
  if (match.home_score > match.away_score) return match.home_team_id;
  if (match.away_score > match.home_score) return match.away_team_id;
  return null;
}

export type KnockoutFixture = {
  stage: Exclude<MatchStage, 'group'>;
  round: number;
  home: string;
  away: string;
};

const NEXT_KNOCKOUT_STAGE: Partial<Record<MatchStage, Exclude<MatchStage, 'group'>>> = {
  quarter_final: 'semi_final',
  semi_final: 'final',
};

export function nextKnockoutStage(stage: MatchStage): Exclude<MatchStage, 'group'> | null {
  return NEXT_KNOCKOUT_STAGE[stage] ?? null;
}

/**
 * Given every completed match in a knockout round, produce the fixtures for the
 * next round by advancing the winners. Quarter-finals feed two semi-finals
 * (QF1/QF4 and QF2/QF3 by round); semi-finals feed the single final. The final
 * has no next round and returns an empty list.
 */
export function computeNextKnockoutRound(stage: MatchStage, stageMatches: Match[]): KnockoutFixture[] {
  const nextStage = NEXT_KNOCKOUT_STAGE[stage];
  if (!nextStage) return [];

  const sorted = [...stageMatches].sort((a, b) => a.round_number - b.round_number);

  if (stage === 'quarter_final' && sorted.length !== 4) {
    throw new Error('Semi-finals require four completed quarter-finals.');
  }
  if (stage === 'semi_final' && sorted.length !== 2) {
    throw new Error('The final requires two completed semi-finals.');
  }

  const winners = sorted.map((current) => {
    const winner = resolveMatchWinner(current);
    if (!winner) {
      throw new Error('Every match in the round needs a winner before the next round can be drawn.');
    }
    return winner;
  });

  if (stage === 'quarter_final') {
    return [
      { stage: 'semi_final', round: 1, home: winners[0], away: winners[3] },
      { stage: 'semi_final', round: 2, home: winners[1], away: winners[2] },
    ];
  }

  return [{ stage: 'final', round: 1, home: winners[0], away: winners[1] }];
}

/** True when every match in the round is complete and has a resolved winner. */
export function isKnockoutRoundComplete(stageMatches: Match[]): boolean {
  if (stageMatches.length === 0) return false;
  return stageMatches.every((current) => current.status === 'complete' && resolveMatchWinner(current) !== null);
}

export function generateRoundRobin(teamIds: string[]) {
  if (teamIds.length < 2) return [];
  if (new Set(teamIds).size !== teamIds.length) {
    throw new Error('Round-robin generation requires unique team IDs.');
  }
  if (teamIds.length % 2 !== 0) {
    throw new Error('Round-robin generation requires an even number of teams.');
  }

  const fixtures: Array<{ home: string; away: string; round: number }> = [];
  const teams = [...teamIds];
  const rounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;

  for (let roundIndex = 0; roundIndex < rounds; roundIndex += 1) {
    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex += 1) {
      const first = teams[matchIndex];
      const second = teams[teams.length - 1 - matchIndex];
      const swapHomeAway = (roundIndex + matchIndex) % 2 === 1;

      fixtures.push({
        home: swapHomeAway ? second : first,
        away: swapHomeAway ? first : second,
        round: roundIndex + 1,
      });
    }

    const rotated = teams.pop();
    if (rotated) teams.splice(1, 0, rotated);
  }

  return fixtures;
}

export function generateKnockoutFixtures(orderedTeamIds: string[], mode: 'top4' | 'quarter_finals') {
  if (new Set(orderedTeamIds).size !== orderedTeamIds.length) {
    throw new Error('Knockout generation requires unique team IDs.');
  }

  if (mode === 'quarter_finals') {
    if (orderedTeamIds.length !== 8) {
      throw new Error('Quarter-final mode requires exactly 8 teams.');
    }

    return [
      { stage: 'quarter_final' as const, round: 1, home: orderedTeamIds[0], away: orderedTeamIds[7] },
      { stage: 'quarter_final' as const, round: 2, home: orderedTeamIds[1], away: orderedTeamIds[6] },
      { stage: 'quarter_final' as const, round: 3, home: orderedTeamIds[2], away: orderedTeamIds[5] },
      { stage: 'quarter_final' as const, round: 4, home: orderedTeamIds[3], away: orderedTeamIds[4] },
    ];
  }

  if (orderedTeamIds.length !== 4 && orderedTeamIds.length !== 6 && orderedTeamIds.length !== 8) {
    throw new Error('Top-four mode supports only 4, 6, or 8 teams.');
  }

  return [
    { stage: 'semi_final' as const, round: 1, home: orderedTeamIds[0], away: orderedTeamIds[3] },
    { stage: 'semi_final' as const, round: 2, home: orderedTeamIds[1], away: orderedTeamIds[2] },
  ];
}

interface TableRow {
  teamId: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export function buildTable(teams: Team[], matches: Match[]) {
  const rows: Record<string, TableRow> = Object.fromEntries(
    teams.map((t) => [t.id, { teamId: t.id, team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }]),
  );

  matches.forEach((m) => {
    if (m.stage !== 'group' || m.status !== 'complete' || m.home_score === null || m.away_score === null) return;

    const h = rows[m.home_team_id];
    const a = rows[m.away_team_id];
    if (!h || !a) return;

    h.played++;
    a.played++;
    h.gf += m.home_score;
    h.ga += m.away_score;
    a.gf += m.away_score;
    a.ga += m.home_score;

    if (m.home_score > m.away_score) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (m.home_score < m.away_score) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
      h.points++;
      a.points++;
    }
  });

  return Object.values(rows).map((r) => ({ ...r, gd: r.gf - r.ga })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
}
