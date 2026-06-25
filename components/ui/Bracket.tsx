import type { KnockoutMatchRow } from '@/lib/public-tournaments';

const STAGE_LABELS: Record<KnockoutMatchRow['stage'], string> = {
  quarter_final: 'Quarter-finals',
  semi_final: 'Semi-finals',
  final: 'Final',
};

const STAGE_ORDER: KnockoutMatchRow['stage'][] = ['quarter_final', 'semi_final', 'final'];

export function Bracket({ matches = [], qualifyingCount = 4 }: { matches?: KnockoutMatchRow[]; qualifyingCount?: number }) {
  if (matches.length === 0) {
    return (
      <div className="bg-white border-2 border-ink p-6 shadow-hard-sm text-center space-y-2">
        <p className="font-bold text-ink">Knockout bracket not generated yet</p>
        <p className="text-sm text-gray-600">
          Top {qualifyingCount} teams from the group stage will qualify. The bracket will appear here once knockout matches are drawn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {STAGE_ORDER.map((stage) => {
        const stageMatches = matches.filter((match) => match.stage === stage);
        if (stageMatches.length === 0) return null;

        return (
          <section key={stage} className="space-y-2">
            <h3 className="font-display text-xl tracking-wide text-ink">{STAGE_LABELS[stage]}</h3>
            <div className={stage === 'final' ? 'space-y-2' : 'grid gap-3 sm:grid-cols-2'}>
              {stageMatches.map((match) => (
                <div
                  key={match.id}
                  className={`border-2 bg-white p-4 ${stage === 'final' ? 'border-blood shadow-hard-blood' : 'border-ink shadow-hard-sm'}`}
                >
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">{match.label}</p>
                  <div className="space-y-2">
                    <BracketTeam name={match.home} score={match.homeScore} isComplete={match.status === 'completed'} />
                    <div className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">vs</div>
                    <BracketTeam name={match.away} score={match.awayScore} isComplete={match.status === 'completed'} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BracketTeam({ name, score, isComplete }: { name: string; score: number | null; isComplete: boolean }) {
  return (
    <div className="flex items-center justify-between border border-ink bg-chalk p-2 text-sm font-bold text-ink">
      <span className="truncate pr-2">{name}</span>
      {isComplete ? <span className="font-display text-xl tabular-nums">{score ?? 0}</span> : null}
    </div>
  );
}
