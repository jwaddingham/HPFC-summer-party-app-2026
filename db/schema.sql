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
  name text not null
);
create table matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  stage match_stage not null,
  round_number int not null,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  home_score int,
  away_score int,
  winner_team_id uuid references teams(id),
  status match_status not null default 'scheduled'
);
