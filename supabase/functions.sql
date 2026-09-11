-- Profintal Savings — atomic money-movement functions
-- Run this in the Supabase SQL Editor AFTER schema.sql.
--
-- supabase-js cannot run multi-statement transactions, so every balance change
-- lives inside a function. A function body is one implicit transaction, so a
-- failure anywhere rolls the whole thing back.

-- Next sequential transaction reference, e.g. TXN-2026-00857
create or replace function public.next_txn_ref()
returns text
language plpgsql
as $$
declare v_count int;
begin
  select count(*) into v_count from public.transactions;
  return 'TXN-2026-' || lpad((847 + v_count)::text, 5, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Customer: send money to a saved recipient
-- ---------------------------------------------------------------------------
create or replace function public.send_money(
  p_owner     uuid,
  p_recipient uuid,
  p_amount    double precision,
  p_currency  text,
  p_note      text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet    public.wallets%rowtype;
  v_recipient public.recipients%rowtype;
  v_cap       double precision;
  v_ref       text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter an amount greater than zero.';
  end if;

  select * into v_recipient from public.recipients
   where id = p_recipient and "ownerId" = p_owner;
  if not found then
    raise exception 'That recipient could not be found.';
  end if;

  select * into v_wallet from public.wallets
   where "ownerId" = p_owner and currency = p_currency
   for update;
  if not found then
    raise exception 'You do not hold a % wallet.', p_currency;
  end if;
  if v_wallet.balance < p_amount then
    raise exception 'Insufficient balance in that wallet.';
  end if;

  select "singleCap" into v_cap from public.user_settings where "ownerId" = p_owner;
  if v_cap is not null and p_amount > v_cap then
    raise exception 'Amount exceeds your single-transfer cap.';
  end if;

  v_ref := public.next_txn_ref();

  update public.wallets
     set balance   = balance - p_amount,
         available = case when available is null then null else available - p_amount end
   where id = v_wallet.id;

  insert into public.transactions
    (ref,"ownerId",date,kind,title,sub,currency,amount,fee,status,party,"partySub",route,risk,reference,"walletSource",delivery)
  values
    (v_ref,p_owner,now(),'send',v_recipient.name,coalesce(v_recipient.handle,'Platform user'),
     p_currency,-p_amount,0,'Completed',v_recipient.name,v_recipient.handle,'Internal','Low',
     nullif(p_note,''),p_currency || ' Wallet','Instantaneous');

  update public.recipients set "lastSent" = now() where id = p_recipient;
  update public.user_settings set "dailyUsed" = "dailyUsed" + p_amount where "ownerId" = p_owner;

  return json_build_object('ok', true, 'ref', v_ref);
end;
$$;

-- ---------------------------------------------------------------------------
-- Customer: convert between two of their own wallets
-- ---------------------------------------------------------------------------
create or replace function public.convert_money(
  p_owner    uuid,
  p_from     text,
  p_to       text,
  p_amount   double precision,
  p_rate     double precision,
  p_fee_rate double precision default 0.0025
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from     public.wallets%rowtype;
  v_to       public.wallets%rowtype;
  v_fee      double precision;
  v_received double precision;
  v_ref      text;
begin
  if p_from = p_to then
    raise exception 'Choose two different currencies.';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter an amount greater than zero.';
  end if;
  if p_rate is null or p_rate <= 0 then
    raise exception 'No exchange rate for % to %.', p_from, p_to;
  end if;

  select * into v_from from public.wallets
   where "ownerId" = p_owner and currency = p_from for update;
  if not found then raise exception 'You need a % wallet.', p_from; end if;

  select * into v_to from public.wallets
   where "ownerId" = p_owner and currency = p_to for update;
  if not found then raise exception 'You need a % wallet.', p_to; end if;

  if v_from.balance < p_amount then
    raise exception 'Insufficient balance to convert.';
  end if;

  v_fee      := p_amount * p_fee_rate;
  v_received := (p_amount - v_fee) * p_rate;
  v_ref      := public.next_txn_ref();

  update public.wallets
     set balance   = balance - p_amount,
         available = case when available is null then null else available - p_amount end
   where id = v_from.id;

  update public.wallets
     set balance   = balance + v_received,
         available = case when available is null then null else available + v_received end
   where id = v_to.id;

  insert into public.transactions
    (ref,"ownerId",date,kind,title,sub,currency,amount,fee,status,party,"partySub",route,risk,"walletSource",delivery)
  values
    (v_ref,p_owner,now(),'convert',p_from || ' → ' || p_to || ' conversion','Internal wallet loop',
     p_to,v_received,v_fee,'Completed','FX Desk',p_from || ' → ' || p_to,'FX Swap','Low',
     p_from || ' Wallet','Instantaneous');

  return json_build_object('ok', true, 'ref', v_ref, 'received', v_received);
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: disburse treasury funds to any customer (double-entry)
-- ---------------------------------------------------------------------------
create or replace function public.admin_send(
  p_admin    uuid,
  p_target   uuid,
  p_amount   double precision,
  p_currency text,
  p_note     text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_wallet  public.wallets%rowtype;
  v_target_wallet public.wallets%rowtype;
  v_target        public.profiles%rowtype;
  v_ref_out       text;
  v_ref_in        text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter an amount greater than zero.';
  end if;
  if p_admin = p_target then
    raise exception 'Pick a different account to send to.';
  end if;

  select * into v_target from public.profiles where id = p_target;
  if not found then raise exception 'That user could not be found.'; end if;

  select * into v_admin_wallet from public.wallets
   where "ownerId" = p_admin and currency = p_currency for update;
  if not found then raise exception 'Treasury has no % wallet.', p_currency; end if;
  if v_admin_wallet.balance < p_amount then
    raise exception 'Insufficient % treasury balance.', p_currency;
  end if;

  v_ref_out := public.next_txn_ref();

  -- Debit treasury
  update public.wallets
     set balance   = balance - p_amount,
         available = case when available is null then null else available - p_amount end
   where id = v_admin_wallet.id;

  -- Credit target, creating the wallet if they don't hold that currency
  select * into v_target_wallet from public.wallets
   where "ownerId" = p_target and currency = p_currency for update;

  if found then
    update public.wallets
       set balance   = balance + p_amount,
           available = case when available is null then null else available + p_amount end
     where id = v_target_wallet.id;
  else
    insert into public.wallets ("ownerId",currency,symbol,balance,available,pending,"changeLabel","changeTone",sort)
    values (p_target,p_currency,v_admin_wallet.symbol,p_amount,p_amount,0,'+0.00%','flat',9);
  end if;

  -- Admin-side ledger entry (outgoing)
  insert into public.transactions
    (ref,"ownerId",date,kind,title,sub,currency,amount,fee,status,party,"partySub",route,risk,reference,"walletSource",delivery)
  values
    (v_ref_out,p_admin,now(),'send',v_target.name,coalesce(v_target.handle,v_target.email),
     p_currency,-p_amount,0,'Completed',v_target.name,'Platform disbursement','Internal','Low',
     nullif(p_note,''),'Treasury ' || p_currency,'Instantaneous');

  v_ref_in := public.next_txn_ref();

  -- Target-side ledger entry (incoming)
  insert into public.transactions
    (ref,"ownerId",date,kind,title,sub,currency,amount,fee,status,party,"partySub",route,risk,reference,"walletSource",delivery)
  values
    (v_ref_in,p_target,now(),'receive','Profintal Savings','Funds received from Profintal Savings',
     p_currency,p_amount,0,'Completed','Profintal Savings','Admin disbursement','Internal','Low',
     nullif(p_note,''),p_currency || ' Wallet','Instantaneous');

  return json_build_object('ok', true, 'out', v_ref_out, 'in', v_ref_in);
end;
$$;
