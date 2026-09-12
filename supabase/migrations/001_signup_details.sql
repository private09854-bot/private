-- Adds the personal details a normal bank sign-up collects.
--
-- Already applied to the live project (oldyumyqoprqqoaxqydo) on 2026-09-12.
-- Kept here so a fresh environment can be brought to the same state, and it is
-- safe to re-run: every statement uses "if not exists".
--
-- Existing rows keep NULL for the new columns, which the UI renders as "—".

alter table public.profiles
  add column if not exists "firstName"         text,
  add column if not exists "middleName"        text,
  add column if not exists "lastName"          text,
  add column if not exists username            text,
  add column if not exists phone               text,
  add column if not exists dob                 date,
  add column if not exists "addressLine"       text,
  add column if not exists city                text,
  add column if not exists region              text,
  add column if not exists "postalCode"        text,
  add column if not exists "countryCode"       text,
  add column if not exists "accountType"       text,
  add column if not exists "preferredCurrency" text,
  add column if not exists "termsAcceptedAt"   timestamptz;

-- Usernames are the public handle, so they must be unique case-insensitively.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

create index if not exists profiles_country_code_idx
  on public.profiles ("countryCode");

comment on column public.profiles.phone is
  'Dial code + national number, e.g. +44 7700900123';
comment on column public.profiles.dob is
  'Date of birth. Sign-up enforces 18+ at the application layer.';
comment on column public.profiles.region is
  'State / province / region - optional, not every country has one.';
comment on column public.profiles."accountType" is
  'Savings | Checking | Business';
comment on column public.profiles."preferredCurrency" is
  'USD | EUR | GBP | CAD - becomes the primary wallet at provisioning.';
