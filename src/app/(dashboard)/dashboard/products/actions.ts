"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import { productSchema } from "@/lib/validators/store";

export type ProductActionState = { error?: string; redirect?: string } | undefined;

function parseProductForm(formData: FormData) {
  const categoryId = formData.get("category_id");
  const priceDollars = Number(formData.get("price"));

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    price: Math.round(priceDollars * 100),
    currency: formData.get("currency") || "usd",
    stock: Number(formData.get("stock")),
    category_id: categoryId ? categoryId : null,
    is_active: formData.get("is_active") === "on",
  });
}

function revalidateProducts(storeId: string) {
  revalidatePath("/dashboard/products");
  revalidatePath(`/admin/stores/${storeId}/products`);
}

export async function createProduct(
  storeId: string,
  basePath: string,
  _state: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) {
    return { error: "Not authorized." };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const productId = formData.get("product_id");

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      ...(typeof productId === "string" && productId ? { id: productId } : {}),
      store_id: storeId,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const imageUrls = formData.getAll("image_url").filter((url): url is string => typeof url === "string" && url.length > 0);
  if (imageUrls.length) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        sort_order: index,
      }))
    );
  }

  revalidateProducts(storeId);
  return { redirect: `${basePath}/${product.id}/edit?created=1` };
}

export async function updateProduct(
  storeId: string,
  basePath: string,
  productId: string,
  _state: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) {
    return { error: "Not authorized." };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) {
    return { error: error.message };
  }

  revalidateProducts(storeId);
  redirect(`${basePath}?updated=1`);
}

export async function deleteProduct(storeId: string, productId: string) {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) return;

  const supabase = await createClient();
  await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", storeId);

  revalidateProducts(storeId);
}
