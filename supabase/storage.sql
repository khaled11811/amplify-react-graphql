-- Storage buckets for product images, store logos, and banners.
-- Run after schema.sql.

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('store-logos', 'store-logos', true),
  ('store-banners', 'store-banners', true)
on conflict (id) do nothing;

-- Public read access for all three buckets (storefront needs to display them)
drop policy if exists "Public read access to product images" on storage.objects;
create policy "Public read access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Public read access to store logos" on storage.objects;
create policy "Public read access to store logos"
  on storage.objects for select
  using (bucket_id = 'store-logos');

drop policy if exists "Public read access to store banners" on storage.objects;
create policy "Public read access to store banners"
  on storage.objects for select
  using (bucket_id = 'store-banners');

-- Write access restricted to the owning store manager (or admin).
-- Convention: object path must be prefixed with the store's id,
-- e.g. "<store_id>/<filename>".
drop policy if exists "Admins manage all media" on storage.objects;
create policy "Admins manage all media"
  on storage.objects for all
  using (
    bucket_id in ('product-images', 'store-logos', 'store-banners')
    and auth_role() = 'admin'
  )
  with check (
    bucket_id in ('product-images', 'store-logos', 'store-banners')
    and auth_role() = 'admin'
  );

drop policy if exists "Store managers manage their own store media" on storage.objects;
create policy "Store managers manage their own store media"
  on storage.objects for all
  using (
    bucket_id in ('product-images', 'store-logos', 'store-banners')
    and (storage.foldername(name))[1] = auth_store_id()::text
  )
  with check (
    bucket_id in ('product-images', 'store-logos', 'store-banners')
    and (storage.foldername(name))[1] = auth_store_id()::text
  );
