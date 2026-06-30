import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { QueryToast } from "@/lib/toast/QueryToast";
import { deleteProduct } from "./actions";
import { formatPrice } from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";
import { StarDisplay } from "@/components/StarDisplay";

export async function ProductsListView({
  storeId,
  basePath,
  searchQuery,
}: {
  storeId: string;
  basePath: string;
  searchQuery?: string;
}) {
  const supabase = await createClient();
  const lang = await getLang();
  const { data: storeData } = await supabase.from("stores").select("currency").eq("id", storeId).single();
  const storeCurrency = storeData?.currency ?? "usd";

  let query = supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data: products } = await query;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", storeId);

  const categoryNameById = new Map(categories?.map((c) => [c.id, c.name]));

  const productIds = products?.map((p) => p.id) ?? [];
  const { data: images } = productIds.length
    ? await supabase
        .from("product_images")
        .select("product_id, image_url")
        .in("product_id", productIds)
        .eq("sort_order", 0)
    : { data: [] };

  const imageByProduct = new Map(images?.map((i) => [i.product_id, i.image_url]));

  const adminClient = createAdminClient();
  const { data: ratingRows } = productIds.length
    ? await adminClient.from("ratings").select("product_id, rating").in("product_id", productIds)
    : { data: [] };

  type RatingStat = { avg: number | null; count: number };
  const ratingByProduct = new Map<string, RatingStat>();
  for (const r of ratingRows ?? []) {
    const prev = ratingByProduct.get(r.product_id) ?? { avg: null, count: 0, _sum: 0 };
    const sum = ((prev as { avg: number | null; count: number; _sum?: number })._sum ?? 0) + r.rating;
    const count = prev.count + 1;
    ratingByProduct.set(r.product_id, { avg: Math.round((sum / count) * 10) / 10, count, _sum: sum } as RatingStat & { _sum: number });
  }

  return (
    <div>
      <QueryToast param="updated" message="Product updated successfully." />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "products_heading")}</h1>
        <Link
          href={`${basePath}/new`}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          {t(lang, "new_product_btn")}
        </Link>
      </div>

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          placeholder={t(lang, "search_products_dashboard")}
          defaultValue={searchQuery}
          className="w-full max-w-sm rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium"></th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_name")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_category")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_price")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "stock_label")}</th>
              <th className="px-4 py-2 font-medium">{lang === "ar" ? "التقييم" : "Rating"}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-t border-stone-200">
                <td className="px-4 py-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-stone-100">
                    {imageByProduct.get(product.id) && (
                      <Image
                        src={imageByProduct.get(product.id)!}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 font-medium">{product.name}</td>
                <td className="px-4 py-2 text-stone-600">
                  {product.category_id
                    ? categoryNameById.get(product.category_id) ?? "—"
                    : "—"}
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(product.price, storeCurrency)}
                </td>
                <td className="px-4 py-2 text-stone-600">{product.stock}</td>
                <td className="px-4 py-2">
                  {(() => {
                    const stat = ratingByProduct.get(product.id);
                    return stat?.count
                      ? <StarDisplay avgRating={stat.avg} ratingCount={stat.count} />
                      : <span className="text-xs text-stone-400">{lang === "ar" ? "لا يوجد" : "None"}</span>;
                  })()}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      product.is_active
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                    }
                  >
                    {product.is_active ? t(lang, "status_active") : t(lang, "status_hidden")}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`${basePath}/${product.id}/edit`}
                      className="text-sm text-stone-600 hover:text-stone-900"
                    >
                      {t(lang, "action_edit")}
                    </Link>
                    <DeleteButton action={deleteProduct.bind(null, storeId, product.id)} lang={lang} />
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-stone-500">
                  {searchQuery
                    ? `${t(lang, "no_products_matching_dashboard")} "${searchQuery}".`
                    : t(lang, "no_products_dashboard")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
