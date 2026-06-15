import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "./ProductForm";
import { createProduct } from "./actions";

export async function NewProductView({ storeId, basePath }: { storeId: string; basePath: string }) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .order("name");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">New Product</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories ?? []}
          storeId={storeId}
          action={createProduct.bind(null, storeId, basePath)}
        />
      </div>
    </div>
  );
}
