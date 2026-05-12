import React, { Fragment } from 'react';
import { MatchTile } from '../ui/MatchTile';
import { fixtures } from '../../data/mockData';
import { ChevronLeft } from 'lucide-react';
export function Screen4_Fixtures() {
  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4 sticky top-0 z-20">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Back
          </span>
        </button>
        <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
          FIXTURES & RESULTS
        </h1>
        <p className="text-sm text-gray-400">Under 9s Cup</p>
      </div>

      <div className="p-4">
        <div className="flex flex-col">
          {fixtures.map((match, idx) =>
          <Fragment key={match.id}>
              <div className="py-3">
                <MatchTile
                home={match.home}
                away={match.away}
                homeScore={match.homeScore}
                awayScore={match.awayScore}
                status={match.status as any} />
              
              </div>
              {idx < fixtures.length - 1 && <div className="h-px bg-line" />}
            </Fragment>
          )}
        </div>
      </div>
    </div>);

}