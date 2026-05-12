import Link from 'next/link';
import { CreateTournamentForm } from './create-tournament-form';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AdminTournaments() {
  return (
    <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <Link href="/admin/dashboard" className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-display text-3xl tracking-wider">
            TOURNAMENT CONTROL
          </h1>
          <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
        </div>
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

          <Link
            href="/admin/tournament/demo"
            className="bg-white border-2 border-ink p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:translate-y-px transition-all"
          >
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">
                U11 Summer Cup
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Demo tournament
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
