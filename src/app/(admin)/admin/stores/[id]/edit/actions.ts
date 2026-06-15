"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import { editStoreSchema } from "@/lib/validators/store";

export type EditStoreState = { error?: string } | undefined;

export async function updateStoreAdmin(
  storeId: string,
  _state: EditStoreState,
  formData: FormData
): Promise<EditStoreState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    return { error: "Not authorized." };
  }

  const parsed = editStoreSchema.safeParse({
    name: formData.get("name"),
    managerEmail: formData.get("managerEmail"),
    publicEmail: formData.get("publicEmail") || undefined,
    newPassword: formData.get("newPassword") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, managerEmail, publicEmail, newPassword } = parsed.data;

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("owner_id, contact_info")
    .eq("id", storeId)
    .single();

  if (!store) {
    return { error: "Store not found." };
  }

  const adminClient = createAdminClient();

  const userUpdate: { email?: string; password?: string } = {};
  if (managerEmail) userUpdate.email = managerEmail;
  if (newPassword) userUpdate.password = newPassword;

  if (Object.keys(userUpdate).length > 0) {
    const { error: userError } = await adminClient.auth.admin.updateUserById(
      store.owner_id,
      { ...userUpdate, email_confirm: true }
    );
    if (userError) return { error: userError.message };
  }

  if (managerEmail) {
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ email: managerEmail })
      .eq("id", store.owner_id);
    if (profileError) return { error: profileError.message };
  }

  const contactInfo = { ...(store.contact_info ?? {}) };
  if (publicEmail) {
    contactInfo.business_email = publicEmail;
  } else {
    delete contactInfo.business_email;
  }

  const { error: storeError } = await supabase
    .from("stores")
    .update({ name, contact_info: contactInfo })
    .eq("id", storeId);

  if (storeError) return { error: storeError.message };

  revalidatePath("/admin/stores");
  revalidatePath(`/admin/stores/${storeId}`);
  redirect("/admin/stores");
}
