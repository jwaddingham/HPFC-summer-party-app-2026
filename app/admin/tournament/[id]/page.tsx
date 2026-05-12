import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSupabasePublicClient } from '@/lib/supabase/server';
import { ManageTeams } from './manage-teams';

export default async function AdminTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div className="space-y-4"><h1 className="text-2xl font-bold">Tournament control</h1><p className="card">Supabase environment variables are missing.</p></div>;
  }
  const supabase = getSupabasePublicClient();

  const [{ data: tournament }, { data: teams }, { count }] = await Promise.all([
    supabase.from('tournaments').select('id, name').eq('id', id).single(),
    supabase.from('teams').select('id, name').eq('tournament_id', id),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('tournament_id', id),
  ]);

  if (!tournament) notFound();

  const locked = (count ?? 0) > 0;

  return (
    <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <Link href="/admin/tournaments" className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Back</span>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-3xl tracking-wider mb-1">
              {tournament.name}
            </h1>
            <p className="text-sm text-gray-400">Manage teams and fixtures</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Manage Teams */}
        <ManageTeams tournamentId={id} initialTeams={teams ?? []} locked={locked} />

        {/* Fast score entry */}
        <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">Fast score entry</h2>
          <p className="text-sm text-gray-600">
            Score entry controls and fixtures will appear here once teams are set up.
          </p>
        </div>

        {/* Manual tools */}
        <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">Manual tools</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="font-bold text-blood">•</span>
              Edit/delete/reset fixtures
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-blood">•</span>
              Skip/cancel/replay match
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-blood">•</span>
              Manual advance team
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-blood">•</span>
              Reorder knockout seeds
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
