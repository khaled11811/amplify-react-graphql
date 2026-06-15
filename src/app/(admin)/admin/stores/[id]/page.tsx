import { requireStoreAccess } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStoreOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  const supabase = await createClient();
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
          <dt className="text-sm text-stone-600">Status</dt>
          <dd className="mt-1 text-lg font-semibold capitalize">{store?.status}</dd>
        </div>
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
      </dl>

      {store?.description && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-stone-900">Description</h2>
          <p className="mt-1 text-sm text-stone-600">{store.description}</p>
        </div>
      )}
    </div>
  );
}
