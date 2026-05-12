/**
 * Temporary mock data for the public pages while Supabase wiring (PUB-02) is
 * still pending. Replace this module's exports with live queries once data is
 * persisted.
 */

export type TournamentStatus = 'live' | 'final' | 'complete' | 'upcoming';
export type MatchStatus = 'completed' | 'live' | 'upcoming';

export interface TournamentSummary {
  id: string;
  name: string;
  status: TournamentStatus;
  stage: string;
  teamCount: number;
  leader: string | null;
  nextMatch: string | null;
}

export interface LeagueRow {
  id: string;
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gd: number;
  pts: number;
  color?: string;
}

export interface FixtureRow {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  time?: string;
}

export interface TournamentDetail extends TournamentSummary {
  displayName: string;
  qualifyingCount: number;
  table: LeagueRow[];
  fixtures: FixtureRow[];
  knockoutGenerated: boolean;
}

export const tournamentSummaries: TournamentSummary[] = [
  {
    id: 'demo',
    name: 'U11 Summer Cup',
    status: 'live',
    stage: 'Group Stage',
    teamCount: 8,
    leader: 'Hinksey Hawks',
    nextMatch: '11:40 AM'
  },
  {
    id: 'demo2',
    name: 'U9 Development Cup',
    status: 'upcoming',
    stage: 'Setup',
    teamCount: 6,
    leader: null,
    nextMatch: null
  }
];

const tournamentDetails: Record<string, TournamentDetail> = {
  demo: {
    id: 'demo',
    name: 'U11 Summer Cup',
    displayName: 'U11 SUMMER CUP',
    status: 'live',
    stage: 'Group Stage',
    teamCount: 8,
    leader: 'Hinksey Hawks',
    nextMatch: '11:40 AM',
    qualifyingCount: 4,
    table: [
      { id: '1', name: 'Hinksey Hawks', p: 3, w: 3, d: 0, l: 0, gd: 8, pts: 9, color: '#1E5BA8' },
      { id: '2', name: 'Park Rangers', p: 3, w: 2, d: 0, l: 1, gd: 4, pts: 6, color: '#1E5A3A' },
      { id: '3', name: 'Botley Bullets', p: 3, w: 1, d: 1, l: 1, gd: 0, pts: 4, color: '#B11226' },
      { id: '4', name: 'Iffley Lions', p: 3, w: 1, d: 1, l: 1, gd: -1, pts: 4, color: '#E8B83B' },
      { id: '5', name: 'Cowley Comets', p: 2, w: 0, d: 0, l: 2, gd: -5, pts: 0, color: '#FF6B6B' },
      { id: '6', name: 'Summertown Stars', p: 3, w: 0, d: 0, l: 3, gd: -6, pts: 0, color: '#4ECDC4' }
    ],
    fixtures: [
      { id: '1', home: 'Hinksey Hawks', away: 'Botley Bullets', homeScore: 2, awayScore: 0, status: 'completed' },
      { id: '2', home: 'Park Rangers', away: 'Cowley Comets', homeScore: null, awayScore: null, status: 'live', time: 'NOW' },
      { id: '3', home: 'Iffley Lions', away: 'Summertown Stars', homeScore: null, awayScore: null, status: 'upcoming', time: '12:00' }
    ],
    knockoutGenerated: false
  },
  demo2: {
    id: 'demo2',
    name: 'U9 Development Cup',
    displayName: 'U9 DEVELOPMENT CUP',
    status: 'upcoming',
    stage: 'Setup',
    teamCount: 6,
    leader: null,
    nextMatch: null,
    qualifyingCount: 4,
    table: [
      { id: '1', name: 'Cumnor Colts', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#1E5BA8' },
      { id: '2', name: 'Wytham Wanderers', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#1E5A3A' },
      { id: '3', name: 'Marston Mavericks', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#B11226' },
      { id: '4', name: 'Headington Hornets', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#E8B83B' },
      { id: '5', name: 'Jericho Jaguars', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#FF6B6B' },
      { id: '6', name: 'Cowley Cubs', p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0, color: '#4ECDC4' }
    ],
    fixtures: [],
    knockoutGenerated: false
  }
};

export function getTournamentById(id: string): TournamentDetail | null {
  return tournamentDetails[id] ?? null;
}
