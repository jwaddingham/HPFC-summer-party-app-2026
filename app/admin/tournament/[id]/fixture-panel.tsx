'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAdminHeaders } from '@/lib/admin-session';

type TeamRow = { id: string; name: string };
type MatchRow = {
  id: string;
  stage: string;
  round_number: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
};
type PendingScore = {
  tournamentId: string;
  matchId: string;
  home_score: number;
  away_score: number;
  updatedAt: number;
};

const SCORE_QUEUE_KEY = 'hpfc_pending_score_queue';

function readPendingScores(): PendingScore[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SCORE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(SCORE_QUEUE_KEY);
    return [];
  }
}

function writePendingScores(scores: PendingScore[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SCORE_QUEUE_KEY, JSON.stringify(scores));
}

function getPendingScoresForTournament(tournamentId: string) {
  return readPendingScores().filter((score) => score.tournamentId === tournamentId);
}

function upsertPendingScore(score: PendingScore) {
  const scores = readPendingScores().filter(
    (pending) => pending.tournamentId !== score.tournamentId || pending.matchId !== score.matchId,
  );
  writePendingScores([...scores, score]);
}

function removePendingScore(tournamentId: string, matchId: string) {
  writePendingScores(
    readPendingScores().filter((score) => score.tournamentId !== tournamentId || score.matchId !== matchId),
  );
}

function applyPendingScores(matches: MatchRow[], tournamentId: string) {
  const pendingByMatch = new Map(getPendingScoresForTournament(tournamentId).map((score) => [score.matchId, score]));
  return matches.map((match) => {
    const pending = pendingByMatch.get(match.id);
    if (!pending) return match;
    return {
      ...match,
      home_score: pending.home_score,
      away_score: pending.away_score,
      status: 'complete',
    };
  });
}

function ScoreEntry({
  match,
  homeTeam,
  awayTeam,
  tournamentId,
  isPending,
  onSaved,
  onPendingChange,
}: {
  match: MatchRow;
  homeTeam: string;
  awayTeam: string;
  tournamentId: string;
  isPending: boolean;
  onSaved: (updated: MatchRow) => void;
  onPendingChange: () => void;
}) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setSaved(false);
    setError('');

    const optimistic = {
      ...match,
      home_score: homeScore,
      away_score: awayScore,
      status: 'complete',
    };
    upsertPendingScore({
      tournamentId,
      matchId: match.id,
      home_score: homeScore,
      away_score: awayScore,
      updatedAt: Date.now(),
    });
    onPendingChange();

    let response: Response;
    try {
      response = await fetch(
        `/api/admin/tournament/${tournamentId}/matches/${match.id}`,
        {
          method: 'PATCH',
          headers: getAdminHeaders({ json: true }),
          body: JSON.stringify({ home_score: homeScore, away_score: awayScore }),
        }
      );
    } catch {
      onSaved(optimistic);
      setSaving(false);
      setError('Saved locally. Will retry when connection returns.');
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      removePendingScore(tournamentId, match.id);
      onPendingChange();
      setError(
        response.status === 401
          ? 'Admin session expired. Log in again, then save this result.'
          : payload.error ?? 'Score was not saved. Please check the result and try again.',
      );
      return;
    }

    removePendingScore(tournamentId, match.id);
    onPendingChange();
    setSaved(true);
    onSaved(payload);
    setTimeout(() => setSaved(false), 2000);
  }

  const isComplete = match.status === 'complete';
  const hasUnsavedChanges =
    homeScore !== (match.home_score ?? 0) || awayScore !== (match.away_score ?? 0);
  const showEditState = isComplete && !hasUnsavedChanges && !saving && !saved;
  const isCorrectingComplete =
    isComplete && hasUnsavedChanges && !saving && !saved;

  const cardBorderClass = showEditState
    ? 'border-pitch bg-white'
    : isCorrectingComplete
      ? 'border-ink bg-white ring-2 ring-blood/25'
      : 'border-ink bg-white';

  const saveDisabled = saving || (isComplete && !hasUnsavedChanges);

  return (
    <div className={`border-2 p-3 space-y-3 relative ${cardBorderClass}`}>
      {showEditState ? (
        <div className="absolute top-2 right-2 bg-pitch rounded-full p-1" aria-hidden="true">
          <Check className="w-4 h-4 text-white" />
        </div>
      ) : null}
      {isCorrectingComplete ? (
        <p className="text-xs font-semibold text-blood uppercase tracking-wide pr-10" role="status">
          Updating recorded result
        </p>
      ) : null}
      {isPending ? (
        <p className="text-xs font-semibold text-gold uppercase tracking-wide pr-10" role="status">
          Queued for retry
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <span className="font-semibold text-ink text-sm truncate">{homeTeam}</span>
        <span className="font-semibold text-ink text-sm truncate text-right">{awayTeam}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
            onClick={() => setHomeScore((s) => Math.max(0, s - 1))}
            aria-label="Decrease home score"
          >
            −
          </button>
          <span className="font-display text-3xl text-ink w-8 text-center tabular-nums">{homeScore}</span>
          <button
            type="button"
            className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
            onClick={() => setHomeScore((s) => s + 1)}
            aria-label="Increase home score"
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
            onClick={() => setAwayScore((s) => Math.max(0, s - 1))}
            aria-label="Decrease away score"
          >
            −
          </button>
          <span className="font-display text-3xl text-ink w-8 text-center tabular-nums">{awayScore}</span>
          <button
            type="button"
            className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
            onClick={() => setAwayScore((s) => s + 1)}
            aria-label="Increase away score"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={saveDisabled}
        onClick={save}
        className={`w-full py-3 font-display text-base uppercase tracking-wider border-2 transition-all active:translate-y-px active:translate-x-px disabled:opacity-60 disabled:shadow-none disabled:active:translate-y-0 disabled:active:translate-x-0 flex items-center justify-center gap-2 ${
          saved
            ? 'bg-pitch border-pitch text-white shadow-none'
            : showEditState
              ? 'bg-white border-pitch text-pitch shadow-none'
              : 'bg-blood border-blood text-white shadow-hard active:shadow-none'
        }`}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : saved ? (
          <><Check className="w-4 h-4" aria-hidden="true" /> Saved</>
        ) : isComplete && hasUnsavedChanges ? (
          'Update result'
        ) : showEditState ? (
          'Result on record'
        ) : (
          'Save result'
        )}
      </button>

      {error ? (
        <p className="text-xs font-semibold text-blood" role="alert">{error}</p>
      ) : null}
    </div>
  );
}

