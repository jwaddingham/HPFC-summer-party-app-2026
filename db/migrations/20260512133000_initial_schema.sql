create type tournament_status as enum ('setup','group_stage','knockout_stage','complete');
create type knockout_mode as enum ('top4','quarter_finals');
create type match_stage as enum ('group','quarter_final','semi_final','final');
create type match_status as enum ('scheduled','complete','cancelled');

create table tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status tournament_status not null default 'setup',
  knockout_mode knockout_mode not null default 'top4',
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  constraint teams_tournament_id_id_key unique (tournament_id, id)
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  stage match_stage not null,
  round_number int not null,
  home_team_id uuid not null,
  away_team_id uuid not null,
  home_score int,
  away_score int,
  winner_team_id uuid,
  status match_status not null default 'scheduled',
  constraint matches_home_team_in_tournament foreign key (tournament_id, home_team_id) references teams(tournament_id, id),
  constraint matches_away_team_in_tournament foreign key (tournament_id, away_team_id) references teams(tournament_id, id),
  constraint matches_winner_team_in_tournament foreign key (tournament_id, winner_team_id) references teams(tournament_id, id),
  constraint matches_distinct_teams check (home_team_id <> away_team_id),
  constraint matches_scores_not_negative check (
    (home_score is null or home_score >= 0)
    and (away_score is null or away_score >= 0)
  )
);
