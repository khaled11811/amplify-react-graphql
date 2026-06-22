import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/translations";
import { GeneralForm } from "./GeneralForm";

export default async function GeneralSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const [supabase, lang] = [await createClient(), await getLang()];
  const [{ data: store }, { data: ownerProfile }] = await Promise.all([
    supabase.from("stores").select("name, contact_info, store_language").eq("id", profile.store_id).single(),
    supabase.from("profiles").select("full_name").eq("id", profile.id).single(),
  ]);

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  const storeLang: Lang = store.store_language === "ar" ? "ar" : "en";

  return (
    <GeneralForm
      name={store.name}
      fullName={ownerProfile?.full_name ?? ""}
      contactInfo={store.contact_info ?? {}}
      storeLang={storeLang}
      lang={lang}
    />
  );
}
