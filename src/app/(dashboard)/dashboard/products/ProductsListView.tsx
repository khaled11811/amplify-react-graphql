import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QueryToast } from "@/lib/toast/QueryToast";
import { deleteProduct } from "./actions";

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

  return (
    <div>
      <QueryToast param="updated" message="Product updated successfully." />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
        <Link
          href={`${basePath}/new`}
          className="rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)]"
        >
          New Product
        </Link>
      </div>

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          placeholder="Search products by name..."
          defaultValue={searchQuery}
          className="w-full max-w-sm rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium"></th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Stock</th>
              <th className="px-4 py-2 font-medium">Status</th>
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
                  ${(product.price / 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-stone-600">{product.stock}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      product.is_active
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                    }
                  >
                    {product.is_active ? "active" : "hidden"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`${basePath}/${product.id}/edit`}
                      className="text-sm text-stone-600 hover:text-stone-900"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, storeId, product.id)}>
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-stone-500">
                  {searchQuery
                    ? `No products found matching "${searchQuery}".`
                    : "No products yet. Create your first product to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
