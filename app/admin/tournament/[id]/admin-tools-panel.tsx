'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';
import { getAdminHeaders } from '@/lib/admin-session';
import type { TournamentStatus } from '@/lib/types';

export function AdminToolsPanel({
  tournamentId,
  status,
  matchCount,
}: {
  tournamentId: string;
  status: TournamentStatus;
  matchCount: number;
}) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetPhrase, setResetPhrase] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const hasGeneratedStructure = matchCount > 0 || status !== 'setup';
  const resetConfirmed = resetPhrase === 'RESET';

  async function resetToSetup() {
    if (!hasGeneratedStructure || !resetConfirmed) {
      return;
    }

    setResetting(true);
    setError('');
    setNotice('');

    let response: Response;
    try {
      response = await fetch(`/api/admin/tournament/${tournamentId}/reset`, {
        method: 'POST',
        headers: getAdminHeaders({ json: true }),
        body: JSON.stringify({ confirm: 'RESET_TO_SETUP' }),
      });
    } catch {
      setResetting(false);
      setError('Could not reach the server. Check your connection and try again.');
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string; deletedMatches?: number };
    setResetting(false);

    if (!response.ok) {
      setError(payload.error ?? 'Could not reset tournament.');
      return;
    }

    setNotice(`Tournament reset. Deleted ${payload.deletedMatches ?? 0} generated match${payload.deletedMatches === 1 ? '' : 'es'}.`);
    setResetPhrase('');
    router.refresh();
  }

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink tracking-wide">Admin utilities</h2>
          <p className="text-sm text-gray-600">
            Use these only when you need to rebuild fixtures or rehearse a clean run.
          </p>
        </div>
        <span className="shrink-0 bg-ink px-3 py-1 font-display text-sm uppercase tracking-wide text-white">
          {status.replace('_', ' ')}
        </span>
      </div>

      <div className="border-2 border-dashed border-ink/40 bg-chalk p-3 text-sm text-gray-700">
        <p className="font-semibold text-ink">Reset to setup</p>
        <p>Deletes group fixtures, scores, and knockout matches. Teams remain, so organisers can rename teams and generate fixtures again.</p>
      </div>

      <label className="block space-y-1 text-sm font-semibold text-ink">
        <span>Type RESET to enable fixture deletion</span>
        <input
          className="w-full border-2 border-ink p-3 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blood focus:ring-offset-2 disabled:opacity-50"
          value={resetPhrase}
          onChange={(event) => setResetPhrase(event.target.value.toUpperCase())}
          disabled={!hasGeneratedStructure || resetting}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
        />
      </label>

      <button
        type="button"
        disabled={!hasGeneratedStructure || !resetConfirmed || resetting}
        onClick={resetToSetup}
        className="flex min-h-11 w-full items-center justify-center gap-2 border-2 border-blood px-4 py-2 font-display text-sm uppercase tracking-wider text-blood transition-all active:translate-x-px active:translate-y-px disabled:opacity-50"
      >
        {resetting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
        {resetting ? 'Resetting...' : 'Delete fixtures and reset'}
      </button>

      {!hasGeneratedStructure ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          No generated fixtures to delete yet.
        </p>
      ) : null}

      {notice ? (
        <p className="border-2 border-pitch bg-pitch/10 px-3 py-2 text-sm font-semibold text-pitch" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="border-2 border-blood bg-red-50 px-3 py-2 text-sm font-semibold text-blood" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
