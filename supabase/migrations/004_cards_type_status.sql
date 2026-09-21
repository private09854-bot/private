-- Cards can be virtual (issued instantly) or physical (requested, then shipped).
--
-- Already applied to the live project (oldyumyqoprqqoaxqydo) on 2026-09-21.
-- Kept here so a fresh environment reaches the same state; safe to re-run.

alter table public.cards
  add column if not exists type        text not null default 'virtual',  -- virtual | physical
  add column if not exists status      text not null default 'active',   -- active | pending | cancelled
  add column if not exists "createdAt" timestamptz not null default now();

create index if not exists cards_owner_idx on public.cards ("ownerId", "createdAt");

comment on column public.cards.type is 'virtual | physical';
comment on column public.cards.status is
  'active = usable; pending = physical card requested, awaiting issue; cancelled';
