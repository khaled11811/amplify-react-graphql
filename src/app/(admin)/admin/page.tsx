import { getCurrentProfile } from "@/lib/data/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database.types";
import { StoreStatsSelector, type StoreStat } from "./StoreStatsSelector";

const REVENUE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "completed"];

function formatRevenue(revenueByCurrency: Map<string, number>) {
  if (revenueByCurrency.size === 0) return "$0.00";
  return [...revenueByCurrency.entries()]
    .map(([currency, amount]) => `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`)
    .join(", ");
}

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const [
    { count: totalStores },
    { count: activeStores },
    { count: totalOrders },
    { data: paidOrders },
    { data: stores },
    { data: products },
    { data: categories },
    { data: orders },
  ] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total_amount, currency")
      .in("status", REVENUE_STATUSES),
    supabase.from("stores").select("id, name, owner_id").order("name"),
    supabase.from("products").select("store_id"),
    supabase.from("categories").select("store_id"),
    supabase
      .from("orders")
      .select("store_id, total_amount, currency, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const revenueByCurrency = new Map<string, number>();
  for (const order of paidOrders ?? []) {
    revenueByCurrency.set(
      order.currency,
      (revenueByCurrency.get(order.currency) ?? 0) + order.total_amount
    );
  }

  const stats = [
    { label: "Total stores", value: totalStores ?? 0 },
    { label: "Active stores", value: activeStores ?? 0 },
    { label: "Total orders", value: totalOrders ?? 0 },
    { label: "Total Revenue", value: formatRevenue(revenueByCurrency) },
  ];

  const ownerIds = stores?.map((store) => store.owner_id) ?? [];
  const { data: owners } =
    ownerIds.length > 0
      ? await supabase.from("profiles").select("id, email, full_name").in("id", ownerIds)
      : { data: [] };
  const ownerById = new Map(owners?.map((owner) => [owner.id, owner]));

  const lastLoginByUserId = new Map<string, string | null>();
  if (ownerIds.length > 0) {
    const adminClient = createAdminClient();
    await Promise.all(
      ownerIds.map(async (ownerId) => {
        const { data } = await adminClient.auth.admin.getUserById(ownerId);
        lastLoginByUserId.set(ownerId, data?.user?.last_sign_in_at ?? null);
      })
    );
  }

  const storeStats: StoreStat[] = (stores ?? []).map((store) => {
    const productCount = products?.filter((p) => p.store_id === store.id).length ?? 0;
    const categoryCount = categories?.filter((c) => c.store_id === store.id).length ?? 0;

    const storeOrders = orders?.filter((o) => o.store_id === store.id) ?? [];
    const storeRevenueByCurrency = new Map<string, number>();
    for (const order of storeOrders) {
      if (!REVENUE_STATUSES.includes(order.status)) continue;
      storeRevenueByCurrency.set(
        order.currency,
        (storeRevenueByCurrency.get(order.currency) ?? 0) + order.total_amount
      );
    }

    const owner = ownerById.get(store.owner_id);

    return {
      id: store.id,
      name: store.name,
      ownerLabel: owner?.full_name || owner?.email || "—",
      productCount,
      categoryCount,
      revenue: formatRevenue(storeRevenueByCurrency),
      lastPurchaseAt: storeOrders[0]?.created_at ?? null,
      managerLastLoginAt: lastLoginByUserId.get(store.owner_id) ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">
        Welcome, {profile?.full_name ?? profile?.email}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="text-sm text-stone-500">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <StoreStatsSelector stores={storeStats} />
      </div>
    </div>
  );
}
