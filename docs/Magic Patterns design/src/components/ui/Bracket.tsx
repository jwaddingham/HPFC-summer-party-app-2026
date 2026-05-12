import React from 'react';
import { bracketData } from '../../data/mockData';
import { Trophy } from 'lucide-react';
type BracketMatch = {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};
function getWinner(m: BracketMatch): 'home' | 'away' | null {
  if (m.status !== 'completed' || m.homeScore == null || m.awayScore == null)
  return null;
  if (m.homeScore > m.awayScore) return 'home';
  if (m.awayScore > m.homeScore) return 'away';
  return null;
}
function BracketMatchCard({
  match,
  accent = 'ink'



}: {match: BracketMatch;accent?: 'ink' | 'blood' | 'gold';}) {
  const winner = getWinner(match);
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';
  const accentColor = {
    ink: 'border-ink',
    blood: 'border-blood',
    gold: 'border-gold'
  }[accent];
  return (
    <div
      className={`bg-white border-2 ${accentColor} shadow-hard-sm w-full overflow-hidden`}>
      
      {/* Match status strip */}
      <div
        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between ${isLive ? 'bg-blood text-white' : isUpcoming ? 'bg-chalk text-gray-500 border-b border-gray-200' : 'bg-gray-100 text-gray-500'}`}>
        
        <span>
          {isLive ? '● LIVE NOW' : isUpcoming ? 'Upcoming' : 'Full Time'}
        </span>
        {match.status === 'completed' &&
        <span className="font-display text-sm text-gray-400 tracking-normal">
            FT
          </span>
        }
      </div>

      {/* Team rows */}
      <div className="divide-y divide-gray-200">
        {/* Home */}
        <div
          className={`flex items-center justify-between px-3 py-3 ${winner === 'home' ? 'bg-gold/10' : ''}`}>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === 'home' &&
            <div className="w-1 h-6 bg-gold flex-shrink-0" />
            }
            <span
              className={`font-bold text-base truncate ${winner === 'home' ? 'text-ink' : winner === 'away' ? 'text-gray-400' : 'text-ink'}`}>
              
              {match.home}
            </span>
          </div>
          <span
            className={`font-display text-3xl leading-none ml-3 tabular-nums ${winner === 'home' ? 'text-ink' : winner === 'away' ? 'text-gray-300' : 'text-ink'}`}>
            
            {match.homeScore ?? '–'}
          </span>
        </div>

        {/* Away */}
        <div
          className={`flex items-center justify-between px-3 py-3 ${winner === 'away' ? 'bg-gold/10' : ''}`}>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === 'away' &&
            <div className="w-1 h-6 bg-gold flex-shrink-0" />
            }
            <span
              className={`font-bold text-base truncate ${winner === 'away' ? 'text-ink' : winner === 'home' ? 'text-gray-400' : 'text-ink'}`}>
              
              {match.away}
            </span>
          </div>
          <span
            className={`font-display text-3xl leading-none ml-3 tabular-nums ${winner === 'away' ? 'text-ink' : winner === 'home' ? 'text-gray-300' : 'text-ink'}`}>
            
            {match.awayScore ?? '–'}
          </span>
        </div>
      </div>
    </div>);

}
function RoundHeader({
  label,
  color = 'gray',
  count




}: {label: string;color?: 'gray' | 'blood' | 'gold';count?: string;}) {
  const colorMap = {
    gray: {
      text: 'text-gray-500',
      bar: 'bg-gray-300'
    },
    blood: {
      text: 'text-blood',
      bar: 'bg-blood'
    },
    gold: {
      text: 'text-gold',
      bar: 'bg-gold'
    }
  };
  const c = colorMap[color];
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`h-1 w-6 ${c.bar}`} />
      <h3 className={`font-display text-lg tracking-widest ${c.text}`}>
        {label}
      </h3>
      {count &&
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {count}
        </span>
      }
      <div className={`flex-1 h-px ${c.bar} opacity-40`} />
    </div>);

}
function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="w-0.5 h-4 bg-ink/30" />
    </div>);

}
export function Bracket() {
  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Quarter Finals */}
      <section>
        <RoundHeader label="QUARTER-FINALS" count="4 matches" />
        <div className="flex flex-col gap-3">
          {bracketData.quarterFinals.map((match) =>
          <BracketMatchCard key={match.id} match={match} accent="ink" />
          )}
        </div>
      </section>

      <Connector />

      {/* Semi Finals */}
      <section>
        <RoundHeader label="SEMI-FINALS" color="blood" count="2 matches" />
        <div className="flex flex-col gap-3">
          {bracketData.semiFinals.map((match) =>
          <BracketMatchCard key={match.id} match={match} accent="blood" />
          )}
        </div>
      </section>

      <Connector />

      {/* Final */}
      <section>
        <RoundHeader label="THE FINAL" color="gold" />
        <div className="relative">
          {/* gold frame */}
          <div className="absolute inset-0 -m-1 bg-gold" />
          <div className="relative">
            <BracketMatchCard match={bracketData.final[0]} accent="gold" />
          </div>
        </div>
      </section>

      {/* Trophy placeholder */}
      <section className="flex flex-col items-center pt-2">
        <div className="w-12 h-px bg-gold mb-3" />
        <div className="w-16 h-16 bg-ink border-2 border-gold flex items-center justify-center mb-2">
          <Trophy className="w-8 h-8 text-gold" />
        </div>
        <div className="font-display text-sm text-gray-500 tracking-widest">
          CHAMPION TBD
        </div>
      </section>
    </div>);

}