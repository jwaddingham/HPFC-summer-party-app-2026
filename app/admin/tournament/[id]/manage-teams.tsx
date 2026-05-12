'use client';

import { useState } from 'react';

interface TeamRow {
  id: string;
  name: string;
}

function getAdminHeaders() {
  return {
    'content-type': 'application/json',
    'x-hpfc-admin': localStorage.getItem('hpfc_admin') === '1' ? '1' : '0',
  };
}

export function ManageTeams({ tournamentId, initialTeams, locked }: { tournamentId: string; initialTeams: TeamRow[]; locked: boolean }) {
  const [teams, setTeams] = useState<TeamRow[]>(initialTeams);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');
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
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ teams }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) setError(body.error ?? 'Could not save teams.');
  }

  async function addTeam() {
    setSaving(true);
    setError('');
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'POST',
      headers: getAdminHeaders(),
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
    setSaving(true);
    setError('');
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
    <div className="card space-y-3">
      <h2 className="font-semibold">Manage teams</h2>
      {locked ? <p className="text-sm text-yellow-200">Team changes are locked once fixtures exist.</p> : null}
      <div className="space-y-2">
        {teams.map((team, index) => (
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2" key={team.id}>
            <input
              className="input"
              value={team.name}
              onChange={(event) => {
                const value = event.target.value;
                setTeams((previous) => previous.map((item, itemIndex) => (itemIndex === index ? { ...item, name: value } : item)));
              }}
              readOnly={locked}
            />
            <button className="btn px-3" onClick={() => reorder(index, index - 1)} disabled={locked} type="button">Up</button>
            <button className="btn px-3" onClick={() => reorder(index, index + 1)} disabled={locked} type="button">Down</button>
            <button className="btn px-3" onClick={() => removeTeam(team.id)} disabled={locked || teams.length <= 4} type="button">Del</button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          className="input"
          placeholder="Add team"
          value={newTeamName}
          onChange={(event) => setNewTeamName(event.target.value)}
          readOnly={locked}
        />
        <button className="btn" type="button" onClick={addTeam} disabled={locked || teams.length >= 8 || saving}>Add</button>
      </div>
      <button className="btn w-full" type="button" onClick={saveNames} disabled={locked || saving}>Save team changes</button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
