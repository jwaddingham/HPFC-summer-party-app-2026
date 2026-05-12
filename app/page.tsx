import Link from 'next/link';

const demo = [{ id: 'demo', name: 'U11 Summer Cup', status: 'group_stage' }, { id: 'demo2', name: 'U9 Development Cup', status: 'setup' }];

export default function Home() {
  return <div className="space-y-4">
    <h1 className="text-3xl font-bold">HPFC Summer Tournament Centre</h1>
    <p className="text-white/80">Live tournament boards for parents, players, and coaches.</p>
    <div className="grid gap-3">{demo.map((t) => <Link key={t.id} className="card block" href={`/tournament/${t.id}`}><p className="text-xl font-semibold">{t.name}</p><p className="text-sm uppercase text-hpfcGold">{t.status.replace('_', ' ')}</p></Link>)}</div>
    <Link href="/admin" className="btn inline-block">Admin access</Link>
  </div>;
}
