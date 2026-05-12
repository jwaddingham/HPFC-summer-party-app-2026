import { notFound } from 'next/navigation';
import { getTournamentById } from '@/lib/mockData';
import { TournamentView } from './tournament-view';

export default async function TournamentPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  return <TournamentView tournament={tournament} />;
}
