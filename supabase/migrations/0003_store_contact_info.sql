-- Adds store contact info, shown publicly on the storefront so customers
-- can reach the store manager.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table stores
  add column contact_info jsonb not null default '{}'::jsonb;
