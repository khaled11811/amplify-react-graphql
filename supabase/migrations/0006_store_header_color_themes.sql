-- Adds a custom header bar color and expands the available theme colors.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table stores
  add column header_color text not null default '#ffffff';

alter table stores drop constraint if exists stores_theme_check;
alter table stores add constraint stores_theme_check
  check (theme in ('brown', 'blue', 'red', 'pink', 'green', 'purple', 'teal', 'orange', 'indigo', 'slate'));
