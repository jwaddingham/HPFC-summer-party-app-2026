import React from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft, GripVertical } from 'lucide-react';
export function Screen10_KnockoutGen() {
  const qualifiedTeams = [
  {
    seed: 1,
    name: 'Hinksey Hawks',
    pts: 9
  },
  {
    seed: 2,
    name: 'Park Rangers',
    pts: 6
  },
  {
    seed: 3,
    name: 'Botley Bullets',
    pts: 4
  },
  {
    seed: 4,
    name: 'Iffley Lions',
    pts: 4
  }];

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
          GENERATE KNOCKOUT
        </h1>
        <p className="text-sm text-gray-400">Under 9s Cup</p>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="space-y-6 flex-1">
          <div className="bg-white border-2 border-ink p-4 shadow-hard-sm">
            <p className="text-sm font-medium text-gray-700">
              Group stage is complete. Review the qualified teams and proposed
              semi-final fixtures below.
            </p>
          </div>

          {/* Qualified Teams */}
          <div className="space-y-2">
            <h2 className="font-display text-xl text-ink tracking-wide">
              QUALIFIED TEAMS (SEEDED)
            </h2>
            <div className="space-y-2">
              {qualifiedTeams.map((team) =>
              <div
                key={team.seed}
                className="flex items-center bg-white border-2 border-ink p-3">
                
                  <GripVertical className="w-5 h-5 text-gray-400 mr-2 cursor-grab" />
                  <div className="w-6 h-6 bg-ink text-white flex items-center justify-center font-display text-sm mr-3">
                    {team.seed}
                  </div>
                  <span className="font-bold flex-1">{team.name}</span>
                  <span className="text-sm font-bold text-gray-500">
                    {team.pts} pts
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">
              Drag to reseed manually
            </p>
          </div>

          {/* Proposed Fixtures */}
          <div className="space-y-3">
            <h2 className="font-display text-xl text-ink tracking-wide">
              PROPOSED SEMI-FINALS
            </h2>

            <div className="bg-white border-2 border-ink p-3 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blood"></div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Semi-Final 1
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>1. Hinksey Hawks</span>
                <span className="text-gray-400 text-sm">vs</span>
                <span>4. Iffley Lions</span>
              </div>
            </div>

            <div className="bg-white border-2 border-ink p-3 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blood"></div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Semi-Final 2
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>2. Park Rangers</span>
                <span className="text-gray-400 text-sm">vs</span>
                <span>3. Botley Bullets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <Button fullWidth size="lg">
            CONFIRM & GENERATE
          </Button>
          <Button fullWidth variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    </div>);

}