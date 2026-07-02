import { createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const lang = await getLang();
  const adminClient = createAdminClient();

  const [{ data: purchaseSetting }, { data: feeSetting }] = await Promise.all([
    adminClient.from("app_settings").select("value").eq("key", "allow_purchase_stores").single(),
    adminClient.from("app_settings").select("value").eq("key", "subscription_fee_aed").single(),
  ]);

  const allowPurchaseStores = purchaseSetting?.value !== "false";
  const currentFeeAed = Number(feeSetting?.value ?? 50);

  return <SettingsClient lang={lang} allowPurchaseStores={allowPurchaseStores} currentFeeAed={currentFeeAed} />;
}
