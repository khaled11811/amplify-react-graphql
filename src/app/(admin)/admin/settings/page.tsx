import { createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const lang = await getLang();
  const adminClient = createAdminClient();

  const { data: setting } = await adminClient
    .from("app_settings")
    .select("value")
    .eq("key", "allow_purchase_stores")
    .single();

  const allowPurchaseStores = setting?.value !== "false";

  return <SettingsClient lang={lang} allowPurchaseStores={allowPurchaseStores} />;
}
