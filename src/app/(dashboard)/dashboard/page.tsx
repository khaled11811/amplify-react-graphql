import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database.types";
import { CopyStoreLink } from "./CopyStoreLink";
import { formatPrice } from "@/lib/format";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { ConnectOnboardingBanner } from "@/components/ConnectOnboardingBanner";

const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "completed"];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const lang = await getLang();

  if (!profile?.store_id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          {t(lang, "welcome_prefix")} {profile?.full_name ?? profile?.email}
        </h1>
        <p className="mt-2 text-stone-600">{t(lang, "no_store_assigned")}</p>
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: store }, { count: productCount }, { count: categoryCount }] =
    await Promise.all([
      supabase.from("stores").select("*").eq("id", profile.store_id).single(),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
      supabase.from("categories").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
    ]);

  const isDisplayShop = store?.store_type === "display_shop";

  let orderCount: number | null = null;
  let revenue = "$0.00";

  if (!isDisplayShop) {
    const [{ count: oc }, { data: revenueOrders }] = await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", profile.store_id),
      supabase
        .from("orders")
        .select("total_amount, currency")
        .eq("store_id", profile.store_id)
        .in("status", REVENUE_STATUSES),
    ]);
    orderCount = oc;
    const totalRevenue = (revenueOrders ?? []).reduce((sum, o) => sum + o.total_amount, 0);
    revenue = formatPrice(totalRevenue, store?.currency ?? "usd");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">
        {t(lang, "welcome_prefix")} {profile?.full_name ?? profile?.email}
      </h1>
      {store?.description && (
        <p className="mt-1 text-sm text-stone-600">{store.description}</p>
      )}

      {store?.slug && <CopyStoreLink slug={store.slug} lang={lang} />}

      {!isDisplayShop && !store?.stripe_charges_enabled && (
        <div className="mt-4">
          <ConnectOnboardingBanner lang={lang} />
        </div>
      )}

      <dl className={`mt-6 grid gap-4 ${isDisplayShop ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
          <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "stat_products")}</dt>
          <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{productCount ?? 0}</dd>
        </div>
        <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
          <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "stat_categories")}</dt>
          <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{categoryCount ?? 0}</dd>
        </div>
        {!isDisplayShop && (
          <>
            <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
              <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "stat_orders")}</dt>
              <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{orderCount ?? 0}</dd>
            </div>
            <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
              <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "stat_revenue")}</dt>
              <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{revenue}</dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}
