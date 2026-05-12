'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const TEAM_COUNTS = [4, 6, 8] as const;

function getAdminHeaders() {
  return {
    'content-type': 'application/json',
    'x-hpfc-admin': localStorage.getItem('hpfc_admin') === '1' ? '1' : '0',
  };
}

export function CreateTournamentForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [teamCount, setTeamCount] = useState<(typeof TEAM_COUNTS)[number]>(4);
  const [teamNames, setTeamNames] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const teams = useMemo(() => teamNames.slice(0, teamCount), [teamCount, teamNames]);

  function updateTeamCount(next: (typeof TEAM_COUNTS)[number]) {
    setTeamCount(next);
    setTeamNames((previous) => {
      const merged = previous.slice(0, next);
      while (merged.length < next) merged.push('');
      return merged;
    });
  }

  function updateTeamName(index: number, value: string) {
    setTeamNames((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  async function submit() {
    setSaving(true);
    setError('');

    const response = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ name, teamCount, teamNames: teams }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string; id?: string };
    if (!response.ok || !body.id) {
      setSaving(false);
      setError(body.error ?? 'Could not create tournament.');
      return;
    }

    router.push(`/admin/tournament/${body.id}`);
  }

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-6 space-y-4">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink tracking-wide mb-1">
          New Tournament
        </h2>
        <p className="text-sm text-gray-600">Create a new tournament quickly</p>
      </div>

      <input
        className="w-full border-2 border-ink p-3 text-lg focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 transition-all"
        placeholder="Tournament name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={saving}
      />

      <div>
        <p className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">Team count</p>
        <div className="grid grid-cols-3 gap-2">
          {TEAM_COUNTS.map((count) => (
            <button
              key={count}
              className={`border-2 border-ink p-3 font-bold text-sm uppercase tracking-wider transition-all ${
                teamCount === count
                  ? 'bg-ink text-white shadow-hard-sm'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => updateTeamCount(count)}
              disabled={saving}
              type="button"
            >
              {count} teams
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-3 uppercase tracking-wider">Team names</p>
        <div className="space-y-2">
          {teams.map((team, index) => (
            <input
              key={`team-${index + 1}`}
              className="w-full border-2 border-ink p-3 focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 transition-all"
              placeholder={`Team ${index + 1}`}
              value={team}
              onChange={(event) => updateTeamName(index, event.target.value)}
              disabled={saving}
            />
          ))}
        </div>
      </div>

      <button
        className="w-full bg-blood text-white font-bold py-3 px-4 border-2 border-blood shadow-hard-blood hover:shadow-hard-blood active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
        disabled={saving}
        onClick={submit}
        type="button"
      >
        {saving ? 'Creating...' : 'Create tournament'}
      </button>

      {error && (
        <div className="bg-blood/10 border-2 border-blood p-3">
          <p className="text-blood font-semibold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
