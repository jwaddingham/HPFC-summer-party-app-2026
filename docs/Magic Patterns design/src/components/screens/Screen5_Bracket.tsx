import React from 'react';
import { Bracket } from '../ui/Bracket';
import { ChevronLeft } from 'lucide-react';
export function Screen5_Bracket() {
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
          KNOCKOUT STAGE
        </h1>
        <p className="text-sm text-gray-400">Adults 5-a-side</p>
      </div>

      <div className="p-4">
        <Bracket />
      </div>
    </div>);

}