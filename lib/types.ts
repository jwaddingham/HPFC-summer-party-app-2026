export type TournamentStatus = 'setup' | 'group_stage' | 'knockout_stage' | 'complete';
export type MatchStage = 'group' | 'quarter_final' | 'semi_final' | 'final';
export type MatchStatus = 'scheduled' | 'complete' | 'cancelled';

export interface Tournament { id: string; name: string; status: TournamentStatus; knockout_mode: 'top4' | 'quarter_finals'; created_at: string; }
export interface Team { id: string; tournament_id: string; name: string; }
export interface Match { id: string; tournament_id: string; stage: MatchStage; round_number: number; home_team_id: string; away_team_id: string; home_score: number | null; away_score: number | null; winner_team_id: string | null; status: MatchStatus; }
