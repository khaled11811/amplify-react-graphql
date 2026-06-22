import { requireStoreAccess } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export default async function AdminStoreOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  const [supabase, lang] = [await createClient(), await getLang()];
  const { data: store } = await supabase.from("stores").select("*").eq("id", id).single();

  const [{ count: productCount }, { count: orderCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("store_id", id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("store_id", id),
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("store_id", id),
  ]);

  return (
    <div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "stat_status")}</dt>
          <dd className="mt-1 text-lg font-semibold capitalize">{store?.status}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "stat_products")}</dt>
          <dd className="mt-1 text-lg font-semibold">{productCount ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "stat_categories")}</dt>
          <dd className="mt-1 text-lg font-semibold">{categoryCount ?? 0}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "stat_orders")}</dt>
          <dd className="mt-1 text-lg font-semibold">{orderCount ?? 0}</dd>
        </div>
      </dl>

      {store?.description && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-900">{t(lang, "stat_description")}</h2>
          <p className="mt-1 text-sm text-stone-600">{store.description}</p>
        </div>
      )}
    </div>
  );
}
