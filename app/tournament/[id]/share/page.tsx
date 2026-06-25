import QRCode from 'qrcode';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ShareActions } from './share-actions';
import { getTournamentDetail } from '@/lib/public-tournaments';
import { hasSupabasePublicEnv } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getBaseUrl(requestHeaders: Headers) {
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000';
  const protocol = requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export default async function TournamentSharePage({ params }: { params: Promise<{ id: string }> }) {
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
  if (!tournament) notFound();

  const requestHeaders = await headers();
  const tournamentUrl = `${getBaseUrl(requestHeaders)}/tournament/${id}`;
  const qrDataUrl = await QRCode.toDataURL(tournamentUrl, {
    margin: 1,
    width: 512,
    color: {
      dark: '#111111',
      light: '#F7F3E8',
    },
  });

  return (
    <div className="min-h-screen bg-chalk pb-8">
      <div className="bg-ink px-4 pb-8 pt-12 text-white">
        <Link href={`/tournament/${id}`} className="mb-3 flex items-center text-gray-400 transition-colors hover:text-white">
          <ChevronLeft className="mr-1 h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Tournament</span>
        </Link>
        <h1 className="font-display text-3xl tracking-wider">{tournament.displayName}</h1>
        <p className="text-sm text-gray-400">Share the live tournament page</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="border-2 border-ink bg-white p-4 shadow-hard">
          <img src={qrDataUrl} alt={`QR code for ${tournament.name}`} className="mx-auto aspect-square w-full max-w-sm" />
        </div>
        <p className="break-all border-2 border-dashed border-ink/40 bg-white p-3 font-mono text-xs text-gray-700">
          {tournamentUrl}
        </p>
        <ShareActions url={tournamentUrl} title={tournament.name} tournamentId={id} />
      </div>
    </div>
  );
}
