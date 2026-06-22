import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product, ProductImage } from "@/types/database.types";
import { buildCategoryTree, type CategoryNode } from "@/lib/categories";

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
  async (storeId: string, categorySlug?: string, search?: string, page = 1) => {
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

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
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
