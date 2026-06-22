import { getCurrentProfile } from "@/lib/data/auth";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database.types";
import { StoreStatsSelector, type StoreStat } from "./StoreStatsSelector";
import { formatPrice } from "@/lib/format";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "completed"];

function formatRevenue(revenueByCurrency: Map<string, number>) {
  if (revenueByCurrency.size === 0) return formatPrice(0, "usd");
  return [...revenueByCurrency.entries()]
    .map(([currency, amount]) => formatPrice(amount, currency))
    .join(", ");
}

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  const [supabase, lang] = [await createClient(), await getLang()];
  const adminClient = createAdminClient();

  const [
    { count: totalStores },
    { count: activeStores },
    { count: suspendedStores },
    { count: deletedStores },
    { count: totalOrders },
    { data: paidOrders },
    { data: stores },
    { data: products },
    { data: categories },
    { data: orders },
    { data: subscriptionPaymentsData },
  ] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("stores").select("*", { count: "exact", head: true }).eq("status", "suspended").is("deleted_at", null),
    supabase.from("stores").select("*", { count: "exact", head: true }).not("deleted_at", "is", null),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount, currency").in("status", REVENUE_STATUSES),
    supabase.from("stores").select("id, name, owner_id, store_type").is("deleted_at", null).order("name"),
    supabase.from("products").select("store_id"),
    supabase.from("categories").select("store_id"),
    supabase.from("orders").select("store_id, total_amount, currency, status, created_at").order("created_at", { ascending: false }),
    adminClient.from("subscription_payments").select("amount_aed"),
  ]);

  const revenueByCurrency = new Map<string, number>();
  for (const order of paidOrders ?? []) {
    revenueByCurrency.set(
      order.currency,
      (revenueByCurrency.get(order.currency) ?? 0) + order.total_amount
    );
  }

  const totalSubscriptionAed = (subscriptionPaymentsData ?? []).reduce((sum, row) => sum + Number(row.amount_aed), 0);
  const subscriptionRevenue = `AED ${totalSubscriptionAed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { label: t(lang, "total_stores"), value: totalStores ?? 0 },
    { label: t(lang, "active_stores"), value: activeStores ?? 0 },
    { label: t(lang, "suspended_stores"), value: suspendedStores ?? 0 },
    { label: t(lang, "deleted_stores"), value: deletedStores ?? 0 },
    { label: t(lang, "total_orders"), value: totalOrders ?? 0 },
    { label: t(lang, "total_revenue"), value: formatRevenue(revenueByCurrency) },
    { label: t(lang, "subscription_revenue"), value: subscriptionRevenue },
  ];

  const ownerIds = stores?.map((store) => store.owner_id) ?? [];
  const { data: owners } =
    ownerIds.length > 0
      ? await supabase.from("profiles").select("id, email, full_name").in("id", ownerIds)
      : { data: [] };
  const ownerById = new Map(owners?.map((owner) => [owner.id, owner]));

  const lastLoginByUserId = new Map<string, string | null>();
  if (ownerIds.length > 0) {
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
    const orderCount = storeOrders.length;
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
      storeType: store.store_type as "paid_shop" | "display_shop",
      ownerLabel: owner?.full_name || owner?.email || "—",
      productCount,
      categoryCount,
      orderCount,
      revenue: formatRevenue(storeRevenueByCurrency),
      lastPurchaseAt: storeOrders[0]?.created_at ?? null,
      managerLastLoginAt: lastLoginByUserId.get(store.owner_id) ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">
        {t(lang, "welcome_admin")}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600"
          >
            <div className="text-sm text-stone-500 transition-colors group-hover:text-white">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold transition-colors group-hover:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <StoreStatsSelector stores={storeStats} lang={lang} />
      </div>
    </div>
  );
}
