import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { AppHeader } from "@/components/AppHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  const lang = await getLang();

  const links = [
    { href: "/admin", label: t(lang, "nav_overview") },
    { href: "/admin/stores", label: t(lang, "nav_stores") },
    { href: "/admin/payouts", label: t(lang, "nav_payouts") },
    { href: "/admin/settings", label: lang === "ar" ? "الإعدادات" : "Settings" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/dashboard-bg.png')" }}>
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      <AppHeader links={links} email={profile.email} lang={lang} />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
