-- v2: structured release + call fields (date/time/tz) with separate CONF/EST flags
alter table public.reit_event_override
  add column if not exists release_date_d date null,
  add column if not exists release_status text null,
  add column if not exists release_notes text null,
  add column if not exists call_date_d date null,
  add column if not exists call_time time null,
  add column if not exists call_tz text null,
  add column if not exists call_status text null,
  add column if not exists call_notes text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reit_event_override_release_status_chk'
  ) then
    alter table public.reit_event_override
      add constraint reit_event_override_release_status_chk
      check (release_status is null or release_status in ('CONF','EST'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'reit_event_override_call_status_chk'
  ) then
    alter table public.reit_event_override
      add constraint reit_event_override_call_status_chk
      check (call_status is null or call_status in ('CONF','EST'));
  end if;
end $$;

