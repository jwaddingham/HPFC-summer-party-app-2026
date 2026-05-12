import Link from 'next/link';
import { CreateTournamentForm } from './create-tournament-form';

export default function AdminTournaments() {
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Today dashboard</h1><p className="text-white/75">Quick create tournament and update scores in under 10 seconds.</p><CreateTournamentForm /><Link className="card block" href="/admin/tournament/demo"><strong>U11 Summer Cup</strong><p>Demo link (replace with live list next)</p></Link></div>;
}
