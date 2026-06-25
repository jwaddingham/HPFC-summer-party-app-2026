import Link from 'next/link';
import { CreateTournamentForm } from './create-tournament-form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { StatusPill } from '@/components/ui/StatusPill';
import { getTournamentSummaries } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminTournaments() {
  const tournaments = hasSupabasePublicEnv() ? await getTournamentSummaries() : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
        <h1 className="font-display text-3xl tracking-wider mb-2">
          TOURNAMENT CONTROL
        </h1>
        <p className="text-sm text-gray-400">Create and manage tournaments for the HPFC summer party</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Create Tournament Form */}
        <CreateTournamentForm />

        {/* Active Tournaments */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">
            ACTIVE TOURNAMENTS
          </h2>

          {!hasSupabasePublicEnv() ? (
            <div className="bg-white border-2 border-ink p-4 text-sm text-gray-700">
              Add Supabase environment variables to list saved tournaments.
            </div>
          ) : null}

          {hasSupabasePublicEnv() && tournaments.length === 0 ? (
            <div className="bg-white border-2 border-ink p-4 text-sm text-gray-700">
              No tournaments yet. Create one above.
            </div>
          ) : null}

          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/admin/tournament/${tournament.id}`}
              className="bg-white border-2 border-ink p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:translate-y-px transition-all"
            >
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="font-bold text-lg leading-none mb-2 truncate">
                  {tournament.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={tournament.status} />
                  <p className="text-xs text-gray-500 font-medium">
                    {tournament.teamCount} teams
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
      </div>
    </AdminGuard>
  );
}
