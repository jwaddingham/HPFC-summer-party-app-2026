alter table tournaments enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

drop policy if exists "public read tournaments" on tournaments;
create policy "public read tournaments"
  on tournaments for select
  to anon, authenticated
  using (true);

drop policy if exists "public read teams" on teams;
create policy "public read teams"
  on teams for select
  to anon, authenticated
  using (true);

drop policy if exists "public read matches" on matches;
create policy "public read matches"
  on matches for select
  to anon, authenticated
  using (true);
