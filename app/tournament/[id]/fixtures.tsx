'use client';

/**
 * Tournament Fixtures List
 * Shows all matches in the tournament with statuses (scheduled, live, completed).
 * Wire up: Fetch matches from Supabase, filter by stage, subscribe to real-time updates.
 */

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'completed';
  stage: 'group' | 'knockout';
  round?: number;
}

const mockMatches: Match[] = [
  {
    id: '1',
    homeTeam: 'Dragons',
    awayTeam: 'Phoenix',
    homeScore: 3,
    awayScore: 1,
    status: 'completed',
    stage: 'group',
    round: 1,
  },
  {
    id: '2',
    homeTeam: 'Tigers',
    awayTeam: 'Panthers',
    homeScore: 2,
    awayScore: 0,
    status: 'completed',
    stage: 'group',
    round: 1,
  },
  {
    id: '3',
    homeTeam: 'Dragons',
    awayTeam: 'Tigers',
    status: 'scheduled',
    stage: 'group',
    round: 2,
  },
  {
    id: '4',
    homeTeam: 'Phoenix',
    awayTeam: 'Panthers',
    status: 'scheduled',
    stage: 'group',
    round: 2,
  },
];

export function Fixtures() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Fixtures</h2>
      <div className="space-y-2">
        {mockMatches.map((match) => (
          <div
            key={match.id}
            className="card flex items-center justify-between gap-4 p-4"
          >
            <div className="flex-1">
              <div className="text-xs uppercase text-hpfcGold">
                {match.stage === 'group' ? `Round ${match.round}` : match.stage}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-semibold">{match.homeTeam}</span>
                {match.status === 'completed' && (
                  <span className="font-bold">
                    {match.homeScore} - {match.awayScore}
                  </span>
                )}
                {match.status === 'live' && (
                  <span className="animate-pulse text-red-500">● LIVE</span>
                )}
                {match.status === 'scheduled' && (
                  <span className="text-white/50">vs</span>
                )}
                <span className="font-semibold">{match.awayTeam}</span>
              </div>
            </div>
            <div
              className={`px-3 py-1 text-xs font-semibold uppercase rounded ${
                match.status === 'completed'
                  ? 'bg-white/10'
                  : match.status === 'live'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-hpfcGold/20 text-hpfcGold'
              }`}
            >
              {match.status.replace('_', ' ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
