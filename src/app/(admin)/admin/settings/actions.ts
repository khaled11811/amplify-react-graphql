"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";

export async function toggleAllowPurchaseStores(enabled: boolean) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Not authorized." };

  const adminClient = createAdminClient();
  await adminClient
    .from("app_settings")
    .upsert({ key: "allow_purchase_stores", value: enabled ? "true" : "false" });

  revalidatePath("/admin/settings");
  revalidatePath("/signup");
}
