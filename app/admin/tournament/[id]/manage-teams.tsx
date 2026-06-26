'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminHeaders } from '@/lib/admin-session';

interface TeamRow { id: string; name: string; }

export function ManageTeams({
  tournamentId,
  initialTeams,
  locked,
  hasCompletedMatches,
}: {
  tournamentId: string;
  initialTeams: TeamRow[];
  locked: boolean;
  hasCompletedMatches: boolean;
}) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  function reorder(from: number, to: number) {
    if (to < 0 || to >= teams.length) return;
    const next = [...teams];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setTeams(next);
  }

  async function saveNames() {
    setSaving(true);
    setError('');
    setNotice('');
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'PATCH',
      headers: getAdminHeaders({ json: true }),
      body: JSON.stringify({ teams }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(body.error ?? 'Could not save teams.');
      return;
    }
    setNotice('Team names saved. Fixtures and standings now use the updated names.');
    router.refresh();
  }

  async function addTeam() {
    setSaving(true);
    setError('');
    setNotice('');
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'POST',
      headers: getAdminHeaders({ json: true }),
      body: JSON.stringify({ name: newTeamName }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setSaving(false);
      setError(body.error ?? 'Could not add team.');
      return;
    }
    window.location.reload();
  }

  async function removeTeam(teamId: string) {
    if (!confirm('Remove this team? This action cannot be undone.')) {
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams/${teamId}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setError(body.error ?? 'Could not remove team.');
      return;
    }
    setTeams((previous) => previous.filter((team) => team.id !== teamId));
  }

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-6 space-y-4">
      <div className="mb-2">
        <h2 className="font-display text-2xl text-ink tracking-wide mb-1">Manage teams</h2>
        {locked && (
          <div className="mt-2 border-2 border-gold bg-gold/10 p-3 text-xs font-semibold text-ink">
            <p className="uppercase tracking-wider text-gold">Fixtures exist</p>
            <p>
              {hasCompletedMatches
                ? 'Scores are saved — you can still fix typos in team names. Adding, removing, or reordering teams needs a reset.'
                : 'Team names are safe to edit. Adding, removing, or reordering teams needs a tournament reset once fixtures exist.'}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {teams.map((team, index) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2" key={team.id}>
            <input
              className="min-w-0 border-2 border-ink p-2 focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 transition-all"
              value={team.name}
              onChange={(event) => {
                const value = event.target.value;
                setTeams((previous) => previous.map((item, itemIndex) => (itemIndex === index ? { ...item, name: value } : item)));
              }}
              disabled={saving}
            />
            <button
              className="h-11 w-11 border-2 border-ink p-2 font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              onClick={() => reorder(index, index - 1)}
              disabled={locked || saving}
              type="button"
              aria-label="Move team up"
              title="Move team up"
            >
              ↑
            </button>
            <button
              className="h-11 w-11 border-2 border-ink p-2 font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              onClick={() => reorder(index, index + 1)}
              disabled={locked || saving}
              type="button"
              aria-label="Move team down"
              title="Move team down"
            >
              ↓
            </button>
            <button
              className="h-11 w-11 border-2 border-blood text-blood p-2 font-bold text-xs uppercase tracking-wider disabled:opacity-50"
              onClick={() => removeTeam(team.id)}
              disabled={locked || teams.length <= 2 || saving}
              type="button"
              aria-label="Remove team"
              title="Remove team"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          className="min-w-0 border-2 border-ink p-3 focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 transition-all"
          placeholder="Team name"
          value={newTeamName}
          onChange={(event) => setNewTeamName(event.target.value)}
          disabled={locked}
        />
        <button
          className="bg-sky text-white border-2 border-sky font-bold px-4 py-2 uppercase tracking-wider text-sm disabled:opacity-50"
          type="button"
          onClick={addTeam}
          disabled={locked || teams.length >= 8 || saving}
        >
          +
        </button>
      </div>

      <button
        className="w-full bg-ink text-white font-bold py-3 px-4 border-2 border-ink shadow-hard hover:shadow-hard active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50 uppercase tracking-wider text-sm"
        type="button"
        onClick={saveNames}
        disabled={saving}
      >
        {saving ? 'Saving...' : locked ? 'Save team names' : 'Save team changes'}
      </button>

      {notice && (
        <div className="bg-pitch/10 border-2 border-pitch p-3">
          <p className="text-pitch font-semibold text-sm">{notice}</p>
        </div>
      )}

      {error && (
        <div className="bg-blood/10 border-2 border-blood p-3">
          <p className="text-blood font-semibold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
