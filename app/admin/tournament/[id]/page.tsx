import { notFound } from 'next/navigation';
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

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Tournament control</h1><p className="text-white/75">{tournament.name}</p><ManageTeams tournamentId={id} initialTeams={teams ?? []} locked={locked} /><div className="card"><h2 className="font-semibold">Fast score entry</h2><p className="mt-2 text-sm text-white/80">Score entry remains here; fixtures and live controls follow after team setup.</p></div><div className="card"><h2 className="font-semibold">Manual override tools</h2><ul className="list-disc pl-5 text-sm text-white/90"><li>Edit/delete/reset fixtures</li><li>Skip/cancel/replay match</li><li>Manual advance team</li><li>Reorder knockout seeds</li></ul></div></div>;
}
