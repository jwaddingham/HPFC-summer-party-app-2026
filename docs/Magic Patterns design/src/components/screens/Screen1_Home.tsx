import React from 'react';
import { HPFCBadge } from '../ui/HPFCBadge';
import { StatusPill } from '../ui/StatusPill';
import { tournaments } from '../../data/mockData';
import { ChevronRight, Users, Clock } from 'lucide-react';
export function Screen1_Home() {
  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-6 px-4 relative overflow-hidden">
        {/* Subtle pitch lines in background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <HPFCBadge className="w-20 h-20 mb-4 drop-shadow-lg" />
          <h1 className="font-display text-4xl tracking-wider mb-1">
            HPFC SUMMER PARTY
          </h1>
          <p className="font-sans text-gray-400 text-sm font-medium tracking-widest uppercase">
            Hinksey Park FC • 2026
          </p>
        </div>

        {/* Red trim */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blood"></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl text-ink tracking-wide">
            LIVE EVENTS
          </h2>
          <span className="font-hand text-blood text-xl transform -rotate-2">
            Today!
          </span>
        </div>

        {tournaments.map((t) =>
        <div
          key={t.id}
          className="bg-white border-2 border-ink shadow-hard p-4 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all cursor-pointer">
          
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display text-2xl leading-none w-2/3">
                {t.name}
              </h3>
              <StatusPill status={t.status as any} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                {t.teamCount} Teams
              </div>

              {t.status !== 'complete' && t.leader &&
            <div className="flex items-center text-sm text-gray-600 font-medium">
                  <div className="w-4 h-4 mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-sky"></div>
                  </div>
                  Leader:{' '}
                  <span className="font-bold text-ink ml-1">{t.leader}</span>
                </div>
            }

              {t.nextMatch &&
            <div className="flex items-center text-sm text-gray-600 font-medium">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  Next Match:{' '}
                  <span className="font-bold text-ink ml-1">{t.nextMatch}</span>
                </div>
            }
            </div>

            <div className="pt-3 border-t-2 border-dashed border-gray-200 flex items-center justify-between text-blood font-bold text-sm uppercase tracking-wider">
              <span>View Tournament</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>
    </div>);

}