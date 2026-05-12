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
    flex items-center justify-between border-2
    ${isLive ? 'border-blood bg-white' : isCompleted ? 'border-ink bg-ink text-white' : 'border-ink bg-chalk'}
    ${compact ? 'p-2' : 'p-3'}
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
      <div className={`flex-1 text-right ${compact ? 'text-sm' : 'text-base font-bold'} truncate pr-3`}>
        {home}
      </div>

      {/* Center: Score / Time */}
      <div className="flex flex-col items-center justify-center px-4 min-w-[80px]">
        {isCompleted || isLive ? (
          <div
            className={`font-display tracking-wider flex items-center gap-2 ${compact ? 'text-2xl' : 'text-4xl'}`}
          >
            <span>{homeScore ?? 0}</span>
            <span className="text-gray-400 text-lg">-</span>
            <span>{awayScore ?? 0}</span>
          </div>
        ) : (
          <div className="font-display text-xl text-gray-500 tracking-wider">{time || 'TBD'}</div>
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
      <div className={`flex-1 text-left ${compact ? 'text-sm' : 'text-base font-bold'} truncate pl-3`}>
        {away}
      </div>
    </div>
  );
}
