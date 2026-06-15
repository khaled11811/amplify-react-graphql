# Multi-Store Marketplace

A platform where an Admin creates stores for Store Managers, who manage their own
products/categories/orders, with a public storefront for unauthenticated customers
(card, Apple Pay, Google Pay, Samsung Pay via Stripe).

## Stack

- **Frontend**: Next.js 16 (App Router, TypeScript, Tailwind CSS)
- **Backend/DB**: Supabase (Postgres + Auth + Storage), Row Level Security for multi-tenancy
- **Payments**: Stripe (Payment Element covers card, Apple Pay, Google Pay)
- **Hosting**: Vercel (frontend) + Supabase Cloud (backend)

> **Note on Next.js 16**: Middleware is now called **Proxy** (`src/proxy.ts`). See
> `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` if anything
> related to routing/middleware looks unfamiliar.

## Getting Started

1. Copy the environment template and fill in your Supabase + Stripe keys:

   ```bash
   cp .env.local.example .env.local
   ```

2. Create a Supabase project, then run the SQL in order:
   - `supabase/schema.sql` — tables, enums, RLS policies, helper functions
   - `supabase/storage.sql` — storage buckets + policies for product images, logos, banners

3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

## Project Structure

```
src/
  app/
    (admin)/admin/         -> Admin dashboard routes (manage stores, users, global orders)
    (dashboard)/dashboard/ -> Store Manager dashboard routes (own store only)
    (public)/store/[slug]/ -> Public storefront (no auth required)
    api/payments/           -> Stripe checkout session route handlers
    api/webhooks/stripe/    -> Stripe webhook handler
    login/                  -> Shared login for Admin & Store Manager
  components/
    admin/                  -> Admin-only UI components
    dashboard/              -> Store Manager UI components
    storefront/             -> Public customer-facing UI components
    ui/                     -> Shared/reusable UI primitives
  lib/
    supabase/               -> Supabase client (browser), server client, proxy/session helper
    stripe/                 -> Stripe client (browser) and server SDK instance
    validators/             -> Zod schemas for forms/server actions
    data/                   -> Data access layer (DAL) - queries with auth checks
    constants.ts            -> Shared route/role constants
  types/
    database.types.ts       -> Hand-written types mirroring supabase/schema.sql
  proxy.ts                  -> Session refresh + role-based route protection
supabase/
  schema.sql                -> Database tables, enums, RLS policies
  storage.sql               -> Storage buckets and access policies
```

## Roles & Access

- **Admin**: full access to all stores, users, orders, transactions (`profiles.role = 'admin'`)
- **Store Manager**: access restricted to their own store via `profiles.store_id`,
  enforced by Postgres RLS policies (see `supabase/schema.sql`)
- **Public Customer**: no account; reads active stores/products via public RLS policies
  on `/store/[slug]`; checkout is handled server-side with the Supabase service role key

## Next Steps

- Implement Supabase Auth login/signup flows
- Build Admin pages: store creation, store manager assignment, global views
- Build Store Manager dashboard: products, categories, orders, transactions
- Build public storefront: browsing, cart, checkout
- Integrate Stripe Payment Element + webhook handling for order/transaction updates
