"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import {
  storeAppearanceSchema,
  billingInfoSchema,
  storeGeneralSchema,
} from "@/lib/validators/store";

export type SettingsActionState = { error?: string; success?: boolean } | undefined;

export async function updateStoreAppearance(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const parsed = storeAppearanceSchema.safeParse({
    description: formData.get("description") || undefined,
    theme: formData.get("theme"),
    header_color: formData.get("header_color") || undefined,
    font: formData.get("font"),
    background_type: formData.get("background_type"),
    background_color: formData.get("background_color") || undefined,
    background_preset: formData.get("background_preset") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      description: parsed.data.description ?? null,
      theme: parsed.data.theme,
      header_color: parsed.data.header_color,
      font: parsed.data.font,
      background_type: parsed.data.background_type,
      background_value: parsed.data.background_value,
    })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  revalidatePath(`/store`, "layout");
  return { success: true };
}

export async function updateGeneralSettings(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const parsed = storeGeneralSchema.safeParse({
    name: formData.get("name"),
    phone_number: formData.get("phone_number") || undefined,
    whatsapp_number: formData.get("whatsapp_number") || undefined,
    instagram: formData.get("instagram") || undefined,
    facebook: formData.get("facebook") || undefined,
    business_email: formData.get("business_email") || undefined,
    website: formData.get("website") || undefined,
    newPassword: formData.get("newPassword") || undefined,
    confirmPassword: formData.get("confirmPassword") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, newPassword, confirmPassword, ...contactFields } = parsed.data;

  if (newPassword && newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const contactInfo = Object.fromEntries(
    Object.entries(contactFields).filter(([, value]) => value)
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({ name, contact_info: contactInfo })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  if (newPassword) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (passwordError) return { error: passwordError.message };
  }

  revalidatePath("/dashboard/settings/general");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/store", "layout");
  return { success: true };
}

export async function updateBillingInfo(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const parsed = billingInfoSchema.safeParse({
    account_holder: formData.get("account_holder") || undefined,
    bank_name: formData.get("bank_name") || undefined,
    account_number: formData.get("account_number") || undefined,
    routing_number: formData.get("routing_number") || undefined,
    paypal_email: formData.get("paypal_email") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const billingInfo = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value)
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({ billing_info: billingInfo })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings/billing");
  return { success: true };
}
