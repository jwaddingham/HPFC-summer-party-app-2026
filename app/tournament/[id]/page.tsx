import { buildTable } from '@/lib/tournament';

const teams = ['Falcons','Lions','Tigers','Comets'].map((name, i) => ({ id: String(i + 1), tournament_id: 'demo', name }));
const matches = [
  { id: '1', tournament_id: 'demo', stage: 'group', round_number: 1, home_team_id: '1', away_team_id: '2', home_score: 2, away_score: 1, winner_team_id: '1', status: 'complete' },
  { id: '2', tournament_id: 'demo', stage: 'group', round_number: 2, home_team_id: '3', away_team_id: '4', home_score: 0, away_score: 0, winner_team_id: null, status: 'complete' }
] as any;

export default async function TournamentPage() {
  const table = buildTable(teams as any, matches);
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Live tournament</h1><div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr>{['Team','P','W','D','L','GF','GA','GD','Pts'].map((h)=><th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead><tbody>{table.map((r)=><tr key={r.teamId}><td>{r.team}</td><td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd}</td><td className="font-bold">{r.points}</td></tr>)}</tbody></table></div></div>;
}
