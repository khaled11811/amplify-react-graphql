-- Multi-Store Marketplace schema
-- Run against a new Supabase project (SQL Editor or `supabase db push`).

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type user_role as enum ('admin', 'store_manager');
create type store_status as enum ('active', 'suspended');
create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled');
create type transaction_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- ============================================================
-- Tables
-- ============================================================

-- Profiles: extends auth.users with role + store assignment
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'store_manager',
  store_id uuid, -- nullable, FK added after stores table exists
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  banner_url text,
  status store_status not null default 'active',
  theme text not null default '#92400e',
  header_color text not null default '#ffffff',
  background_type text not null default 'none' check (background_type in ('none', 'color', 'preset', 'image')),
  background_value text,
  font text not null default 'sans' check (font in ('sans', 'serif', 'rounded')),
  billing_info jsonb not null default '{}'::jsonb,
  contact_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_store_id_fkey
  foreign key (store_id) references stores (id) on delete set null;

create table categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price integer not null check (price >= 0), -- smallest currency unit
  currency text not null default 'usd',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  shipping_address text,
  status order_status not null default 'pending',
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  store_id uuid not null references stores (id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  amount integer not null,
  currency text not null default 'usd',
  status transaction_status not null default 'pending',
  payment_method text,
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  amount integer not null check (amount > 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid')),
  requested_at timestamptz not null default now(),
  paid_at timestamptz
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_stores_owner_id on stores (owner_id);
create index idx_categories_store_id on categories (store_id);
create index idx_products_store_id on products (store_id);
create index idx_products_category_id on products (category_id);
create index idx_product_images_product_id on product_images (product_id);
create index idx_orders_store_id on orders (store_id);
create index idx_order_items_order_id on order_items (order_id);
create index idx_transactions_store_id on transactions (store_id);
create index idx_transactions_order_id on transactions (order_id);
create index idx_payouts_store_id on payouts (store_id);

-- ============================================================
-- Helper function: current user's role and store_id
-- ============================================================
create or replace function auth_role()
returns user_role
language sql stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_store_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select store_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table transactions enable row level security;
alter table payouts enable row level security;

-- ---------- profiles ----------
create policy "Admins manage all profiles"
  on profiles for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Users can view their own profile"
  on profiles for select
  using (id = auth.uid());

-- ---------- stores ----------
create policy "Admins manage all stores"
  on stores for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers view their own store"
  on stores for select
  using (id = auth_store_id());

create policy "Store managers update their own store"
  on stores for update
  using (id = auth_store_id())
  with check (id = auth_store_id());

create policy "Public can view active stores"
  on stores for select
  using (status = 'active');

-- ---------- categories ----------
create policy "Admins manage all categories"
  on categories for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers manage their own categories"
  on categories for all
  using (store_id = auth_store_id())
  with check (store_id = auth_store_id());

create policy "Public can view categories of active stores"
  on categories for select
  using (
    exists (
      select 1 from stores
      where stores.id = categories.store_id
      and stores.status = 'active'
    )
  );

-- ---------- products ----------
create policy "Admins manage all products"
  on products for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers manage their own products"
  on products for all
  using (store_id = auth_store_id())
  with check (store_id = auth_store_id());

create policy "Public can view active products of active stores"
  on products for select
  using (
    is_active = true
    and exists (
      select 1 from stores
      where stores.id = products.store_id
      and stores.status = 'active'
    )
  );

-- ---------- product_images ----------
create policy "Admins manage all product images"
  on product_images for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers manage images of their own products"
  on product_images for all
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.store_id = auth_store_id()
    )
  )
  with check (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.store_id = auth_store_id()
    )
  );

create policy "Public can view images of active products"
  on product_images for select
  using (
    exists (
      select 1 from products
      join stores on stores.id = products.store_id
      where products.id = product_images.product_id
      and products.is_active = true
      and stores.status = 'active'
    )
  );

-- ---------- orders ----------
create policy "Admins manage all orders"
  on orders for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers view their own store orders"
  on orders for select
  using (store_id = auth_store_id());

create policy "Store managers update their own store orders"
  on orders for update
  using (store_id = auth_store_id())
  with check (store_id = auth_store_id());

-- Note: order creation (checkout) is performed by the server using the
-- service role key, bypassing RLS, after validating cart + payment.

-- ---------- order_items ----------
create policy "Admins manage all order items"
  on order_items for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers view items of their own store orders"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.store_id = auth_store_id()
    )
  );

-- ---------- transactions ----------
create policy "Admins manage all transactions"
  on transactions for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

create policy "Store managers view their own store transactions"
  on transactions for select
  using (store_id = auth_store_id());

-- ---------- payouts ----------
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

-- ============================================================
-- Auto-create profile on signup (default role: store_manager)
-- Admin must manually promote/assign store via service role.
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'store_manager');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
