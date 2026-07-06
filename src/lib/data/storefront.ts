import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { Product, ProductImage } from "@/types/database.types";
import { buildCategoryTree, type CategoryNode } from "@/lib/categories";

export type ProductWithImages = Product & {
  images: ProductImage[];
  avg_rating: number | null;
  rating_count: number;
};

async function attachImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  products: Product[]
): Promise<ProductWithImages[]> {
  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);

  const adminClient = createAdminClient();
  const [{ data: images }, { data: ratingRows }] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
    adminClient
      .from("ratings")
      .select("product_id, rating")
      .in("product_id", productIds),
  ]);

  const imagesByProduct = new Map<string, ProductImage[]>();
  for (const image of images ?? []) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image);
    imagesByProduct.set(image.product_id, list);
  }

  const ratingsByProduct = new Map<string, number[]>();
  for (const r of ratingRows ?? []) {
    const list = ratingsByProduct.get(r.product_id) ?? [];
    list.push(r.rating);
    ratingsByProduct.set(r.product_id, list);
  }

  return products.map((product) => {
    const productRatings = ratingsByProduct.get(product.id) ?? [];
    const rating_count = productRatings.length;
    const avg_rating =
      rating_count > 0
        ? Math.round((productRatings.reduce((a, b) => a + b, 0) / rating_count) * 10) / 10
        : null;
    return {
      ...product,
      images: imagesByProduct.get(product.id) ?? [],
      avg_rating,
      rating_count,
    };
  });
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

export const getStoreCategories = cache(async (storeId: string): Promise<CategoryNode[]> => {
  const supabase = await createClient();

  const [{ data: allCategories }, { data: activeProducts }] = await Promise.all([
    supabase.from("categories").select("*").eq("store_id", storeId).order("name"),
    supabase.from("products").select("category_id").eq("store_id", storeId).eq("is_active", true).not("category_id", "is", null),
  ]);

  if (!allCategories?.length) return [];

  const activeCategoryIds = new Set((activeProducts ?? []).map((p) => p.category_id));

  const tree = buildCategoryTree(allCategories);

  function hasActiveProducts(node: CategoryNode): boolean {
    if (activeCategoryIds.has(node.id)) return true;
    return node.children.some(hasActiveProducts);
  }

  function filterTree(nodes: CategoryNode[]): CategoryNode[] {
    return nodes
      .filter(hasActiveProducts)
      .map((node) => ({ ...node, children: filterTree(node.children) }));
  }

  return filterTree(tree);
});

const PAGE_SIZE = 30;

export const getStoreProducts = cache(
  async (storeId: string, categorySlug?: string, search?: string, page = 1, sort = "newest") => {
    const supabase = await createClient();

    let categoryIds: string[] | undefined;
    if (categorySlug) {
      const [{ data: rootCat }, { data: allCategories }] = await Promise.all([
        supabase.from("categories").select("id").eq("store_id", storeId).eq("slug", categorySlug).single(),
        supabase.from("categories").select("id, parent_id").eq("store_id", storeId),
      ]);

      if (!rootCat) return { products: [], total: 0 };

      const catMap = allCategories ?? [];

      function collectIds(parentId: string): string[] {
        const children = catMap.filter((c) => c.parent_id === parentId);
        return [parentId, ...children.flatMap((c) => collectIds(c.id))];
      }

      categoryIds = collectIds(rootCat.id);
    }

    const offset = (page - 1) * PAGE_SIZE;

    const sortMap: Record<string, { column: string; ascending: boolean }> = {
      newest: { column: "created_at", ascending: false },
      oldest: { column: "created_at", ascending: true },
      price_asc: { column: "price", ascending: true },
      price_desc: { column: "price", ascending: false },
      name_asc: { column: "name", ascending: true },
      name_desc: { column: "name", ascending: false },
    };
    const { column, ascending } = sortMap[sort] ?? sortMap.newest;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order(column, { ascending })
      .range(offset, offset + PAGE_SIZE - 1);

    if (categoryIds) {
      query = query.in("category_id", categoryIds);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, count } = await query;
    const products = await attachImages(supabase, data ?? []);
    return { products, total: count ?? 0 };
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
