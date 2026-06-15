-- Allows the store theme color to be any custom hex color instead of a fixed preset.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table stores drop constraint if exists stores_theme_check;

alter table stores
  alter column theme set default '#92400e';
