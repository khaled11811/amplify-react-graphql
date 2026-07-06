import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import type { Lang } from "@/lib/i18n/translations";
import { GeneralForm } from "./GeneralForm";
import { LicenseSection } from "./LicenseSection";
import { AboutSection } from "./AboutSection";

export default async function GeneralSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const [supabase, lang] = [await createClient(), await getLang()];
  const [{ data: store }, { data: ownerProfile }] = await Promise.all([
    supabase
      .from("stores")
      .select("name, contact_info, store_language, trade_license_number, trade_license_expiry, trade_license_doc_url, tax_registration_number, vat_certificate_url, about_page_content")
      .eq("id", profile.store_id)
      .single(),
    supabase.from("profiles").select("full_name").eq("id", profile.id).single(),
  ]);

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  const storeLang: Lang = store.store_language === "ar" ? "ar" : "en";

  return (
    <div className="flex flex-col gap-8">
      <GeneralForm
        name={store.name}
        fullName={ownerProfile?.full_name ?? ""}
        contactInfo={store.contact_info ?? {}}
        storeLang={storeLang}
        lang={lang}
      />

      <hr className="border-stone-200" />

      <AboutSection aboutPageContent={store.about_page_content ?? null} lang={lang} />

      <hr className="border-stone-200" />

      <LicenseSection
        storeId={profile.store_id}
        lang={lang}
        tradeLicenseNumber={store.trade_license_number ?? null}
        tradeLicenseExpiry={store.trade_license_expiry ?? null}
        tradeLicenseDocUrl={store.trade_license_doc_url ?? null}
        taxRegistrationNumber={store.tax_registration_number ?? null}
        vatCertificateUrl={store.vat_certificate_url ?? null}
      />
    </div>
  );
}
