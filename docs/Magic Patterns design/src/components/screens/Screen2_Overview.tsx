import React, { useState } from 'react';
import { TabBar } from '../ui/TabBar';
import { LeagueTable } from '../ui/LeagueTable';
import { MatchTile } from '../ui/MatchTile';
import { StatusPill } from '../ui/StatusPill';
import { ChevronLeft } from 'lucide-react';
export function Screen2_Overview() {
  const [activeTab, setActiveTab] = useState('TABLE');
  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4 sticky top-0 z-20">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            All Events
          </span>
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
              UNDER 9s CUP
            </h1>
            <div className="flex items-center gap-2">
              <StatusPill status="live" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Group Stage
              </span>
            </div>
          </div>
        </div>
      </div>

      <TabBar
        tabs={['TABLE', 'FIXTURES', 'KNOCKOUT']}
        activeTab={activeTab}
        onChange={setActiveTab} />
      

      <div className="p-4 space-y-6">
        {/* Table View */}
        {activeTab === 'TABLE' &&
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <LeagueTable />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-ink tracking-wide">
                  LIVE NOW
                </h3>
                <div className="w-2 h-2 bg-blood rounded-full animate-ping"></div>
              </div>
              <MatchTile
              home="Park Rangers"
              away="Cowley Comets"
              homeScore={null}
              awayScore={null}
              status="live" />
            
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl text-ink tracking-wide">
                RECENT RESULTS
              </h3>
              <div className="space-y-2">
                <MatchTile
                home="Hinksey Hawks"
                away="Botley Bullets"
                homeScore={2}
                awayScore={0}
                status="completed"
                compact />
              
                <MatchTile
                home="Cowley Comets"
                away="Summertown Stars"
                homeScore={0}
                awayScore={0}
                status="completed"
                compact />
              
              </div>
            </div>
          </div>
        }

        {/* Other tabs would render their respective components here */}
        {activeTab !== 'TABLE' &&
        <div className="py-12 text-center text-gray-500 font-medium">
            Select the specific screen from the top menu to view this state.
          </div>
        }
      </div>
    </div>);

}