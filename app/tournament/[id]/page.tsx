import { notFound } from 'next/navigation';
import { getTournamentDetail } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';
import { TournamentView } from './tournament-view';

export const dynamic = 'force-dynamic';

export default async function TournamentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!hasSupabasePublicEnv()) {
    return (
      <div className="min-h-screen bg-chalk p-4">
        <div className="bg-white border-2 border-ink p-4 text-sm text-gray-700">
          Supabase environment variables are missing.
        </div>
      </div>
    );
  }

  const tournament = await getTournamentDetail(id);

  if (!tournament) {
    notFound();
  }

  return <TournamentView tournament={tournament} />;
}
