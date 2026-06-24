import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { stripe } from "@/lib/stripe/server";
import { StripeConnectPanel } from "./StripeConnectPanel";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string; refresh?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const { onboarded, refresh } = await searchParams;
  const [supabase, lang] = [await createClient(), await getLang()];

  const { data: store } = await supabase
    .from("stores")
    .select("stripe_account_id, stripe_charges_enabled, stripe_onboarding_status")
    .eq("id", profile.store_id)
    .single();

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  if (refresh === "1" && store.stripe_account_id) {
    const accountLink = await stripe.accountLinks.create({
      account: store.stripe_account_id,
      type: "account_onboarding",
      refresh_url: `${SITE_URL}/dashboard/settings/billing?refresh=1`,
      return_url: `${SITE_URL}/dashboard/settings/billing?onboarded=1`,
    });
    redirect(accountLink.url);
  }

  let onboardingStatus = store.stripe_onboarding_status;

  if (onboarded === "1" && store.stripe_account_id) {
    const account = await stripe.accounts.retrieve(store.stripe_account_id);
    const status = account.charges_enabled
      ? "complete"
      : account.details_submitted
        ? "pending"
        : "not_started";

    if (status !== store.stripe_onboarding_status || account.charges_enabled !== store.stripe_charges_enabled) {
      await supabase
        .from("stores")
        .update({ stripe_charges_enabled: account.charges_enabled ?? false, stripe_onboarding_status: status })
        .eq("id", profile.store_id);
    }
    onboardingStatus = status;
  }

  return <StripeConnectPanel lang={lang} onboardingStatus={onboardingStatus} />;
}
