"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type ConnectActionState = { error?: string } | undefined;

export async function createStripeOnboardingLink(
  _state: ConnectActionState,
  formData: FormData
): Promise<ConnectActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "connect_not_authorized_error" };
  }

  const country = String(formData.get("country") ?? "").toUpperCase();
  if (!country || country.length !== 2) {
    return { error: "connect_select_country_error" };
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("stripe_account_id")
    .eq("id", profile.store_id)
    .single();

  let accountId = store?.stripe_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country,
      email: profile.email,
      capabilities: { transfers: { requested: true } },
    });
    accountId = account.id;

    await supabase
      .from("stores")
      .update({ stripe_account_id: accountId, stripe_onboarding_status: "pending" })
      .eq("id", profile.store_id);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${SITE_URL}/dashboard/settings/billing?refresh=1`,
    return_url: `${SITE_URL}/dashboard/settings/billing?onboarded=1`,
  });

  redirect(accountLink.url);
}

export async function createStripeLoginLink(): Promise<{ url?: string; error?: string }> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "connect_not_authorized_error" };
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("stripe_account_id")
    .eq("id", profile.store_id)
    .single();

  if (!store?.stripe_account_id) {
    return { error: "connect_no_account_error" };
  }

  const loginLink = await stripe.accounts.createLoginLink(store.stripe_account_id);
  return { url: loginLink.url };
}
