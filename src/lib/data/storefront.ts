import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductImage } from "@/types/database.types";

export type ProductWithImages = Product & { images: ProductImage[] };

async function attachImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  products: Product[]
): Promise<ProductWithImages[]> {
  if (products.length === 0) return [];

  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", products.map((p) => p.id))
    .order("sort_order", { ascending: true });

  const imagesByProduct = new Map<string, ProductImage[]>();
  for (const image of images ?? []) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image);
    imagesByProduct.set(image.product_id, list);
  }

  return products.map((product) => ({
    ...product,
    images: imagesByProduct.get(product.id) ?? [],
  }));
}

export const getStoreBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  return data;
});

export const getStoreCategories = cache(async (storeId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .order("name");
  return data ?? [];
});

export const getStoreProducts = cache(
  async (storeId: string, categorySlug?: string, search?: string) => {
    const supabase = await createClient();

    let categoryId: string | undefined;
    if (categorySlug) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("store_id", storeId)
        .eq("slug", categorySlug)
        .single();
      categoryId = category?.id;
      if (!categoryId) return [];
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data } = await query;
    return attachImages(supabase, data ?? []);
  }
);

export const getProductBySlug = cache(
  async (storeId: string, productSlug: string) => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .eq("slug", productSlug)
      .eq("is_active", true)
      .single();
    if (!data) return null;
    const [withImages] = await attachImages(supabase, [data]);
    return withImages;
  }
);
