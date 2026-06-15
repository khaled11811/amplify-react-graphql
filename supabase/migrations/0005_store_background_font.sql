-- Adds storefront background customization and font selection.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table stores
  add column background_type text not null default 'none'
    check (background_type in ('none', 'color', 'preset', 'image'));

alter table stores
  add column background_value text;

alter table stores
  add column font text not null default 'sans'
    check (font in ('sans', 'serif', 'rounded'));
