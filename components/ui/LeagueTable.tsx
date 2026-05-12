'use client';

export interface LeagueTableRow {
  id: string;
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
  color?: string;
}

export function LeagueTable({
  rows,
  qualifyingCount
}: {
  rows: LeagueTableRow[];
  /** Number of teams that progress to the knockout stage. When omitted, no qualifying indicator is shown. */
  qualifyingCount?: number;
}) {
  return (
    <div className="w-full border-2 border-ink bg-white shadow-hard overflow-hidden">
      {/* Header */}
      <div className="flex items-center bg-ink text-white px-2 py-2 font-display tracking-wider text-sm border-b-2 border-ink">
        <div className="w-8 text-center">#</div>
        <div className="flex-1 pl-2">TEAM</div>
        <div className="w-8 text-center">P</div>
        <div className="w-8 text-center">GD</div>
        <div className="w-10 text-center text-gold">PTS</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {rows.map((team, index) => {
          const isQualifying = qualifyingCount !== undefined && index < qualifyingCount;
          return (
            <div
              key={team.id}
              className={`flex items-center px-2 py-3 border-b border-gray-200 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-chalk'} relative`}
            >
              {/* Qualifying Indicator */}
              {isQualifying && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-pitch" />}

              <div className="w-8 text-center font-bold text-gray-500 text-sm">{index + 1}</div>

              <div className="flex-1 pl-2 flex items-center gap-2 truncate">
                {team.color && (
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                )}
                <span className="font-bold text-sm truncate">{team.name}</span>
              </div>

              <div className="w-8 text-center text-sm font-medium text-gray-600">{team.p}</div>
              <div className="w-8 text-center text-sm font-medium text-gray-600">
                {team.gd > 0 ? `+${team.gd}` : team.gd}
              </div>
              <div className="w-10 text-center font-display text-xl text-ink">{team.pts}</div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {qualifyingCount !== undefined && (
        <div className="bg-chalk px-3 py-2 border-t-2 border-ink flex items-center gap-2 text-xs font-medium text-gray-600">
          <div className="w-2 h-2 bg-pitch" />
          <span>Top {qualifyingCount} qualify for Knockout Stage</span>
        </div>
      )}
    </div>
  );
}
