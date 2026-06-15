import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database.types";
import { CopyStoreLink } from "./CopyStoreLink";

const REVENUE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "completed"];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile?.store_id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Welcome, {profile?.full_name ?? profile?.email}
        </h1>
        <p className="mt-2 text-stone-600">
          You don&apos;t have a store assigned yet. Contact an administrator.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: store }, { count: productCount }, { count: categoryCount }, { count: orderCount }, { data: revenueOrders }] =
    await Promise.all([
      supabase.from("stores").select("*").eq("id", profile.store_id).single(),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
      supabase.from("categories").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
      supabase
        .from("orders")
        .select("total_amount, currency")
        .eq("store_id", profile.store_id)
        .in("status", REVENUE_STATUSES),
    ]);

  const revenueByCurrency = new Map<string, number>();
  for (const order of revenueOrders ?? []) {
    revenueByCurrency.set(
      order.currency,
      (revenueByCurrency.get(order.currency) ?? 0) + order.total_amount
    );
  }
  const revenue =
    revenueByCurrency.size > 0
      ? [...revenueByCurrency.entries()]
          .map(([currency, amount]) => `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`)
          .join(", ")
      : "$0.00";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{store?.name}</h1>
      {store?.description && (
        <p className="mt-1 text-sm text-stone-600">{store.description}</p>
      )}

      {store?.slug && <CopyStoreLink slug={store.slug} />}

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Products</dt>
          <dd className="mt-1 text-lg font-semibold">{productCount ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Categories</dt>
          <dd className="mt-1 text-lg font-semibold">{categoryCount ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Orders</dt>
          <dd className="mt-1 text-lg font-semibold">{orderCount ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Revenue</dt>
          <dd className="mt-1 text-lg font-semibold">{revenue}</dd>
        </div>
      </dl>
    </div>
  );
}
