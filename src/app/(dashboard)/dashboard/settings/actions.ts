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
    footer_text: formData.get("footer_text") || undefined,
    theme: formData.get("theme"),
    header_color: formData.get("header_color") || undefined,
    font: formData.get("font"),
    background_type: formData.get("background_type"),
    background_color: formData.get("background_color") || undefined,
    background_preset: formData.get("background_preset") || undefined,
    button_shape: formData.get("button_shape") || undefined,
    product_card_style: formData.get("product_card_style") || undefined,
    products_per_row: formData.get("products_per_row") || undefined,
    announcement_text: formData.get("announcement_text") || undefined,
    announcement_active: formData.get("announcement_active") === "true",
    product_sort_default: formData.get("product_sort_default") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      description: parsed.data.description ?? null,
      footer_text: parsed.data.footer_text,
      theme: parsed.data.theme,
      header_color: parsed.data.header_color,
      font: parsed.data.font,
      background_type: parsed.data.background_type,
      background_value: parsed.data.background_value,
      button_shape: parsed.data.button_shape,
      product_card_style: parsed.data.product_card_style,
      products_per_row: parsed.data.products_per_row,
      announcement_text: parsed.data.announcement_text,
      announcement_active: parsed.data.announcement_active,
      product_sort_default: parsed.data.product_sort_default,
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
    fullName: formData.get("fullName") || undefined,
    storeLanguage: formData.get("storeLanguage") || undefined,
    phone_number: formData.get("phone_number") || undefined,
    whatsapp_number: formData.get("whatsapp_number") || undefined,
    instagram: formData.get("instagram") || undefined,
    facebook: formData.get("facebook") || undefined,
    tiktok: formData.get("tiktok") || undefined,
    x_twitter: formData.get("x_twitter") || undefined,
    business_email: formData.get("business_email") || undefined,
    website: formData.get("website") || undefined,
    newPassword: formData.get("newPassword") || undefined,
    confirmPassword: formData.get("confirmPassword") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, fullName, storeLanguage, newPassword, confirmPassword, ...contactFields } = parsed.data;

  if (newPassword && newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const contactInfo = Object.fromEntries(
    Object.entries(contactFields).filter(([, value]) => value)
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name,
      contact_info: contactInfo,
      ...(storeLanguage !== undefined ? { store_language: storeLanguage } : {}),
    })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  if (fullName !== undefined) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null })
      .eq("id", profile.id);
    if (profileError) return { error: profileError.message };
  }

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

export async function updateLicenseInfo(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const tlNumber = (formData.get("trade_license_number") as string | null)?.trim() || null;
  const tlExpiry = (formData.get("trade_license_expiry") as string | null)?.trim() || null;
  const taxNumber = (formData.get("tax_registration_number") as string | null)?.trim() || null;

  if (!tlNumber) return { error: "TL/CR number is required." };
  if (!tlExpiry) return { error: "TL/CR expiry date is required." };
  if (!taxNumber) return { error: "Tax registration number is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      trade_license_number: tlNumber,
      trade_license_expiry: tlExpiry,
      tax_registration_number: taxNumber,
    })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings/general");
  revalidatePath(`/store`, "layout");
  return { success: true };
}

export async function updateAboutContent(
  _state: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const content = (formData.get("about_page_content") as string | null)?.trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({ about_page_content: content })
    .eq("id", profile.store_id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings/general");
  revalidatePath("/store", "layout");
  return { success: true };
}

export async function updateFaviconUrl(url: string | null) {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) return;

  const supabase = await createClient();
  await supabase
    .from("stores")
    .update({ favicon_url: url })
    .eq("id", profile.store_id);

  revalidatePath("/store", "layout");
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
