import Link from 'next/link';

export default function AdminTournaments() {
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Today dashboard</h1><p className="text-white/75">Quick create tournament and update scores in under 10 seconds.</p><button className="btn w-full">+ Create tournament</button><Link className="card block" href="/admin/tournament/demo"><strong>U11 Summer Cup</strong><p>Next: Falcons vs Tigers</p></Link></div>;
}
