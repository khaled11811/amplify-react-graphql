-- Adds store appearance (theme) and billing/payout info fields.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table stores
  add column theme text not null default 'brown'
    check (theme in ('brown', 'blue', 'red', 'pink'));

alter table stores
  add column billing_info jsonb not null default '{}'::jsonb;
