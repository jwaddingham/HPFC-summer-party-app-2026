import { buildTable } from '@/lib/tournament';
import { getSupabasePublicClient } from '@/lib/supabase/server';
import { Match, Team } from '@/lib/types';

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <div className="space-y-4"><h1 className="text-2xl font-bold">Live tournament</h1><p className="card">Supabase environment variables are missing.</p></div>;
  }
  const supabase = getSupabasePublicClient();
  const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
    supabase.from('tournaments').select('id, name').eq('id', id).single(),
    supabase.from('teams').select('*').eq('tournament_id', id),
    supabase.from('matches').select('*').eq('tournament_id', id).order('round_number', { ascending: true }),
  ]);

  if (!tournament) {
    return <div className="space-y-4"><h1 className="text-2xl font-bold">Live tournament</h1><p className="card">Tournament not found.</p></div>;
  }

  const table = buildTable((teams ?? []) as Team[], (matches ?? []) as Match[]);
  return <div className="space-y-4"><h1 className="text-2xl font-bold">{tournament.name}</h1><div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr>{['Team','P','W','D','L','GF','GA','GD','Pts'].map((h)=><th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead><tbody>{table.map((r)=><tr key={r.teamId}><td>{r.team}</td><td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd}</td><td className="font-bold">{r.points}</td></tr>)}</tbody></table></div></div>;
}
