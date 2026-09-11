-- RAKSHA-BLOCK cross-device sync setup
-- Run once in Supabase Dashboard -> SQL Editor.
-- The current demo login uses the public anon client, so these policies match
-- the existing application model. Replace them with authenticated policies
-- before production deployment.

alter table if exists public.block_requests replica identity full;

-- Realtime only emits changes for tables in this publication.
do $$
begin
  alter publication supabase_realtime add table public.block_requests;
exception
  when duplicate_object then null;
end
$$;

-- The web app reads and writes through the anon key.
grant select, insert, update, delete on table public.block_requests to anon, authenticated;

alter table public.block_requests enable row level security;

drop policy if exists "block_requests_public_select" on public.block_requests;
create policy "block_requests_public_select"
on public.block_requests
for select
to anon, authenticated
using (true);

drop policy if exists "block_requests_public_insert" on public.block_requests;
create policy "block_requests_public_insert"
on public.block_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "block_requests_public_update" on public.block_requests;
create policy "block_requests_public_update"
on public.block_requests
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "block_requests_public_delete" on public.block_requests;
create policy "block_requests_public_delete"
on public.block_requests
for delete
to anon, authenticated
using (true);

-- Optional audit table used by the AI schedule screen.
-- Keep this section if ai_schedules exists in your project.
alter table if exists public.ai_schedules replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.ai_schedules;
exception
  when duplicate_object then null;
end
$$;
grant select, insert on table public.ai_schedules to anon, authenticated;

alter table if exists public.ai_schedules enable row level security;
drop policy if exists "ai_schedules_public_select" on public.ai_schedules;
create policy "ai_schedules_public_select"
on public.ai_schedules
for select
to anon, authenticated
using (true);
drop policy if exists "ai_schedules_public_insert" on public.ai_schedules;
create policy "ai_schedules_public_insert"
on public.ai_schedules
for insert
to anon, authenticated
with check (true);
