import { Match, Team } from './types';

export function generateRoundRobin(teamIds: string[]) {
  const fixtures: Array<{ home: string; away: string; round: number }> = [];
  for (let i = 0; i < teamIds.length; i++) for (let j = i + 1; j < teamIds.length; j++) fixtures.push({ home: teamIds[i], away: teamIds[j], round: fixtures.length + 1 });
  return fixtures;
}

export function buildTable(teams: Team[], matches: Match[]) {
  const rows = Object.fromEntries(teams.map((t) => [t.id, { teamId: t.id, team: t.name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 }]));
  matches.filter((m) => m.stage === 'group' && m.status === 'complete' && m.home_score !== null && m.away_score !== null).forEach((m) => {
    const h = rows[m.home_team_id]; const a = rows[m.away_team_id];
    h.played++; a.played++; h.gf += m.home_score!; h.ga += m.away_score!; a.gf += m.away_score!; a.ga += m.home_score!;
    if (m.home_score! > m.away_score!) { h.won++; h.points += 3; a.lost++; }
    else if (m.home_score! < m.away_score!) { a.won++; a.points += 3; h.lost++; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  });
  return Object.values(rows).map((r) => ({ ...r, gd: r.gf - r.ga })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team));
}
