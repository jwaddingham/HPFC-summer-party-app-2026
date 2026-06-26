'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAdminHeaders } from '@/lib/admin-session';
import type { TournamentStatus } from '@/lib/types';

type KnockoutMode = 'top4' | 'quarter_finals';
type KnockoutStage = 'quarter_final' | 'semi_final' | 'third_place' | 'final';

type TeamRow = { id: string; name: string };

export type KnockoutMatchRow = {
  id: string;
  stage: KnockoutStage;
  round_number: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  winner_team_id: string | null;
  status: 'scheduled' | 'complete' | 'cancelled';
};

const STAGE_LABELS: Record<KnockoutStage, string> = {
  quarter_final: 'Quarter-finals',
  semi_final: 'Semi-finals',
  third_place: '3rd/4th playoff',
  final: 'Final',
};

const STAGE_ORDER: KnockoutStage[] = ['quarter_final', 'semi_final', 'third_place', 'final'];

function matchLabel(match: Pick<KnockoutMatchRow, 'stage' | 'round_number'>) {
  if (match.stage === 'final') return 'Final';
  if (match.stage === 'third_place') return '3rd/4th playoff';
  return `${STAGE_LABELS[match.stage].slice(0, -1)} ${match.round_number}`;
}

function ScoreStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label={`Decrease ${label} score`}
      >
        −
      </button>
      <span className="font-display text-3xl text-ink w-8 text-center tabular-nums">{value}</span>
      <button
        type="button"
        className="h-11 w-11 border-2 border-ink font-bold text-xl flex items-center justify-center active:bg-ink active:text-white transition-colors"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label} score`}
      >
        +
      </button>
    </div>
  );
}

function KnockoutScoreEntry({
  match,
  tournamentId,
  homeTeam,
  awayTeam,
  onChanged,
}: {
  match: KnockoutMatchRow;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  onChanged: (warning?: string) => void;
}) {
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [winnerId, setWinnerId] = useState<string | null>(match.winner_team_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isLevel = homeScore === awayScore;
  const isFinal = match.stage === 'final';
  const isThirdPlace = match.stage === 'third_place';
  const isComplete = match.status === 'complete';
  const advancingId = isLevel ? winnerId : homeScore > awayScore ? match.home_team_id : match.away_team_id;
  const advancingName = advancingId === match.home_team_id ? homeTeam : advancingId === match.away_team_id ? awayTeam : null;
  const resultLabel = isFinal ? 'Winners' : isThirdPlace ? 'Third place' : 'Advances';

  async function save() {
    if (isLevel && !winnerId) {
      setError(isThirdPlace ? 'Scores are level. Pick who finished third.' : 'Scores are level. Pick which team goes through.');
      return;
    }

    setSaving(true);
    setError('');

    let response: Response;
    try {
      response = await fetch(`/api/admin/tournament/${tournamentId}/matches/${match.id}`, {
        method: 'PATCH',
        headers: getAdminHeaders({ json: true }),
        body: JSON.stringify({
          home_score: homeScore,
          away_score: awayScore,
          winner_team_id: isLevel ? winnerId : undefined,
        }),
      });
    } catch {
      setSaving(false);
      setError('Could not reach the server. Check your connection and try again.');
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string; warning?: string };
    setSaving(false);

    if (!response.ok) {
      setError(
        response.status === 401
          ? 'Admin session expired. Log in again, then save this result.'
          : payload.error ?? 'Result was not saved. Check the score and try again.',
      );
      return;
    }

    onChanged(payload.warning);
  }

  return (
    <div className={`border-2 p-3 space-y-3 ${isComplete ? 'border-pitch bg-white' : 'border-ink bg-white'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {matchLabel(match)}
        </span>
        {isComplete && advancingName ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-pitch">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            {resultLabel}: {advancingName}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <span className="font-semibold text-ink text-sm truncate">{homeTeam}</span>
        <span className="font-semibold text-ink text-sm truncate text-right">{awayTeam}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreStepper label={homeTeam} value={homeScore} onChange={setHomeScore} />
        <ScoreStepper label={awayTeam} value={awayScore} onChange={setAwayScore} />
      </div>

      {isLevel ? (
        <fieldset className="border-2 border-dashed border-ink/40 p-2 space-y-2">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-blood">
            {isThirdPlace ? 'Level — who finished third?' : 'Level — who advances?'}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: match.home_team_id, name: homeTeam },
              { id: match.away_team_id, name: awayTeam },
            ].map((team) => (
              <label
                key={team.id}
                className={`flex items-center gap-2 border-2 p-2 text-sm font-semibold cursor-pointer ${
                  winnerId === team.id ? 'border-blood bg-blood/10 text-ink' : 'border-ink/30 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name={`winner-${match.id}`}
                  className="accent-blood"
                  checked={winnerId === team.id}
                  onChange={() => setWinnerId(team.id)}
                />
                <span className="truncate">{team.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="w-full py-3 font-display text-base uppercase tracking-wider border-2 transition-all active:translate-y-px active:translate-x-px disabled:opacity-60 flex items-center justify-center gap-2 bg-blood border-blood text-white shadow-hard active:shadow-none"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : isComplete ? (
          'Update result'
        ) : (
          'Save result'
        )}
      </button>

      {error ? (
        <p className="text-xs font-semibold text-blood" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function KnockoutDraw({
  tournamentId,
  knockoutMode,
  thirdPlacePlayoff,
  teamCount,
  seedOrder,
}: {
  tournamentId: string;
  knockoutMode: KnockoutMode;
  thirdPlacePlayoff: boolean;
  teamCount: number;
  seedOrder: TeamRow[];
}) {
  const router = useRouter();
  const quarterAvailable = teamCount === 8;
  const [mode, setMode] = useState<KnockoutMode>(
    knockoutMode === 'quarter_finals' && quarterAvailable ? 'quarter_finals' : 'top4',
  );
  const [includeThirdPlace, setIncludeThirdPlace] = useState(thirdPlacePlayoff);
  const [seeds, setSeeds] = useState<TeamRow[]>(seedOrder);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const qualifyingCount = mode === 'quarter_finals' ? 8 : 4;

  function reorder(from: number, to: number) {
    if (to < 0 || to >= seeds.length) return;
    const next = [...seeds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSeeds(next);
  }

  async function generate() {
    setGenerating(true);
    setError('');

    let response: Response;
    try {
      response = await fetch(`/api/admin/tournament/${tournamentId}/knockout/generate`, {
        method: 'POST',
        headers: getAdminHeaders({ json: true }),
        body: JSON.stringify({ mode, seeds: seeds.map((seed) => seed.id), thirdPlacePlayoff: includeThirdPlace }),
      });
    } catch {
      setGenerating(false);
      setError('Could not reach the server. Your seeding is kept — check your connection and try again.');
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setGenerating(false);
      setError(payload.error ?? 'Could not draw the knockout bracket.');
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-ink">Knockout format</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label
            className={`flex flex-col gap-1 border-2 p-3 cursor-pointer ${
              mode === 'top4' ? 'border-blood bg-blood/10' : 'border-ink/30'
            }`}
          >
            <span className="flex items-center gap-2 font-display uppercase tracking-wide text-ink">
              <input
                type="radio"
                name="knockout-mode"
                className="accent-blood"
                checked={mode === 'top4'}
                onChange={() => setMode('top4')}
              />
              Top 4 — semi-finals
            </span>
            <span className="text-xs text-gray-600">Seeds 1–4 play 1v4 and 2v3, then the final.</span>
          </label>
          <label
            className={`flex flex-col gap-1 border-2 p-3 ${
              quarterAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            } ${mode === 'quarter_finals' ? 'border-blood bg-blood/10' : 'border-ink/30'}`}
          >
            <span className="flex items-center gap-2 font-display uppercase tracking-wide text-ink">
              <input
                type="radio"
                name="knockout-mode"
                className="accent-blood"
                checked={mode === 'quarter_finals'}
                disabled={!quarterAvailable}
                onChange={() => setMode('quarter_finals')}
              />
              Quarter-finals
            </span>
            <span className="text-xs text-gray-600">
              {quarterAvailable ? 'All 8 teams: 1v8, 2v7, 3v6, 4v5.' : 'Needs exactly 8 teams.'}
            </span>
          </label>
        </div>
      </div>

      <label
        className={`flex cursor-pointer items-start gap-3 border-2 p-3 ${
          includeThirdPlace ? 'border-gold bg-gold/10' : 'border-ink/30 bg-white'
        }`}
      >
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-blood"
          checked={includeThirdPlace}
          onChange={(event) => setIncludeThirdPlace(event.target.checked)}
        />
        <span className="space-y-1">
          <span className="block font-display uppercase tracking-wide text-ink">Add 3rd/4th playoff</span>
          <span className="block text-xs text-gray-600">
            After the semi-finals, the two losing teams play once more for third place.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Seeding</p>
          <span className="text-xs text-gray-500">Top {qualifyingCount} qualify</span>
        </div>
        <p className="text-xs text-gray-600">
          Defaults to the group table. Reorder to override before drawing the bracket.
        </p>
        <ol className="space-y-2">
          {seeds.map((seed, index) => {
            const qualifies = index < qualifyingCount;
            return (
              <li
                key={seed.id}
                className={`grid grid-cols-[2rem_1fr_auto_auto] items-center gap-2 border-2 p-2 ${
                  qualifies ? 'border-ink bg-white' : 'border-ink/20 bg-chalk text-gray-500'
                }`}
              >
                <span className="font-display text-lg text-ink text-center tabular-nums">{index + 1}</span>
                <span className="truncate font-semibold">
                  {seed.name}
                  {!qualifies ? <span className="ml-2 text-xs uppercase tracking-wide">(out)</span> : null}
                </span>
                <button
                  type="button"
                  className="border-2 border-ink p-2 font-bold text-xs uppercase disabled:opacity-40"
                  onClick={() => reorder(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${seed.name} up`}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="border-2 border-ink p-2 font-bold text-xs uppercase disabled:opacity-40"
                  onClick={() => reorder(index, index + 1)}
                  disabled={index === seeds.length - 1}
                  aria-label={`Move ${seed.name} down`}
                  title="Move down"
                >
                  ↓
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <Button fullWidth disabled={generating} onClick={generate} className="gap-2">
        {generating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Trophy className="h-5 w-5" aria-hidden="true" />}
        Draw knockout bracket
      </Button>

      {error ? (
        <p className="border-2 border-blood bg-red-50 px-3 py-2 text-sm font-semibold text-blood" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function KnockoutBracketAdmin({
  tournamentId,
  status,
  matches,
  teamNames,
}: {
  tournamentId: string;
  status: TournamentStatus;
  matches: KnockoutMatchRow[];
  teamNames: Map<string, string>;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState('');
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState('');

  function handleChanged(warning?: string) {
    setNotice(warning ?? '');
    router.refresh();
  }

  async function resetKnockout() {
    if (!confirm('Reset the knockout stage? This deletes all knockout matches and returns the tournament to the group stage. Group results are kept.')) {
      return;
    }

    setResetting(true);
    setError('');

    let response: Response;
    try {
      response = await fetch(`/api/admin/tournament/${tournamentId}/knockout/reset`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
    } catch {
      setResetting(false);
      setError('Could not reach the server. Check your connection and try again.');
      return;
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setResetting(false);
      setError(payload.error ?? 'Could not reset the knockout stage.');
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {status === 'complete' ? (
        <p className="border-2 border-gold bg-gold/10 px-3 py-2 text-sm font-semibold text-ink">
          Tournament complete. You can still correct a result below — later rounds update automatically.
        </p>
      ) : null}

      {notice ? (
        <p className="border-2 border-gold bg-gold/10 px-3 py-2 text-sm font-semibold text-ink" role="status">
          {notice}
        </p>
      ) : null}

      {STAGE_ORDER.map((stage) => {
        const stageMatches = matches
          .filter((match) => match.stage === stage)
          .sort((a, b) => a.round_number - b.round_number);
        if (stageMatches.length === 0) return null;

        return (
          <section key={stage} className="space-y-2">
            <h3 className="font-display text-base uppercase tracking-wide text-ink">{STAGE_LABELS[stage]}</h3>
            <div className="space-y-2">
              {stageMatches.map((match) => (
                <KnockoutScoreEntry
                  // Remount when the server rewrites this match (e.g. a cascade
                  // reset) so the score inputs re-sync from fresh data.
                  key={`${match.id}:${match.status}:${match.home_team_id}:${match.away_team_id}:${match.home_score}:${match.away_score}:${match.winner_team_id}`}
                  match={match}
                  tournamentId={tournamentId}
                  homeTeam={teamNames.get(match.home_team_id) ?? 'Unknown'}
                  awayTeam={teamNames.get(match.away_team_id) ?? 'Unknown'}
                  onChanged={handleChanged}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="border-t-2 border-dashed border-ink/30 pt-3 space-y-2">
        <button
          type="button"
          disabled={resetting}
          onClick={resetKnockout}
          className="w-full border-2 border-blood text-blood font-display uppercase tracking-wider py-2 text-sm disabled:opacity-50"
        >
          {resetting ? 'Resetting…' : 'Reset knockout stage'}
        </button>
        {error ? (
          <p className="text-xs font-semibold text-blood" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function KnockoutPanel({
  tournamentId,
  status,
  knockoutMode,
  thirdPlacePlayoff,
  teamCount,
  groupComplete,
  seedOrder,
  initialKnockoutMatches,
}: {
  tournamentId: string;
  status: TournamentStatus;
  knockoutMode: KnockoutMode;
  thirdPlacePlayoff: boolean;
  teamCount: number;
  groupComplete: boolean;
  seedOrder: TeamRow[];
  initialKnockoutMatches: KnockoutMatchRow[];
}) {
  const teamNames = useMemo(() => new Map(seedOrder.map((team) => [team.id, team.name])), [seedOrder]);
  const hasKnockout = initialKnockoutMatches.length > 0;

  let body: React.ReactNode;
  if (status === 'setup') {
    body = (
      <p className="text-sm text-gray-600">
        The knockout stage opens once group fixtures are generated and played.
      </p>
    );
  } else if (!hasKnockout && !groupComplete) {
    body = (
      <div className="border-2 border-dashed border-ink/40 bg-chalk p-4 text-sm text-gray-700">
        <p className="font-semibold text-ink">Knockout stage locked</p>
        <p>Finish every group match to unlock seeding and the knockout draw.</p>
      </div>
    );
  } else if (!hasKnockout) {
    body = (
      <KnockoutDraw
        tournamentId={tournamentId}
        knockoutMode={knockoutMode}
        thirdPlacePlayoff={thirdPlacePlayoff}
        teamCount={teamCount}
        seedOrder={seedOrder}
      />
    );
  } else {
    body = (
      <KnockoutBracketAdmin
        tournamentId={tournamentId}
        status={status}
        matches={initialKnockoutMatches}
        teamNames={teamNames}
      />
    );
  }

  return (
    <div className="bg-white border-2 border-ink shadow-hard p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink tracking-wide">Knockout stage</h2>
          <p className="text-sm text-gray-600">Draw the bracket, then enter results to settle the knockout places.</p>
        </div>
        {hasKnockout ? (
          <span className="shrink-0 bg-ink px-3 py-1 font-display text-sm uppercase tracking-wide text-white">
            {status === 'complete' ? 'Complete' : 'Live'}
          </span>
        ) : null}
      </div>
      {body}
    </div>
  );
}
