"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import { createStoreSchema } from "@/lib/validators/store";

export type CreateStoreState = { error?: string } | undefined;

export async function createStore(
  _state: CreateStoreState,
  formData: FormData
): Promise<CreateStoreState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return { error: "Not authorized." };
  }

  const parsed = createStoreSchema.safeParse({
    storeName: formData.get("storeName"),
    storeSlug: formData.get("storeSlug"),
    managerEmail: formData.get("managerEmail"),
    managerPassword: formData.get("managerPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { storeName, storeSlug, managerEmail, managerPassword } = parsed.data;

  const adminClient = createAdminClient();

  const { data: userData, error: userError } =
    await adminClient.auth.admin.createUser({
      email: managerEmail,
      password: managerPassword,
      email_confirm: true,
    });

  if (userError || !userData.user) {
    return {
      error: userError?.message ?? "Failed to create store manager account.",
    };
  }

  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({
      owner_id: userData.user.id,
      name: storeName,
      slug: storeSlug,
    })
    .select()
    .single();

  if (storeError || !store) {
    return { error: storeError?.message ?? "Failed to create store." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ store_id: store.id })
    .eq("id", userData.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}

export async function toggleStoreStatus(storeId: string, currentStatus: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return;

  const supabase = await createClient();
  await supabase
    .from("stores")
    .update({ status: currentStatus === "active" ? "suspended" : "active" })
    .eq("id", storeId);

  revalidatePath("/admin/stores");
}

export async function deleteStore(storeId: string) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return;

  const supabase = await createClient();
  await supabase.from("stores").delete().eq("id", storeId);

  revalidatePath("/admin/stores");
}
