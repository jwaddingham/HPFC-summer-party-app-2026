alter type match_stage add value if not exists 'third_place' before 'final';

alter table tournaments
  add column if not exists third_place_playoff boolean not null default false;
