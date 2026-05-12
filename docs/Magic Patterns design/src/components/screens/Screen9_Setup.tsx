import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft } from 'lucide-react';
export function Screen9_Setup() {
  const [teamCount, setTeamCount] = useState(6);
  const counts = [4, 6, 8, 10];
  return (
    <div className="min-h-full flex flex-col bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4 sticky top-0 z-20">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Back
          </span>
        </button>
        <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
          NEW TOURNAMENT
        </h1>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="space-y-6 flex-1">
          {/* Name */}
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase tracking-wider text-ink">
              Tournament Name
            </label>
            <input
              type="text"
              placeholder="e.g. Under 9s Summer Cup"
              className="w-full h-14 px-4 font-bold text-lg border-2 border-ink bg-white shadow-hard focus:outline-none focus:border-blood focus:ring-0 transition-colors" />
            
          </div>

          {/* Team Count */}
          <div className="space-y-2">
            <label className="font-bold text-sm uppercase tracking-wider text-ink">
              Number of Teams
            </label>
            <div className="flex gap-2">
              {counts.map((count) =>
              <button
                key={count}
                onClick={() => setTeamCount(count)}
                className={`flex-1 h-12 font-display text-xl border-2 border-ink transition-all ${teamCount === count ? 'bg-ink text-white shadow-none translate-y-1 translate-x-1' : 'bg-white text-ink shadow-hard hover:bg-gray-50'}`}>
                
                  {count}
                </button>
              )}
            </div>
          </div>

          {/* Teams List */}
          <div className="space-y-3 pt-2">
            <label className="font-bold text-sm uppercase tracking-wider text-ink block">
              Team Names
            </label>

            <div className="space-y-2">
              {Array.from({
                length: teamCount
              }).map((_, i) =>
              <div key={i} className="flex items-center gap-3">
                  <div className="w-8 text-center font-display text-xl text-gray-400">
                    {i + 1}
                  </div>
                  <input
                  type="text"
                  placeholder={`Team ${i + 1}`}
                  className="flex-1 h-12 px-3 font-bold border-2 border-ink bg-white focus:outline-none focus:border-blood focus:ring-0 transition-colors" />
                
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Action */}
        <div className="sticky bottom-0 pt-6 pb-4 bg-gradient-to-t from-chalk via-chalk to-transparent mt-4">
          <Button fullWidth size="lg">
            GENERATE FIXTURES
          </Button>
        </div>
      </div>
    </div>);

}