-- Editable overrides for release/call info (open read/write, no auth)
create table if not exists public.reit_event_override (
  ticker text primary key,
  release_date text null,
  call_date text null,
  status text null,
  notes text null,
  updated_at timestamptz not null default now()
);

alter table public.reit_event_override enable row level security;

create policy "reit_event_override_select" on public.reit_event_override for select using (true);
create policy "reit_event_override_insert" on public.reit_event_override for insert with check (true);
create policy "reit_event_override_update" on public.reit_event_override for update using (true) with check (true);
create policy "reit_event_override_delete" on public.reit_event_override for delete using (true);

-- Publish to realtime if not already present
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reit_event_override'
  ) then
    execute 'alter publication supabase_realtime add table public.reit_event_override';
  end if;
end $$;

