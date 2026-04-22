-- Reviewer toggles for REIT earnings calendar (DK / DL / SD)
create table if not exists public.reit_review (
  ticker text not null,
  reviewer text not null,
  reviewed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint reit_review_pkey primary key (ticker, reviewer),
  constraint reit_review_reviewer_chk check (reviewer in ('DK', 'DL', 'SD'))
);

create index if not exists reit_review_ticker_idx on public.reit_review (ticker);

alter table public.reit_review enable row level security;

-- Internal team tool: open read/write for anon (protect with URL obscurity + optional Vercel auth later)
create policy "reit_review_select" on public.reit_review for select using (true);
create policy "reit_review_insert" on public.reit_review for insert with check (true);
create policy "reit_review_update" on public.reit_review for update using (true) with check (true);
create policy "reit_review_delete" on public.reit_review for delete using (true);

-- If this errors with "already exists", the table is already in the publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reit_review'
  ) then
    execute 'alter publication supabase_realtime add table public.reit_review';
  end if;
end $$;
