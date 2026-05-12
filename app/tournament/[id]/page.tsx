'use client';

import { useState } from 'react';
import { buildTable } from '@/lib/tournament';
import { LeagueTable } from '@/components/ui/LeagueTable';
import { MatchTile } from '@/components/ui/MatchTile';
import { Bracket } from '@/components/ui/Bracket';
import { TabBar } from '@/components/ui/TabBar';
import { StatusPill } from '@/components/ui/StatusPill';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// TODO: Wire up real data from Supabase
// For now using mock data to showcase the Magic Patterns design

const mockTournament = {
  id: 'demo',
  name: 'UNDER 9s CUP',
  stage: 'Group Stage',
  status: 'live' as const,
  teams: [
    { id: '1', name: 'Hinksey Hawks', color: '#1E5BA8' },
    { id: '2', name: 'Park Rangers', color: '#1E5A3A' },
    { id: '3', name: 'Botley Bullets', color: '#B11226' },
    { id: '4', name: 'Iffley Lions', color: '#E8B83B' },
    { id: '5', name: 'Cowley Comets', color: '#FF6B6B' },
    { id: '6', name: 'Summertown Stars', color: '#4ECDC4' },
    { id: '7', name: 'Godstow Greyhounds', color: '#95E1D3' },
    { id: '8', name: 'Wytham Wanderers', color: '#F38181' }
  ]
};

const mockLeagueTable = [
  { id: '1', name: 'Hinksey Hawks', p: 3, w: 3, d: 0, l: 0, gd: 8, pts: 9, color: '#1E5BA8' },
  { id: '2', name: 'Park Rangers', p: 3, w: 2, d: 0, l: 1, gd: 4, pts: 6, color: '#1E5A3A' },
  { id: '3', name: 'Botley Bullets', p: 3, w: 1, d: 1, l: 1, gd: 0, pts: 4, color: '#B11226' },
  { id: '4', name: 'Iffley Lions', p: 3, w: 1, d: 1, l: 1, gd: -1, pts: 4, color: '#E8B83B' },
  { id: '5', name: 'Cowley Comets', p: 2, w: 0, d: 0, l: 2, gd: -5, pts: 0, color: '#FF6B6B' },
  { id: '6', name: 'Summertown Stars', p: 3, w: 0, d: 0, l: 3, gd: -6, pts: 0, color: '#4ECDC4' }
];

const mockFixtures = [
  { id: '1', home: 'Hinksey Hawks', away: 'Botley Bullets', homeScore: 2, awayScore: 0, status: 'completed' as const },
  { id: '2', home: 'Park Rangers', away: 'Cowley Comets', homeScore: null, awayScore: null, status: 'live' as const, time: 'NOW' },
  { id: '3', home: 'Iffley Lions', away: 'Summertown Stars', homeScore: null, awayScore: null, status: 'upcoming' as const, time: '12:00' }
];

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState('TABLE');

  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4 sticky top-0 z-20">
        <Link href="/" className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">All Events</span>
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-3xl tracking-wider leading-none mb-1">{mockTournament.name}</h1>
            <div className="flex items-center gap-2">
              <StatusPill status={mockTournament.status} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{mockTournament.stage}</span>
            </div>
          </div>
        </div>
      </div>

      <TabBar tabs={['TABLE', 'FIXTURES', 'KNOCKOUT']} activeTab={activeTab} onChange={setActiveTab} />

      <div className="p-4 space-y-6">
        {/* Table View */}
        {activeTab === 'TABLE' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <LeagueTable rows={mockLeagueTable} />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-ink tracking-wide">LIVE NOW</h3>
                <div className="w-2 h-2 bg-blood rounded-full animate-pulse"></div>
              </div>
              <MatchTile
                home="Park Rangers"
                away="Cowley Comets"
                homeScore={null}
                awayScore={null}
                status="live"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl text-ink tracking-wide">RECENT RESULTS</h3>
              <div className="space-y-2">
                <MatchTile
                  home="Hinksey Hawks"
                  away="Botley Bullets"
                  homeScore={2}
                  awayScore={0}
                  status="completed"
                  compact
                />
              </div>
            </div>
          </div>
        )}

        {/* Fixtures View */}
        {activeTab === 'FIXTURES' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">FIXTURES & RESULTS</h2>
            <div className="space-y-2">
              {mockFixtures.map((fixture) => (
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
          </div>
        )}

        {/* Knockout View */}
        {activeTab === 'KNOCKOUT' && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-ink tracking-wider">KNOCKOUT STAGE</h2>
            <p className="text-sm text-gray-600 bg-white border-2 border-ink p-4">
              Knockout bracket coming soon once group stage completes. Top 4 teams from the group stage will qualify.
            </p>
            <Bracket />
          </div>
        )}
      </div>
    </div>
  );
}
