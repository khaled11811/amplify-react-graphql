import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/AppHeader";

const BASE_NAV = ["nav_overview", "nav_products", "nav_categories", "nav_settings"] as const;
const BASE_HREFS = ["/dashboard", "/dashboard/products", "/dashboard/categories", "/dashboard/settings"];
const PAID_NAV = ["nav_orders", "nav_transactions", "nav_payouts"] as const;
const PAID_HREFS = ["/dashboard/orders", "/dashboard/transactions", "/dashboard/payouts"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "store_manager") redirect("/admin");

  const lang = await getLang();

  let isPaidShop = true;
  if (profile.store_id) {
    const supabase = await createClient();
    const { data: store } = await supabase
      .from("stores")
      .select("store_type")
      .eq("id", profile.store_id)
      .single();
    isPaidShop = store?.store_type !== "display_shop";
  }

  const baseLinks = BASE_NAV.map((key, i) => ({ href: BASE_HREFS[i], label: t(lang, key) }));
  const paidLinks = PAID_NAV.map((key, i) => ({ href: PAID_HREFS[i], label: t(lang, key) }));

  const links = isPaidShop
    ? [...baseLinks.slice(0, 3), ...paidLinks, baseLinks[3]]
    : baseLinks;

  return (
    <div className="relative flex min-h-screen flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/dashboard-bg.png')" }}>
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      <AppHeader links={links} email={profile.email} lang={lang} />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
