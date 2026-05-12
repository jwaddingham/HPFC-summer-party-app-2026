'use client';
import Link from 'next/link';
import { pendoTrack } from '@/lib/pendo';

export default function AdminTournaments() {
  async function handleCreateTournament() {
    // TODO: implement tournament creation API call
    const tournamentName = 'New Tournament';
    const teamCount = 4;
    const knockoutMode = 'top4';

    // TODO: replace with actual API response values after persistence
    pendoTrack('tournament_created', {
      tournament_id: '',
      tournament_name: tournamentName,
      team_count: teamCount,
      knockout_mode: knockoutMode,
    });
  }

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Today dashboard</h1><p className="text-white/75">Quick create tournament and update scores in under 10 seconds.</p><button className="btn w-full" onClick={handleCreateTournament}>+ Create tournament</button><Link className="card block" href="/admin/tournament/demo"><strong>U11 Summer Cup</strong><p>Next: Falcons vs Tigers</p></Link></div>;
}