export function FixturePanel({
  tournamentId,
  teams,
  initialMatches,
}: {
  tournamentId: string;
  teams: TeamRow[];
  initialMatches: MatchRow[];
}) {
  const router = useRouter();
  const [matches, setMatches] = useState(() => applyPendingScores(initialMatches, tournamentId));
  const [pendingScores, setPendingScores] = useState<PendingScore[]>([]);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = [4, 6, 8].includes(teams.length);
  const teamNames = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);
  const pendingMatchIds = useMemo(() => new Set(pendingScores.map((score) => score.matchId)), [pendingScores]);

  const formatMatchLabel = useCallback((match: MatchRow | undefined) => {
    if (!match) return 'the affected match';

    const homeTeam = teamNames.get(match.home_team_id) ?? 'Unknown team';
    const awayTeam = teamNames.get(match.away_team_id) ?? 'Unknown team';
    return `Round ${match.round_number}: ${homeTeam} vs ${awayTeam}`;
  }, [teamNames]);

  const refreshPendingScores = useCallback(() => {
    setPendingScores(getPendingScoresForTournament(tournamentId));
  }, [tournamentId]);

  const retryPendingScores = useCallback(async () => {
    const queued = getPendingScoresForTournament(tournamentId);
    if (queued.length === 0) return;

    for (const pending of queued) {
      let response: Response;
      try {
        response = await fetch(
          `/api/admin/tournament/${tournamentId}/matches/${pending.matchId}`,
          {
            method: 'PATCH',
            headers: getAdminHeaders({ json: true }),
            body: JSON.stringify({ home_score: pending.home_score, away_score: pending.away_score }),
          },
        );
      } catch {
        continue;
      }

      if (!response.ok) {
        removePendingScore(tournamentId, pending.matchId);
        const serverMatch = initialMatches.find((match) => match.id === pending.matchId);
        const matchLabel = formatMatchLabel(serverMatch);
        if (serverMatch) {
          setMatches((prev) => prev.map((match) => (match.id === pending.matchId ? serverMatch : match)));
        }
        setError(
          response.status === 401
            ? `Queued result for ${matchLabel} was rejected because admin access expired. Log in again and save it again.`
            : `Queued result for ${matchLabel} was rejected. Please check the score and save it again.`,
        );
        continue;
      }

      const updated = await response.json().catch(() => null);
      removePendingScore(tournamentId, pending.matchId);
      if (updated) {
        setMatches((prev) => prev.map((match) => (match.id === updated.id ? updated : match)));
      }
    }

    refreshPendingScores();
  }, [formatMatchLabel, initialMatches, refreshPendingScores, tournamentId]);

  useEffect(() => {
    setMatches(applyPendingScores(initialMatches, tournamentId));
    refreshPendingScores();
  }, [initialMatches, refreshPendingScores, tournamentId]);

  useEffect(() => {
    retryPendingScores();
    window.addEventListener('online', retryPendingScores);
    return () => window.removeEventListener('online', retryPendingScores);
  }, [retryPendingScores]);

  const rounds = useMemo(() => {
    const grouped = new Map<number, MatchRow[]>();
    matches
      .filter((match) => match.stage === 'group')
      .forEach((match) => {
        const roundMatches = grouped.get(match.round_number) ?? [];
        grouped.set(match.round_number, [...roundMatches, match]);
      });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([roundNumber, roundMatches]) => ({
        roundNumber,
        // scheduled matches first within each round
        roundMatches: [...roundMatches].sort((a, b) =>
          a.status === 'scheduled' && b.status !== 'scheduled' ? -1 :
          a.status !== 'scheduled' && b.status === 'scheduled' ? 1 : 0
        ),
      }));
  }, [matches]);

  function handleSaved(updated: MatchRow) {
    setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  async function generateFixtures() {
    setIsGenerating(true);
    setError('');

    const response = await fetch(`/api/admin/tournament/${tournamentId}/fixtures/generate`, {
      method: 'POST',
      headers: getAdminHeaders(),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error ?? 'Could not generate fixtures.');
      setIsGenerating(false);
      return;
    }

    setMatches(payload.matches ?? []);
    setIsGenerating(false);
    router.refresh();
  }

  const pendingCount = pendingScores.length;
  const scheduledCount = matches.filter((m) => m.status === 'scheduled').length;
  const completedCount = matches.filter((m) => m.status === 'complete').length;

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink tracking-wide">Score entry</h2>
          <p className="text-sm text-gray-600">
            {matches.length > 0
              ? `${completedCount} of ${matches.length} results saved`
              : 'Generate group fixtures once the team list is final.'}
          </p>
        </div>
        {matches.length > 0 ? (
          <span className="shrink-0 bg-blood px-3 py-1 font-display text-sm uppercase tracking-wide text-white">
            Group stage
          </span>
        ) : null}
      </div>

      {error ? <p className="border-2 border-blood bg-red-50 px-3 py-2 text-sm font-semibold text-blood" role="alert">{error}</p> : null}

      {pendingCount > 0 ? (
        <div className="flex items-center justify-between gap-3 border-2 border-gold bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
          <span>{pendingCount} result{pendingCount === 1 ? '' : 's'} queued for retry</span>
          <button type="button" className="text-blood underline" onClick={retryPendingScores}>
            Retry
          </button>
        </div>
      ) : null}

      {matches.length === 0 ? (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-ink/40 bg-chalk p-4 text-sm text-gray-700">
            <p className="font-semibold text-ink">Teams saved: {teams.length}</p>
            <p>Supported tournament sizes are 4, 6, or 8 teams.</p>
          </div>
          <Button fullWidth disabled={!canGenerate || isGenerating} onClick={generateFixtures} className="gap-2">
            {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <CalendarPlus className="h-5 w-5" aria-hidden="true" />}
            Generate fixtures
          </Button>
          {!canGenerate ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-blood">
              Add or remove teams until you have 4, 6, or 8 teams.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          {rounds.map(({ roundNumber, roundMatches }) => (
            <div key={roundNumber} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base uppercase tracking-wide text-ink">Round {roundNumber}</h3>
                <span className="text-xs text-gray-500">
                  {roundMatches.filter((m) => m.status === 'complete').length}/{roundMatches.length} done
                </span>
              </div>
              <div className="space-y-2">
                {roundMatches.map((match) => (
                  <ScoreEntry
                    key={match.id}
                    match={match}
                    homeTeam={teamNames.get(match.home_team_id) ?? 'Unknown'}
                    awayTeam={teamNames.get(match.away_team_id) ?? 'Unknown'}
                    tournamentId={tournamentId}
                    isPending={pendingMatchIds.has(match.id)}
                    onSaved={handleSaved}
                    onPendingChange={refreshPendingScores}
                  />
                ))}
              </div>
            </div>
          ))}

          {scheduledCount === 0 ? (
            <p className="text-center text-sm font-semibold text-pitch py-2">All results saved ✓</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
