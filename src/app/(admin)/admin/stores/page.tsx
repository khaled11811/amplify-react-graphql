import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { StoresClient } from "./StoresClient";

export default async function AdminStoresPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const lang = await getLang();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, slug, store_type, subscription_type, status, owner_id")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const ownerIds = stores?.map((s) => s.owner_id) ?? [];
  const { data: owners } =
    ownerIds.length > 0
      ? await supabase.from("profiles").select("id, email").in("id", ownerIds)
      : { data: [] };

  const ownerEmailById = new Map(owners?.map((o) => [o.id, o.email]));

  const { data: feeSetting } = await adminClient
    .from("app_settings")
    .select("value")
    .eq("key", "subscription_fee_aed")
    .single();

  const currentFeeAed = Number(feeSetting?.value ?? 50);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "stores_heading")}</h1>
        <Link
          href="/admin/stores/new"
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          {t(lang, "new_store_btn")}
        </Link>
      </div>

      <StoresClient
        stores={(stores ?? []) as {
          id: string;
          name: string;
          slug: string;
          store_type: string;
          subscription_type: string;
          status: string;
          owner_id: string;
        }[]}
        ownerEmailById={ownerEmailById as Map<string, string>}
        lang={lang}
        currentFeeAed={currentFeeAed}
      />
    </div>
  );
}
