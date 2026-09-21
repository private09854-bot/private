-- Turn the one-way support inbox into a two-way conversation.
--
-- Already applied to the live project (oldyumyqoprqqoaxqydo) on 2026-09-21.
-- Kept here so a fresh environment reaches the same state; safe to re-run.
--
-- Each row is one message. `sender` says who wrote it, and a conversation is
-- every message sharing a userId (signed-in customer) or email (guest).

alter table public.support_messages
  add column if not exists sender           text not null default 'customer', -- customer | admin
  add column if not exists "readByAdmin"    boolean not null default false,
  add column if not exists "readByCustomer" boolean not null default true;

create index if not exists support_messages_user_idx
  on public.support_messages ("userId", "createdAt");
create index if not exists support_messages_email_idx
  on public.support_messages (email, "createdAt");

comment on column public.support_messages.sender is 'customer | admin';
comment on column public.support_messages."readByAdmin" is
  'false = a customer message the admin has not opened yet';
comment on column public.support_messages."readByCustomer" is
  'false = an admin reply the customer has not seen yet';
