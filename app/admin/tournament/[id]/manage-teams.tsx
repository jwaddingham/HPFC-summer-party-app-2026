'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { pendoTrack } from '@/lib/pendo';

export default function ManageTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [fixturesExist, setFixturesExist] = useState(false);

  async function saveNames() {
    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams }),
    });

    if (response.ok) {
      pendoTrack('teams_saved', {
        tournament_id: tournamentId,
        team_count: teams.length,
      });
      router.refresh();
    }
  }

  async function addTeam() {
    if (!newTeamName.trim() || fixturesExist) return;

    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName }),
    });

    if (response.ok) {
      pendoTrack('team_added', {
        tournament_id: tournamentId,
        team_name: newTeamName,
      });
      const created = await response.json();
      setTeams([...teams, created]);
      setNewTeamName('');
    }
  }

  async function removeTeam(teamId: string) {
    if (fixturesExist) return;

    const response = await fetch(`/api/admin/tournament/${tournamentId}/teams/${teamId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      pendoTrack('team_removed', {
        tournament_id: tournamentId,
        team_id: teamId,
        team_count_after: teams.length - 1,
      });
      setTeams(teams.filter((t) => t.id !== teamId));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manage Teams</h1>

      <div className="card space-y-2">
        {teams.map((team, idx) => (
          <div key={team.id} className="flex items-center gap-2">
            <input
              className="input flex-1"
              value={team.name}
              onChange={(e) => {
                const updated = [...teams];
                updated[idx] = { ...team, name: e.target.value };
                setTeams(updated);
              }}
            />
            <button
              className="btn btn-sm"
              onClick={() => removeTeam(team.id)}
              disabled={fixturesExist}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <button className="btn" onClick={addTeam} disabled={fixturesExist}>
          Add team
        </button>
      </div>

      <button className="btn w-full" onClick={saveNames}>
        Save team names
      </button>
    </div>
  );
}
