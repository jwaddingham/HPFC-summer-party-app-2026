'use client';

export interface MatchTileProps {
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  time?: string;
  status: 'completed' | 'live' | 'upcoming';
  pitch?: string;
  compact?: boolean;
}

export function MatchTile({
  home,
  away,
  homeScore,
  awayScore,
  time,
  status,
  pitch,
  compact = false
}: MatchTileProps) {
  const isLive = status === 'live';
  const isCompleted = status === 'completed';

  const containerClasses = `
    grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-2
    ${isLive ? 'border-blood bg-white' : isCompleted ? 'border-ink bg-ink text-white' : 'border-ink bg-chalk'}
    ${compact ? 'gap-2 p-2' : 'gap-3 p-3'}
  `;

  return (
    <div
      className={containerClasses}
      style={{
        boxShadow: isLive
          ? '4px 4px 0px 0px var(--blood)'
          : isCompleted
            ? 'none'
            : '4px 4px 0px 0px var(--ink)'
      }}
    >
      {/* Left side: Home Team */}
      <div className={`min-w-0 text-right leading-tight ${compact ? 'text-sm' : 'text-base font-bold'} break-words`}>
        {home}
      </div>

      {/* Center: Score / Time */}
      <div className="flex min-w-[4.5rem] flex-col items-center justify-center">
        {isCompleted && (
          <div className={`font-display tracking-wider flex items-center gap-2 ${compact ? 'text-2xl' : 'text-4xl'}`}>
            <span>{homeScore ?? 0}</span>
            <span className="text-gray-400 text-lg">-</span>
            <span>{awayScore ?? 0}</span>
          </div>
        )}

        {isLive && homeScore !== null && awayScore !== null && (
          <div className={`font-display tracking-wider flex items-center gap-2 ${compact ? 'text-2xl' : 'text-4xl'}`}>
            <span>{homeScore}</span>
            <span className="text-gray-400 text-lg">-</span>
            <span>{awayScore}</span>
          </div>
        )}

        {isLive && (homeScore === null || awayScore === null) && (
          <div className={`font-display tracking-wider flex items-center gap-2 text-blood ${compact ? 'text-2xl' : 'text-4xl'}`}>
            <span>—</span>
            <span className="text-gray-400 text-lg">vs</span>
            <span>—</span>
          </div>
        )}

        {!isCompleted && !isLive && (
          <div className="font-display text-center text-lg text-gray-500 tracking-wider sm:text-xl">{time || 'TBD'}</div>
        )}

        {isLive && !compact && (
          <div className="mt-1">
            <span className="text-xs font-bold text-blood uppercase tracking-widest">● LIVE</span>
          </div>
        )}
        {pitch && !isCompleted && !compact && (
          <div className="text-xs font-sans font-bold text-gray-500 mt-1 uppercase">Pitch {pitch}</div>
        )}
      </div>

      {/* Right side: Away Team */}
      <div className={`min-w-0 text-left leading-tight ${compact ? 'text-sm' : 'text-base font-bold'} break-words`}>
        {away}
      </div>
    </div>
  );
}
