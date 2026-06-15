import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { BillingForm } from "./BillingForm";

export default async function BillingSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("billing_info")
    .eq("id", profile.store_id)
    .single();

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  return <BillingForm billingInfo={store.billing_info ?? {}} />;
}
