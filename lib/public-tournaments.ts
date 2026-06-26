import { getSupabasePublicClient } from '@/lib/supabase/server';
import { buildTable } from '@/lib/tournament';
import type { Match, MatchStage, Team, Tournament, TournamentStatus } from '@/lib/types';

export type PublicTournamentStatus = 'live' | 'final' | 'complete' | 'upcoming';
export type PublicMatchStatus = 'completed' | 'live' | 'upcoming';

export interface TournamentSummary {
  id: string;
  name: string;
  status: PublicTournamentStatus;
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
  status: PublicMatchStatus;
  time?: string;
}

export interface KnockoutMatchRow extends FixtureRow {
  stage: Exclude<MatchStage, 'group'>;
  label: string;
  round: number;
}

export interface TournamentDetail extends TournamentSummary {
  displayName: string;
  qualifyingCount: number;
  table: LeagueRow[];
  fixtures: FixtureRow[];
  knockoutMatches: KnockoutMatchRow[];
  knockoutGenerated: boolean;
  winner: string | null;
}

const STAGE_LABELS: Record<TournamentStatus, string> = {
  setup: 'Setup',
  group_stage: 'Group Stage',
  knockout_stage: 'Knockout Stage',
  complete: 'Complete',
};

const TEAM_COLORS = ['#1E5BA8', '#1E5A3A', '#B11226', '#E8B83B', '#FF6B6B', '#4ECDC4', '#6D5DFB', '#111827'];

function toPublicStatus(status: TournamentStatus, matches: Match[]): PublicTournamentStatus {
  if (status === 'complete') return 'complete';
  if (matches.some((match) => match.stage === 'final' && match.status === 'scheduled')) return 'final';
  if (status === 'group_stage' || status === 'knockout_stage') return 'live';
  return 'upcoming';
}

function toTeamMap(teams: Team[]) {
  return new Map(teams.map((team) => [team.id, team.name]));
}

function toLeagueRows(teams: Team[], matches: Match[]): LeagueRow[] {
  return buildTable(teams, matches).map((row, index) => ({
    id: row.teamId,
    name: row.team,
    p: row.played,
    w: row.won,
    d: row.drawn,
    l: row.lost,
    gd: row.gd,
    pts: row.points,
    color: TEAM_COLORS[index % TEAM_COLORS.length],
  }));
}

function getQualifyingCount(tournament: Pick<Tournament, 'knockout_mode'>) {
  return tournament.knockout_mode === 'quarter_finals' ? 8 : 4;
}

function getNextMatchSummary(matches: Match[], teamNames: Map<string, string>) {
  const next = matches.find((match) => match.status === 'scheduled');
  if (!next) return null;
  const home = teamNames.get(next.home_team_id) ?? 'TBD';
  const away = teamNames.get(next.away_team_id) ?? 'TBD';
  return `Round ${next.round_number}: ${home} v ${away}`;
}

function getWinner(tournament: Tournament, matches: Match[], teamNames: Map<string, string>) {
  if (tournament.status !== 'complete') return null;

  const final = matches.find((match) => match.stage === 'final' && match.status === 'complete');
  if (!final) return null;
  if (final.winner_team_id) return teamNames.get(final.winner_team_id) ?? null;
  if (final.home_score === null || final.away_score === null || final.home_score === final.away_score) return null;
  return teamNames.get(final.home_score > final.away_score ? final.home_team_id : final.away_team_id) ?? null;
}

function toFixtureStatus(match: Match, liveMatchId: string | null): PublicMatchStatus {
  if (match.status === 'complete') return 'completed';
  if (match.status === 'scheduled' && match.id === liveMatchId) return 'live';
  return 'upcoming';
}

function toFixtureRow(match: Match, teamNames: Map<string, string>, liveMatchId: string | null): FixtureRow {
  const isCancelled = match.status === 'cancelled';
  return {
    id: match.id,
    home: teamNames.get(match.home_team_id) ?? 'Unknown team',
    away: teamNames.get(match.away_team_id) ?? 'Unknown team',
    homeScore: match.home_score,
    awayScore: match.away_score,
    status: toFixtureStatus(match, liveMatchId),
    time: isCancelled ? 'Cancelled' : `Round ${match.round_number}`,
  };
}

function stageLabel(stage: Exclude<MatchStage, 'group'>, round: number) {
  if (stage === 'quarter_final') return `Quarter-final ${round}`;
  if (stage === 'semi_final') return `Semi-final ${round}`;
  if (stage === 'third_place') return '3rd/4th playoff';
  return 'Final';
}

