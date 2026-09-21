-- Full (demo) card number and CVV so a virtual card can be revealed and flipped.
--
-- Already applied to the live project (oldyumyqoprqqoaxqydo) on 2026-09-21.
-- Kept here so a fresh environment reaches the same state; safe to re-run.
--
-- These are randomly generated, Luhn-valid but non-functional values — the
-- platform is not connected to any card network.

alter table public.cards
  add column if not exists number text,   -- 16 digits, no spaces
  add column if not exists cvv    text;    -- 3 digits

comment on column public.cards.number is
  'Full demo PAN (16 digits). Non-functional — no real card network.';
comment on column public.cards.cvv is 'Demo CVV (3 digits). Non-functional.';
