import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QueryToast } from "@/lib/toast/QueryToast";
import { ProductForm } from "../../ProductForm";
import { ProductImages } from "./ProductImages";
import { updateProduct } from "../../actions";

export async function EditProductView({
  storeId,
  basePath,
  productId,
  justCreated,
}: {
  storeId: string;
  basePath: string;
  productId: string;
  justCreated?: boolean;
}) {
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .order("name"),
  ]);

  if (!product) notFound();

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <QueryToast param="created" message="Product created successfully." />
      <h1 className="text-2xl font-semibold text-stone-900">Edit Product</h1>

      {justCreated && (
        <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Product created. Add some images below to make it stand out.
        </p>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-medium text-stone-900">Images</h2>
        <div className="mt-2">
          <ProductImages
            productId={product.id}
            storeId={storeId}
            images={images ?? []}
          />
        </div>
      </div>

      <div className="mt-6">
        <ProductForm
          categories={categories ?? []}
          product={product}
          action={updateProduct.bind(null, storeId, basePath, product.id)}
        />
      </div>
    </div>
  );
}
