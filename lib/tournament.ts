import { Match, Team } from './types';

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
