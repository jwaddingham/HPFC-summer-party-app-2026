export const tournaments = [
{
  id: 't1',
  name: 'Under 9s Summer Cup',
  status: 'live',
  stage: 'Group Stage',
  teamCount: 8,
  leader: 'Hinksey Hawks',
  nextMatch: '11:40 AM'
},
{
  id: 't2',
  name: 'Adults 5-a-side',
  status: 'final',
  stage: 'Final',
  teamCount: 12,
  leader: 'South Oxford Strikers',
  nextMatch: '1:00 PM'
},
{
  id: 't3',
  name: 'Family Fun Tournament',
  status: 'complete',
  stage: 'Complete',
  teamCount: 6,
  leader: 'Botley Bullets',
  nextMatch: null
}];


export const leagueTable = [
{
  id: '1',
  name: 'Hinksey Hawks',
  p: 3,
  w: 3,
  d: 0,
  l: 0,
  gd: 8,
  pts: 9,
  color: '#1E5BA8'
},
{
  id: '2',
  name: 'Park Rangers',
  p: 3,
  w: 2,
  d: 0,
  l: 1,
  gd: 4,
  pts: 6,
  color: '#1E5A3A'
},
{
  id: '3',
  name: 'Botley Bullets',
  p: 3,
  w: 1,
  d: 1,
  l: 1,
  gd: 0,
  pts: 4,
  color: '#B11226'
},
{
  id: '4',
  name: 'Iffley Lions',
  p: 3,
  w: 1,
  d: 1,
  l: 1,
  gd: -1,
  pts: 4,
  color: '#E8B83B'
},
{
  id: '5',
  name: 'Cowley Comets',
  p: 3,
  w: 0,
  d: 1,
  l: 2,
  gd: -4,
  pts: 1,
  color: '#6B7280'
},
{
  id: '6',
  name: 'Summertown Stars',
  p: 3,
  w: 0,
  d: 1,
  l: 2,
  gd: -7,
  pts: 1,
  color: '#8B5CF6'
}];


export const fixtures = [
{
  id: 'f1',
  time: '10:00',
  home: 'Hinksey Hawks',
  away: 'Park Rangers',
  homeScore: 3,
  awayScore: 1,
  status: 'completed'
},
{
  id: 'f2',
  time: '10:00',
  home: 'Botley Bullets',
  away: 'Iffley Lions',
  homeScore: 1,
  awayScore: 1,
  status: 'completed'
},
{
  id: 'f3',
  time: '10:40',
  home: 'Cowley Comets',
  away: 'Summertown Stars',
  homeScore: 0,
  awayScore: 0,
  status: 'completed'
},
{
  id: 'f4',
  time: '11:20',
  home: 'Hinksey Hawks',
  away: 'Botley Bullets',
  homeScore: 2,
  awayScore: 0,
  status: 'completed'
},
{
  id: 'f5',
  time: '11:40',
  home: 'Park Rangers',
  away: 'Cowley Comets',
  homeScore: null,
  awayScore: null,
  status: 'live'
},
{
  id: 'f6',
  time: '12:00',
  home: 'Iffley Lions',
  away: 'Summertown Stars',
  homeScore: null,
  awayScore: null,
  status: 'upcoming'
}];


export const bracketData = {
  quarterFinals: [
  {
    id: 'q1',
    home: 'Hinksey Hawks',
    away: 'Summertown Stars',
    homeScore: 4,
    awayScore: 0,
    status: 'completed'
  },
  {
    id: 'q2',
    home: 'Iffley Lions',
    away: 'Cowley Comets',
    homeScore: 2,
    awayScore: 1,
    status: 'completed'
  },
  {
    id: 'q3',
    home: 'Park Rangers',
    away: 'Botley Bullets',
    homeScore: 1,
    awayScore: 0,
    status: 'completed'
  },
  {
    id: 'q4',
    home: 'South Oxford',
    away: 'Headington Utd',
    homeScore: 3,
    awayScore: 2,
    status: 'completed'
  }],

  semiFinals: [
  {
    id: 's1',
    home: 'Hinksey Hawks',
    away: 'Iffley Lions',
    homeScore: 2,
    awayScore: 0,
    status: 'completed'
  },
  {
    id: 's2',
    home: 'Park Rangers',
    away: 'South Oxford',
    homeScore: null,
    awayScore: null,
    status: 'live'
  }],

  final: [
  {
    id: 'fn1',
    home: 'Hinksey Hawks',
    away: 'TBD',
    homeScore: null,
    awayScore: null,
    status: 'upcoming'
  }]

};