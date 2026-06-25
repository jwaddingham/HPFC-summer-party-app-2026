'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, QrCode } from 'lucide-react';
import { Bracket } from '@/components/ui/Bracket';
import { LeagueTable } from '@/components/ui/LeagueTable';
import { MatchTile } from '@/components/ui/MatchTile';
import { TabBar } from '@/components/ui/TabBar';
import { StatusPill } from '@/components/ui/StatusPill';
import type { TournamentDetail } from '@/lib/public-tournaments';

export function TournamentView({ tournament }: { tournament: TournamentDetail }) {
  const [current, setCurrent] = useState(tournament);
  const [activeTab, setActiveTab] = useState<'TABLE' | 'FIXTURES' | 'KNOCKOUT'>('TABLE');
  const availableTabs = ['TABLE', 'FIXTURES', ...(current.knockoutGenerated ? ['KNOCKOUT'] : [])] as const;
  const displayTab = availableTabs.includes(activeTab) ? activeTab : 'TABLE';

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const response = await fetch(`/api/tournament/${tournament.id}`, { cache: 'no-store' });
      if (!response.ok || cancelled) return;
      setCurrent(await response.json());
    }

    const interval = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [tournament.id]);

  const liveMatch = current.fixtures.find((f) => f.status === 'live');
  const recentResults = current.fixtures.filter((f) => f.status === 'completed').slice(0, 4);

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
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="break-words font-display text-3xl tracking-wider leading-none mb-1">
                {current.displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  status={
                    current.status === 'complete'
                      ? 'complete'
                      : current.status === 'final'
                        ? 'final'
                        : current.status === 'live'
                          ? 'live'
                          : 'upcoming'
                  }
                />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {current.stage}
                </span>
              </div>
            </div>
            <Link
              href={`/tournament/${current.id}/share`}
              aria-label="Share tournament"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <TabBar
          tabs={availableTabs as unknown as string[]}
          activeTab={displayTab}
          onChange={(t) => setActiveTab(t as typeof activeTab)}
        />
      </div>

      <div className="p-4 space-y-6">
        {current.winner ? (
          <div className="border-4 border-gold bg-white p-5 text-center shadow-hard">
            <p className="text-xs font-bold uppercase tracking-widest text-blood">Tournament winners</p>
            <p className="font-display text-4xl tracking-wider text-ink">{current.winner}</p>
          </div>
        ) : null}

        {displayTab === 'TABLE' && (
          <div className="space-y-6">
            {current.table.length > 0 ? (
              <LeagueTable rows={current.table} qualifyingCount={current.qualifyingCount} />
            ) : (
              <p className="bg-white border-2 border-ink p-4 text-sm text-gray-600">
                No standings yet. Check back once the group stage kicks off.
              </p>
            )}

            {liveMatch && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl text-ink tracking-wide">NEXT UP</h3>
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

        {displayTab === 'FIXTURES' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">FIXTURES & RESULTS</h2>
            {current.fixtures.length === 0 ? (
              <p className="bg-white border-2 border-ink p-4 text-sm text-gray-600">
                Fixtures haven't been generated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {current.fixtures.map((fixture) => (
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

        {displayTab === 'KNOCKOUT' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">KNOCKOUT STAGE</h2>
            <Bracket matches={current.knockoutMatches} qualifyingCount={current.qualifyingCount} />
          </div>
        )}
      </div>
    </div>
  );
}
