-- Runtime configuration that organisers may need to change without a redeploy.
-- The admin access code lives here so it can be rotated live from the Supabase
-- dashboard. RLS is enabled with NO policies, so only the service role (the
-- server and the Supabase dashboard) can read or write it — the public anon key
-- cannot see the code.
create table if not exists app_config (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table app_config enable row level security;

-- Seed an empty row so the code can be set by editing a single cell in the
-- dashboard. While the value is blank the login route falls back to the
-- ADMIN_ACCESS_CODE environment variable.
insert into app_config (key, value)
  values ('admin_access_code', '')
  on conflict (key) do nothing;
