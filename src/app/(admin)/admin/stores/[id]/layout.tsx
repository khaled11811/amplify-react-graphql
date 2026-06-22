import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStoreAccess } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export default async function AdminStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  const [supabase, lang] = [await createClient(), await getLang()];
  const { data: store } = await supabase.from("stores").select("*").eq("id", id).single();
  if (!store) notFound();

  const baseTabs = [
    { href: `/admin/stores/${id}`, label: t(lang, "tab_overview") },
    { href: `/admin/stores/${id}/products`, label: t(lang, "nav_products") },
    { href: `/admin/stores/${id}/categories`, label: t(lang, "nav_categories") },
    { href: `/admin/stores/${id}/edit`, label: t(lang, "tab_edit") },
  ];

  const paidTabs = [
    { href: `/admin/stores/${id}/orders`, label: t(lang, "nav_orders") },
    { href: `/admin/stores/${id}/transactions`, label: t(lang, "nav_transactions") },
  ];

  const tabs = store.store_type === "paid_shop"
    ? [...baseTabs.slice(0, 3), ...paidTabs, baseTabs[3]]
    : baseTabs;

  return (
    <div>
      <Link href="/admin/stores" className="text-sm text-stone-500 hover:text-stone-900">
        {t(lang, "back_to_stores")}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-stone-900">{store.name}</h1>
        <Link
          href={`/store/${store.slug}`}
          target="_blank"
          className="text-sm text-amber-800 underline hover:text-amber-700"
        >
          /store/{store.slug}
        </Link>
      </div>

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
