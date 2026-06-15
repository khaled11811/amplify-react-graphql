-- Adds payouts table for store manager revenue retrieval.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

create table payouts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  amount integer not null check (amount > 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_payouts_store_id on payouts (store_id);

alter table payouts enable row level security;

create policy "Admins manage all payouts"
  on payouts for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers view their own payouts"
  on payouts for select
  using (store_id = auth_store_id());

create policy "Store managers create their own payouts"
  on payouts for insert
  with check (store_id = auth_store_id());
