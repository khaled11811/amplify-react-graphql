-- Adds support for up to 3 levels of categories (category, sub-category,
-- sub-sub-category) via a self-referencing parent_id column.
-- Run this against the existing Supabase project (SQL Editor or `supabase db push`).

alter table categories
  add column parent_id uuid references categories (id) on delete cascade;

create index idx_categories_parent_id on categories (parent_id);
