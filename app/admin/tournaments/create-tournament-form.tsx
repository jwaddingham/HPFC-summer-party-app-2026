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
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">Create tournament</h2>
      <input
        className="input"
        placeholder="Tournament name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        {TEAM_COUNTS.map((count) => (
          <button
            key={count}
            className={`btn ${teamCount === count ? '' : 'opacity-70'}`}
            onClick={() => updateTeamCount(count)}
            type="button"
          >
            {count} teams
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {teams.map((team, index) => (
          <input
            key={`team-${index + 1}`}
            className="input"
            placeholder={`Team ${index + 1}`}
            value={team}
            onChange={(event) => updateTeamName(index, event.target.value)}
          />
        ))}
      </div>
      <button className="btn w-full" disabled={saving} onClick={submit} type="button">
        {saving ? 'Creating...' : 'Create tournament'}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
