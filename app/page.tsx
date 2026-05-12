import Link from 'next/link';
import { HPFCBadge } from '@/components/ui/HPFCBadge';
import { StatusPill } from '@/components/ui/StatusPill';

const demo = [
  {
    id: 'demo',
    name: 'U11 Summer Cup',
    status: 'live' as const,
    stage: 'Group Stage',
    teamCount: 8,
    leader: 'Hinksey Hawks',
    nextMatch: '11:40 AM'
  },
  {
    id: 'demo2',
    name: 'U9 Development Cup',
    status: 'upcoming' as const,
    stage: 'Setup',
    teamCount: 6,
    leader: null,
    nextMatch: null
  }
];

export default function Home() {
  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-6 px-4 relative overflow-hidden">
        {/* Subtle pitch lines in background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <HPFCBadge className="w-20 h-20 mb-4 drop-shadow-lg" />
          <h1 className="font-display text-4xl tracking-wider mb-1">HPFC SUMMER PARTY</h1>
          <p className="font-sans text-gray-400 text-sm font-medium tracking-widest uppercase">
            Hinksley Park FC • 2026
          </p>
        </div>

        {/* Red trim */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blood"></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl text-ink tracking-wide">LIVE EVENTS</h2>
          <span className="font-hand text-blood text-xl transform -rotate-2">Today!</span>
        </div>

        {demo.map((t) => (
          <Link
            key={t.id}
            href={`/tournament/${t.id}`}
            className="bg-white border-2 border-ink shadow-hard p-4 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all block hover:bg-chalk"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display text-2xl leading-none w-2/3">{t.name}</h3>
              <StatusPill status={t.status === 'upcoming' ? 'upcoming' : 'live'} />
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">👥</span>
                {t.teamCount} Teams
              </div>

              {t.leader && (
                <div className="flex items-center">
                  <span className="mr-2">🏆</span>
                  Leader: <span className="font-bold text-ink ml-1">{t.leader}</span>
                </div>
              )}

              {t.nextMatch && (
                <div className="flex items-center">
                  <span className="mr-2">⏰</span>
                  Next Match: <span className="font-bold text-ink ml-1">{t.nextMatch}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-gray-200 flex items-center justify-between text-blood font-bold text-sm uppercase tracking-wider">
              <span>View Tournament</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
