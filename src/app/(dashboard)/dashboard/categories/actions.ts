"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import { categorySchema } from "@/lib/validators/store";

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

export async function deleteCategory(storeId: string, categoryId: string) {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) return;
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId).eq("store_id", storeId);
  revalidateCategories(storeId);
}
