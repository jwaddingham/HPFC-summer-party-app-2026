import Link from 'next/link';
import { ArrowRight, Clock, Settings, Trophy, Users } from 'lucide-react';
import { HPFCBadge } from '@/components/ui/HPFCBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { getTournamentSummaries } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const tournaments = hasSupabasePublicEnv() ? await getTournamentSummaries() : [];

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-6 px-4 relative overflow-hidden">
        {/* Subtle pitch lines in background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white"></div>
        </div>

        {/* Admin settings link */}
        <Link
          href="/admin"
          aria-label="Admin access"
          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-white bg-white/10 hover:bg-white/20 border border-white/30 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <Settings className="w-4 h-4" />
          Admin
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center">
          <HPFCBadge className="h-24 w-auto mb-4 drop-shadow-lg" />
          <h1 className="font-display text-4xl tracking-wider mb-1">HPFC SUMMER PARTY</h1>
          <p className="font-sans text-gray-400 text-sm font-medium tracking-widest uppercase">
            Hinksey Park FC • 2026
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

        {!hasSupabasePublicEnv() ? (
          <div className="border-2 border-ink bg-white p-4 text-sm text-gray-700 shadow-hard">
            Add Supabase environment variables to show live tournaments.
          </div>
        ) : null}

        {hasSupabasePublicEnv() && tournaments.length === 0 ? (
          <div className="border-2 border-ink bg-white p-4 text-sm text-gray-700 shadow-hard">
            No tournaments have been created yet.
          </div>
        ) : null}

        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={`/tournament/${t.id}`}
            className="bg-white border-2 border-ink shadow-hard p-4 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all block hover:bg-chalk"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display text-2xl leading-none w-2/3">{t.name}</h3>
              <StatusPill status={t.status} />
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-ink" aria-hidden="true" />
                {t.teamCount} Teams
              </div>

              {t.leader && (
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-gold" aria-hidden="true" />
                  Leader: <span className="font-bold text-ink ml-1">{t.leader}</span>
                </div>
              )}

              {t.nextMatch && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blood" aria-hidden="true" />
                  Next: <span className="font-bold text-ink ml-1">{t.nextMatch}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t-2 border-dashed border-gray-200 flex items-center justify-between text-blood font-bold text-sm uppercase tracking-wider">
              <span>View Tournament</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
