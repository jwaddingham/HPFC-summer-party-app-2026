'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type TeamRow = { id: string; name: string };
type MatchRow = {
  id: string;
  stage: string;
  round_number: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
};

function getAdminHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return localStorage.getItem('hpfc_admin') === '1' ? { 'x-hpfc-admin': '1' } : {};
}

export function FixturePanel({
  tournamentId,
  teams,
  initialMatches,
}: {
  tournamentId: string;
  teams: TeamRow[];
  initialMatches: MatchRow[];
}) {
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = [4, 6, 8].includes(teams.length);
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const rounds = useMemo(() => {
    const grouped = new Map<number, MatchRow[]>();
    matches
      .filter((match) => match.stage === 'group')
      .forEach((match) => {
        const roundMatches = grouped.get(match.round_number) ?? [];
        grouped.set(match.round_number, [...roundMatches, match]);
      });

    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  async function generateFixtures() {
    setIsGenerating(true);
    setError('');

    const response = await fetch(`/api/admin/tournament/${tournamentId}/fixtures/generate`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? 'Could not generate fixtures.');
      setIsGenerating(false);
      return;
    }

    setMatches(payload.matches ?? []);
    setIsGenerating(false);
    router.refresh();
  }

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink tracking-wide">Fast score entry</h2>
          <p className="text-sm text-gray-600">
            {matches.length > 0
              ? `${matches.length} group fixtures ready for score entry.`
              : 'Generate group fixtures once the team list is final.'}
          </p>
        </div>
        {matches.length > 0 ? (
          <span className="shrink-0 bg-blood px-3 py-1 font-display text-sm uppercase tracking-wide text-white">
            Group stage
          </span>
        ) : null}
      </div>

      {error ? <p className="border-2 border-blood bg-red-50 px-3 py-2 text-sm font-semibold text-blood">{error}</p> : null}

      {matches.length === 0 ? (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-ink/40 bg-chalk p-4 text-sm text-gray-700">
            <p className="font-semibold text-ink">Teams saved: {teams.length}</p>
            <p>Supported tournament sizes are 4, 6, or 8 teams.</p>
          </div>
          <Button fullWidth disabled={!canGenerate || isGenerating} onClick={generateFixtures} className="gap-2">
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <CalendarPlus className="h-5 w-5" aria-hidden="true" />}
            Generate fixtures
          </Button>
          {!canGenerate ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-blood">
              Add or remove teams until you have 4, 6, or 8 teams.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {rounds.map(([roundNumber, roundMatches]) => (
            <div key={roundNumber} className="space-y-2">
              <h3 className="font-display text-base uppercase tracking-wide text-ink">Round {roundNumber}</h3>
              <div className="space-y-2">
                {roundMatches.map((match) => (
                  <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-2 border-ink bg-chalk p-3 text-sm">
                    <span className="font-semibold text-ink">{teamNames.get(match.home_team_id) ?? 'Unknown team'}</span>
                    <span className="font-display text-lg text-blood">
                      {match.status === 'complete' ? `${match.home_score ?? 0}-${match.away_score ?? 0}` : 'v'}
                    </span>
                    <span className="text-right font-semibold text-ink">{teamNames.get(match.away_team_id) ?? 'Unknown team'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
