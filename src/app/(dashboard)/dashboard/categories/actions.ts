"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import { categorySchema } from "@/lib/validators/store";
import { collectDescendantIds } from "@/lib/categories";

export type CategoryActionState = { error?: string } | undefined;

function revalidateCategories(storeId: string) {
  revalidatePath("/dashboard/categories");
  revalidatePath(`/admin/stores/${storeId}/categories`);
}

export async function createCategory(
  storeId: string,
  _state: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) {
    return { error: "Not authorized." };
  }
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parent_id: formData.get("parent_id"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    store_id: storeId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    parent_id: parsed.data.parent_id,
  });
  if (error) return { error: error.message };
  revalidateCategories(storeId);
  return undefined;
}

export async function updateCategory(
  storeId: string,
  categoryId: string,
  _state: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) return { error: "Not authorized." };

  const name = (formData.get("name") as string | null)?.trim();
  if (!name || name.length < 2) return { error: "Name must be at least 2 characters." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", categoryId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };
  revalidateCategories(storeId);
  return undefined;
}

export async function deleteCategory(
  storeId: string,
  categoryId: string
): Promise<{ error: string } | undefined> {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) return { error: "Not authorized." };
  const supabase = await createClient();

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("store_id", storeId);

  const categoryIds = collectDescendantIds(allCategories ?? [], categoryId);

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("category_id", categoryIds);

  if (count && count > 0) {
    return {
      error: `This category (or one of its sub-categories) has ${count} product${count > 1 ? "s" : ""} assigned to it. Please delete or reassign the product${count > 1 ? "s" : ""} first.`,
    };
  }

  await supabase.from("categories").delete().eq("id", categoryId).eq("store_id", storeId);
  revalidateCategories(storeId);
}
