-- Profintal Savings — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--
-- Columns are quoted camelCase so they match the application's property names
-- exactly. RLS is enabled with no public policies: all access happens
-- server-side through the service-role key.

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users record)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  role            text not null default 'CUSTOMER',   -- CUSTOMER | ADMIN
  name            text not null,
  handle          text,
  avatar          text,
  title           text,
  country         text,
  tier            text,
  "kycStatus"     text,
  "riskScore"     int,
  flagged         boolean not null default false,
  joined          timestamptz not null default now(),
  "createdAt"     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Money
-- ---------------------------------------------------------------------------
create table if not exists public.wallets (
  id              uuid primary key default gen_random_uuid(),
  "ownerId"       uuid not null references public.profiles(id) on delete cascade,
  currency        text not null,
  symbol          text not null,
  balance         double precision not null default 0,
  available       double precision,
  pending         double precision,
  "changeLabel"   text,
  "changeTone"    text,
  "primary"       boolean not null default false,
  sort            int not null default 0,
  "accountHolder" text,
  "accountNumber" text,
  "achRouting"    text,
  "wireRouting"   text,
  "bankName"      text,
  "bankAddress"   text,
  swift           text
);
create index if not exists wallets_owner_idx on public.wallets("ownerId");

create table if not exists public.transactions (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,
  "ownerId"       uuid not null references public.profiles(id) on delete cascade,
  date            timestamptz not null default now(),
  kind            text not null,
  title           text not null,
  sub             text not null,
  currency        text not null,
  amount          double precision not null,
  fee             double precision not null default 0,
  status          text not null,
  party           text,
  "partySub"      text,
  route           text,
  risk            text,
  flagged         boolean not null default false,
  reference       text,
  "walletSource"  text,
  delivery        text,
  "createdAt"     timestamptz not null default now()
);
create index if not exists transactions_owner_idx on public.transactions("ownerId");

create table if not exists public.recipients (
  id              uuid primary key default gen_random_uuid(),
  "ownerId"       uuid not null references public.profiles(id) on delete cascade,
  type            text not null,                      -- USER | BANK
  name            text not null,
  handle          text,
  avatar          text,
  favorite        boolean not null default false,
  "lastSent"      timestamptz,
  flag            text,
  "bankName"      text,
  "accountMask"   text,
  "createdAt"     timestamptz not null default now()
);
create index if not exists recipients_owner_idx on public.recipients("ownerId");

create table if not exists public.cards (
  id              uuid primary key default gen_random_uuid(),
  "ownerId"       uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  brand           text not null,
  last4           text not null,
  holder          text not null,
  expiry          text not null,
  spent           double precision not null default 0,
  "limit"         double precision not null default 0,
  frozen          boolean not null default false
);

create table if not exists public.card_authorizations (
  id              uuid primary key default gen_random_uuid(),
  "cardId"        uuid not null references public.cards(id) on delete cascade,
  merchant        text not null,
  category        text not null,
  "when"          text not null,
  amount          double precision not null,
  sort            int not null default 0
);

create table if not exists public.devices (
  id              uuid primary key default gen_random_uuid(),
  "ownerId"       uuid not null references public.profiles(id) on delete cascade,
  kind            text not null,
  name            text not null,
  meta            text not null,
  current         boolean not null default false,
  sort            int not null default 0
);

create table if not exists public.user_settings (
  id                   uuid primary key default gen_random_uuid(),
  "ownerId"            uuid unique not null references public.profiles(id) on delete cascade,
  "twoFactor"          boolean not null default true,
  "loginNotifications" boolean not null default true,
  "txnAlerts"          boolean not null default true,
  "securityLog"        boolean not null default true,
  marketing            boolean not null default false,
  "fxTriggers"         boolean not null default true,
  "dailyUsed"          double precision not null default 0,
  "dailyLimit"         double precision not null default 50000,
  "monthlyUsed"        double precision not null default 0,
  "monthlyLimit"       double precision not null default 500000,
  "singleCap"          double precision not null default 10000
);

-- ---------------------------------------------------------------------------
-- FX
-- ---------------------------------------------------------------------------
create table if not exists public.fx_rates (
  id              uuid primary key default gen_random_uuid(),
  base            text not null,
  quote           text not null,
  rate            double precision not null,
  change          text,
  "changeTone"    text,
  spread          text,
  sort            int not null default 0,
  unique (base, quote)
);

-- ---------------------------------------------------------------------------
-- Admin — KYC, transfers, risk, fees, dashboard widgets
-- ---------------------------------------------------------------------------
create table if not exists public.kyc_applications (
  id              uuid primary key default gen_random_uuid(),
  "userId"        uuid unique not null references public.profiles(id) on delete cascade,
  requesting      text not null,
  docs            text not null,
  submitted       text not null,
  risk            int not null,
  "riskTone"      text not null,
  status          text not null,                       -- pending | escalated | approved | rejected
  escalated       boolean not null default false,
  "createdAt"     timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id              uuid primary key default gen_random_uuid(),
  "appId"         uuid not null references public.kyc_applications(id) on delete cascade,
  label           text not null,
  status          text not null,
  sort            int not null default 0
);

create table if not exists public.transfers (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,
  party           text not null,
  "partySub"      text,
  route           text not null,
  amount          double precision not null,
  status          text not null,
  risk            text,
  submitted       text not null,
  "createdAt"     timestamptz not null default now()
);

create table if not exists public.risk_flags (
  id              uuid primary key default gen_random_uuid(),
  account         text not null,
  "accountSub"    text not null,
  trigger         text not null,
  score           int not null,
  amount          double precision not null,
  "when"          text not null,
  critical        boolean not null default false,
  status          text not null default 'Open',
  "createdAt"     timestamptz not null default now()
);

create table if not exists public.detection_rules (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  "desc"          text not null,
  enabled         boolean not null default true,
  sort            int not null default 0
);

create table if not exists public.fees (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null,
  detail          text not null,
  amount          text not null,
  tier            text,
  sort            int not null default 0
);

create table if not exists public.alerts (
  id              uuid primary key default gen_random_uuid(),
  severity        text not null,
  title           text not null,
  detail          text not null,
  "when"          text not null,
  sort            int not null default 0
);

create table if not exists public.gateways (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  status          text not null,
  tone            text not null,
  sort            int not null default 0
);

create table if not exists public.support_messages (
  id              uuid primary key default gen_random_uuid(),
  "userId"        uuid references public.profiles(id) on delete set null,
  name            text not null,
  email           text not null,
  message         text not null,
  handled         boolean not null default false,
  "createdAt"     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: lock everything down. The app talks to these tables
-- server-side with the service-role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.wallets             enable row level security;
alter table public.transactions        enable row level security;
alter table public.recipients          enable row level security;
alter table public.cards               enable row level security;
alter table public.card_authorizations enable row level security;
alter table public.devices             enable row level security;
alter table public.user_settings       enable row level security;
alter table public.fx_rates            enable row level security;
alter table public.kyc_applications    enable row level security;
alter table public.kyc_documents       enable row level security;
alter table public.transfers           enable row level security;
alter table public.risk_flags          enable row level security;
alter table public.detection_rules     enable row level security;
alter table public.fees                enable row level security;
alter table public.alerts              enable row level security;
alter table public.gateways            enable row level security;
alter table public.support_messages    enable row level security;
