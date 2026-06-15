import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { GeneralForm } from "./GeneralForm";

export default async function GeneralSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("name, contact_info")
    .eq("id", profile.store_id)
    .single();

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  return <GeneralForm name={store.name} contactInfo={store.contact_info ?? {}} />;
}