function toKnockoutMatchRow(match: Match, teamNames: Map<string, string>, liveMatchId: string | null): KnockoutMatchRow {
  return {
    ...toFixtureRow(match, teamNames, liveMatchId),
    stage: match.stage as Exclude<MatchStage, 'group'>,
    label: stageLabel(match.stage as Exclude<MatchStage, 'group'>, match.round_number),
    round: match.round_number,
  };
}

function sortMatches(matches: Match[]) {
  const stageOrder: Record<MatchStage, number> = {
    group: 0,
    quarter_final: 1,
    semi_final: 2,
    third_place: 3,
    final: 4,
  };

  return [...matches].sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage] || a.round_number - b.round_number);
}

function toSummary(tournament: Tournament, teams: Team[], matches: Match[]): TournamentSummary {
  const sortedMatches = sortMatches(matches);
  const teamNames = toTeamMap(teams);
  const table = toLeagueRows(teams, matches);
  const leader = table.some((row) => row.p > 0) ? table[0]?.name ?? null : null;

  return {
    id: tournament.id,
    name: tournament.name,
    status: toPublicStatus(tournament.status, matches),
    stage: STAGE_LABELS[tournament.status],
    teamCount: teams.length,
    leader,
    nextMatch: getNextMatchSummary(sortedMatches, teamNames),
  };
}

function toDetail(tournament: Tournament, teams: Team[], matches: Match[]): TournamentDetail {
  const sortedMatches = sortMatches(matches);
  const teamNames = toTeamMap(teams);
  const liveMatch = tournament.status === 'complete' ? null : sortedMatches.find((match) => match.status === 'scheduled') ?? null;
  const liveMatchId = liveMatch?.id ?? null;
  const groupMatches = sortedMatches.filter((match) => match.stage === 'group');
  const knockoutMatches = sortedMatches.filter((match) => match.stage !== 'group');

  return {
    ...toSummary(tournament, teams, sortedMatches),
    displayName: tournament.name.toUpperCase(),
    qualifyingCount: getQualifyingCount(tournament),
    table: toLeagueRows(teams, sortedMatches),
    fixtures: groupMatches.map((match) => toFixtureRow(match, teamNames, liveMatchId)),
    knockoutMatches: knockoutMatches.map((match) => toKnockoutMatchRow(match, teamNames, liveMatchId)),
    knockoutGenerated: knockoutMatches.length > 0,
    winner: getWinner(tournament, sortedMatches, teamNames),
  };
}

export async function getTournamentSummaries(): Promise<TournamentSummary[]> {
  const supabase = getSupabasePublicClient();
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('id, name, status, knockout_mode, third_place_playoff, created_at')
    .order('created_at', { ascending: false });

  if (tournamentsError) throw new Error(tournamentsError.message);
  if (!tournaments?.length) return [];

  const tournamentIds = tournaments.map((tournament) => tournament.id);
  const [{ data: teams, error: teamsError }, { data: matches, error: matchesError }] = await Promise.all([
    supabase.from('teams').select('id, tournament_id, name').in('tournament_id', tournamentIds),
    supabase
      .from('matches')
      .select('id, tournament_id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status')
      .in('tournament_id', tournamentIds),
  ]);

  if (teamsError) throw new Error(teamsError.message);
  if (matchesError) throw new Error(matchesError.message);

  return (tournaments as Tournament[]).map((tournament) =>
    toSummary(
      tournament,
      ((teams ?? []) as Team[]).filter((team) => team.tournament_id === tournament.id),
      ((matches ?? []) as Match[]).filter((match) => match.tournament_id === tournament.id),
    ),
  );
}

export async function getTournamentDetail(id: string): Promise<TournamentDetail | null> {
  const supabase = getSupabasePublicClient();
  const [{ data: tournament, error: tournamentError }, { data: teams, error: teamsError }, { data: matches, error: matchesError }] =
    await Promise.all([
      supabase.from('tournaments').select('id, name, status, knockout_mode, third_place_playoff, created_at').eq('id', id).single(),
      supabase.from('teams').select('id, tournament_id, name').eq('tournament_id', id).order('name', { ascending: true }),
      supabase
        .from('matches')
        .select('id, tournament_id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status')
        .eq('tournament_id', id),
    ]);

  if (tournamentError) {
    if (tournamentError.code === 'PGRST116') return null;
    throw new Error(tournamentError.message);
  }
  if (teamsError) throw new Error(teamsError.message);
  if (matchesError) throw new Error(matchesError.message);
  if (!tournament) return null;

  return toDetail(tournament as Tournament, (teams ?? []) as Team[], (matches ?? []) as Match[]);
}
