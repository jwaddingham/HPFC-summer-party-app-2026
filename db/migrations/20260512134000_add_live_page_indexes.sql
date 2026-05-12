create index teams_tournament_id_idx on teams (tournament_id);
create index matches_tournament_stage_status_idx on matches (tournament_id, stage, status);
create index matches_tournament_round_number_idx on matches (tournament_id, round_number);
