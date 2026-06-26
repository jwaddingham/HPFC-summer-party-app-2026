'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { getAdminHeaders } from '@/lib/admin-session';
import type { TournamentSummary } from '@/lib/public-tournaments';
import { StatusPill } from '@/components/ui/StatusPill';

const DELETE_CONFIRMATION = 'DELETE';

export function AdminTournamentList({ tournaments }: { tournaments: TournamentSummary[] }) {
  const router = useRouter();
  const [visibleTournaments, setVisibleTournaments] = useState(tournaments);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setVisibleTournaments(tournaments);
  }, [tournaments]);

  async function deleteTournament(tournament: TournamentSummary) {
    setDeletingId(tournament.id);
    setError('');

    const response = await fetch(`/api/admin/tournament/${tournament.id}`, {
      method: 'DELETE',
      headers: getAdminHeaders({ json: true }),
      body: JSON.stringify({ confirm: 'DELETE_TOURNAMENT' }),
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string; deletedTournament?: string; deletedMatches?: number };
    setDeletingId(null);

    if (!response.ok) {
      setError(body.error ?? `Could not delete ${tournament.name}.`);
      return;
    }

    pendo.track('tournament_deleted', {
      tournament_id: tournament.id,
      tournament_name: tournament.name,
      deleted_matches: body.deletedMatches ?? 0,
    });

    setVisibleTournaments((current) => current.filter((item) => item.id !== tournament.id));
    setConfirmingId(null);
    setConfirmationText('');
    router.refresh();
  }

  if (visibleTournaments.length === 0) {
    return (
      <div className="bg-white border-2 border-ink p-4 text-sm text-gray-700">
        No tournaments yet. Create one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="border-2 border-blood bg-blood/10 p-3 text-sm font-semibold text-blood" role="alert">
          {error}
        </div>
      ) : null}

      {visibleTournaments.map((tournament) => {
        const isConfirming = confirmingId === tournament.id;
        const isDeleting = deletingId === tournament.id;
        const canDelete = confirmationText === DELETE_CONFIRMATION && !isDeleting;

        return (
          <div key={tournament.id} className="border-2 border-ink bg-white p-4 transition-all hover:bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/admin/tournament/${tournament.id}`} className="min-w-0 flex-1">
                <h3 className="mb-2 truncate text-lg font-bold leading-none">
                  {tournament.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={tournament.status} />
                  <p className="text-xs font-medium text-gray-500">
                    {tournament.teamCount} teams
                  </p>
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setConfirmationText('');
                    setConfirmingId(isConfirming ? null : tournament.id);
                  }}
                  className="flex h-10 w-10 items-center justify-center border-2 border-blood text-blood transition-colors hover:bg-blood hover:text-white focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2"
                  aria-label={`Delete ${tournament.name}`}
                  title={`Delete ${tournament.name}`}
                  data-action="delete-tournament"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <Link
                  href={`/admin/tournament/${tournament.id}`}
                  className="flex h-10 w-10 items-center justify-center text-gray-400 transition-colors hover:text-ink"
                  aria-label={`Manage ${tournament.name}`}
                  title={`Manage ${tournament.name}`}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {isConfirming ? (
              <div className="mt-4 space-y-3 border-t-2 border-dashed border-gray-200 pt-4">
                <p className="text-sm font-semibold text-ink">
                  Delete this tournament, its teams, fixtures, scores, and knockout data.
                </p>
                <input
                  className="w-full border-2 border-ink p-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2"
                  value={confirmationText}
                  onChange={(event) => setConfirmationText(event.target.value.toUpperCase())}
                  placeholder="Type DELETE"
                  disabled={isDeleting}
                  autoComplete="off"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="min-h-11 border-2 border-gray-400 px-3 py-2 text-sm font-bold uppercase tracking-wider text-ink disabled:opacity-50"
                    onClick={() => {
                      setConfirmingId(null);
                      setConfirmationText('');
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="flex min-h-11 items-center justify-center gap-2 border-2 border-blood bg-blood px-3 py-2 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-50"
                    onClick={() => deleteTournament(tournament)}
                    disabled={!canDelete}
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
