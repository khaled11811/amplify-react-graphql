import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const lang = await getLang();

  let isPaidShop = true;
  if (profile?.store_id) {
    const supabase = await createClient();
    const { data: store } = await supabase
      .from("stores")
      .select("store_type")
      .eq("id", profile.store_id)
      .single();
    isPaidShop = store?.store_type !== "display_shop";
  }

  const BASE_TABS = [
    { href: "/dashboard/settings/general", label: t(lang, "tab_general") },
    { href: "/dashboard/settings/appearance", label: t(lang, "tab_appearance") },
  ];
  const BILLING_TAB = { href: "/dashboard/settings/billing", label: t(lang, "tab_billing") };

  const tabs = isPaidShop ? [...BASE_TABS, BILLING_TAB] : BASE_TABS;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "store_settings_heading")}</h1>

      <nav className="mt-4 flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-white hover:text-stone-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
