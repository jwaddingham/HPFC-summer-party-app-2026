import React from 'react';
import { LeagueTable } from '../ui/LeagueTable';
import { ChevronLeft } from 'lucide-react';
export function Screen3_LeagueTable() {
  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Back
          </span>
        </button>
        <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
          LEAGUE TABLE
        </h1>
        <p className="text-sm text-gray-400">Under 9s Cup • Group Stage</p>
      </div>

      <div className="p-4">
        <div className="mb-4 bg-white border-2 border-ink p-3 shadow-hard-sm flex items-start gap-3">
          <div className="text-2xl">📋</div>
          <div>
            <h4 className="font-bold text-sm">How it works</h4>
            <p className="text-xs text-gray-600 mt-1">
              Top 4 teams qualify for the Semi-Finals. Goal difference decides
              ties.
            </p>
          </div>
        </div>

        <LeagueTable />
      </div>
    </div>);

}