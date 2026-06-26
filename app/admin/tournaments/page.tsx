import Link from 'next/link';
import { CreateTournamentForm } from './create-tournament-form';
import { ChevronLeft } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminModeActions } from '@/components/admin/AdminModeActions';
import { getTournamentSummaries } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';
import { AdminTournamentList } from './admin-tournament-list';

export const dynamic = 'force-dynamic';

export default async function AdminTournaments() {
  const tournaments = hasSupabasePublicEnv() ? await getTournamentSummaries() : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
          </Link>
          <AdminModeActions />
        </div>
        <h1 className="font-display text-3xl tracking-wider mb-2">TOURNAMENT CONTROL</h1>
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

          {hasSupabasePublicEnv() ? <AdminTournamentList tournaments={tournaments} /> : null}
        </div>
      </div>
      </div>
    </AdminGuard>
  );
}
