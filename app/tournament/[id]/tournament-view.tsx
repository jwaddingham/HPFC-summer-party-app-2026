'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { LeagueTable } from '@/components/ui/LeagueTable';
import { MatchTile } from '@/components/ui/MatchTile';
import { TabBar } from '@/components/ui/TabBar';
import { StatusPill } from '@/components/ui/StatusPill';
import type { TournamentDetail } from '@/lib/mockData';

export function TournamentView({ tournament }: { tournament: TournamentDetail }) {
  const [activeTab, setActiveTab] = useState<'TABLE' | 'FIXTURES' | 'KNOCKOUT'>('TABLE');

  const liveMatch = tournament.fixtures.find((f) => f.status === 'live');
  const recentResults = tournament.fixtures.filter((f) => f.status === 'completed');

  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Sticky stack: header + tab bar stay together at the top on scroll */}
      <div className="sticky top-0 z-20">
        <div className="bg-ink text-white pt-12 pb-4 px-4">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="text-sm font-bold uppercase tracking-wider">All Events</span>
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
                {tournament.displayName}
              </h1>
              <div className="flex items-center gap-2">
                <StatusPill
                  status={
                    tournament.status === 'complete'
                      ? 'complete'
                      : tournament.status === 'final'
                        ? 'final'
                        : tournament.status === 'live'
                          ? 'live'
                          : 'upcoming'
                  }
                />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {tournament.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        <TabBar
          tabs={['TABLE', 'FIXTURES', 'KNOCKOUT']}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as typeof activeTab)}
        />
      </div>

      <div className="p-4 space-y-6">
        {activeTab === 'TABLE' && (
          <div className="space-y-6">
            {tournament.table.length > 0 ? (
              <LeagueTable rows={tournament.table} qualifyingCount={tournament.qualifyingCount} />
            ) : (
              <p className="bg-white border-2 border-ink p-4 text-sm text-gray-600">
                No standings yet. Check back once the group stage kicks off.
              </p>
            )}

            {liveMatch && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-ink tracking-wide">LIVE NOW</h3>
                  <div className="w-2 h-2 bg-blood rounded-full animate-pulse" />
                </div>
                <MatchTile
                  home={liveMatch.home}
                  away={liveMatch.away}
                  homeScore={liveMatch.homeScore}
                  awayScore={liveMatch.awayScore}
                  status="live"
                />
              </div>
            )}

            {recentResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-xl text-ink tracking-wide">RECENT RESULTS</h3>
                <div className="space-y-2">
                  {recentResults.map((m) => (
                    <MatchTile
                      key={m.id}
                      home={m.home}
                      away={m.away}
                      homeScore={m.homeScore}
                      awayScore={m.awayScore}
                      status="completed"
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'FIXTURES' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">FIXTURES & RESULTS</h2>
            {tournament.fixtures.length === 0 ? (
              <p className="bg-white border-2 border-ink p-4 text-sm text-gray-600">
                Fixtures haven't been generated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {tournament.fixtures.map((fixture) => (
                  <MatchTile
                    key={fixture.id}
                    home={fixture.home}
                    away={fixture.away}
                    homeScore={fixture.homeScore}
                    awayScore={fixture.awayScore}
                    status={fixture.status}
                    time={fixture.time}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'KNOCKOUT' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">KNOCKOUT STAGE</h2>
            <div className="bg-white border-2 border-ink p-6 shadow-hard-sm text-center space-y-2">
              <div className="text-3xl">⚽</div>
              <p className="font-bold text-ink">Knockout bracket not generated yet</p>
              <p className="text-sm text-gray-600">
                Top {tournament.qualifyingCount} teams from the group stage will qualify.
                The bracket will appear here once knockout matches are drawn.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
