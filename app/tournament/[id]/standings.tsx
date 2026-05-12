'use client';

/**
 * Tournament Standings Table
 * Displays the group-stage standings with points, goal diff, and goals scored.
 * Wire up: Subscribe to real-time match updates via Supabase and recalculate standings.
 */

interface Standing {
  position: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  points: number;
}

const mockStandings: Standing[] = [
  {
    position: 1,
    teamName: 'Dragons',
    played: 3,
    wins: 3,
    draws: 0,
    losses: 0,
    pointsFor: 9,
    pointsAgainst: 2,
    pointsDiff: 7,
    points: 9,
  },
  {
    position: 2,
    teamName: 'Phoenix',
    played: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    pointsFor: 7,
    pointsAgainst: 4,
    pointsDiff: 3,
    points: 6,
  },
  {
    position: 3,
    teamName: 'Tigers',
    played: 3,
    wins: 1,
    draws: 0,
    losses: 2,
    pointsFor: 5,
    pointsAgainst: 7,
    pointsDiff: -2,
    points: 3,
  },
  {
    position: 4,
    teamName: 'Panthers',
    played: 3,
    wins: 0,
    draws: 0,
    losses: 3,
    pointsFor: 1,
    pointsAgainst: 9,
    pointsDiff: -8,
    points: 0,
  },
];

export function Standings() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Group Standings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/20">
            <tr>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Team</th>
              <th className="px-2 py-2 text-center">P</th>
              <th className="px-2 py-2 text-center">W</th>
              <th className="px-2 py-2 text-center">D</th>
              <th className="px-2 py-2 text-center">L</th>
              <th className="px-2 py-2 text-center">GF</th>
              <th className="px-2 py-2 text-center">GA</th>
              <th className="px-2 py-2 text-center">GD</th>
              <th className="px-2 py-2 text-center font-bold">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {mockStandings.map((standing) => (
              <tr key={standing.position} className="hover:bg-white/5">
                <td className="px-2 py-3 text-center font-bold text-hpfcGold">
                  {standing.position}
                </td>
                <td className="px-2 py-3">{standing.teamName}</td>
                <td className="px-2 py-3 text-center">{standing.played}</td>
                <td className="px-2 py-3 text-center text-green-400">{standing.wins}</td>
                <td className="px-2 py-3 text-center text-blue-400">{standing.draws}</td>
                <td className="px-2 py-3 text-center text-red-400">{standing.losses}</td>
                <td className="px-2 py-3 text-center">{standing.pointsFor}</td>
                <td className="px-2 py-3 text-center">{standing.pointsAgainst}</td>
                <td className="px-2 py-3 text-center">
                  <span className={standing.pointsDiff > 0 ? 'text-green-400' : ''}>
                    {standing.pointsDiff > 0 ? '+' : ''}
                    {standing.pointsDiff}
                  </span>
                </td>
                <td className="px-2 py-3 text-center font-bold">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
