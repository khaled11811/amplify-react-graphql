import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import type { BillingInfo } from "@/types/database.types";
import { formatPrice } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-600",
  paid: "bg-green-100 text-green-700",
};

function formatBillingInfo(billingInfo: BillingInfo, noBillingText: string): string {
  const parts = [
    billingInfo.account_holder,
    billingInfo.bank_name,
    billingInfo.account_number && `acct ${billingInfo.account_number}`,
    billingInfo.routing_number && `routing ${billingInfo.routing_number}`,
    billingInfo.paypal_email && `PayPal: ${billingInfo.paypal_email}`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : noBillingText;
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient();
  const lang = await getLang();

  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .order("requested_at", { ascending: false });

  const storeIds = [...new Set((payouts ?? []).map((p) => p.store_id))];
  const { data: stores } = storeIds.length
    ? await supabase.from("stores").select("id, name, billing_info").in("id", storeIds)
    : { data: [] };

  const storeById = new Map(stores?.map((s) => [s.id, s]));
  const noBillingText = t(lang, "no_billing_info");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "payouts_heading")}</h1>
      <p className="mt-1 text-sm text-stone-600">{t(lang, "admin_payouts_desc")}</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_date_requested")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_name")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_amount")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_billing_info")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_date_paid")}</th>
            </tr>
          </thead>
          <tbody>
            {payouts?.map((payout) => {
              const store = storeById.get(payout.store_id);
              return (
                <tr key={payout.id} className="border-t border-stone-200">
                  <td className="px-4 py-2 text-stone-600">
                    {new Date(payout.requested_at).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-2 font-medium">{store?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-stone-600">
                    {formatPrice(payout.amount, payout.currency)}
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {formatBillingInfo(store?.billing_info ?? {}, noBillingText)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[payout.status] ?? "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {payout.paid_at ? new Date(payout.paid_at).toLocaleString("en-US") : "—"}
                  </td>
                </tr>
              );
            })}
            {!payouts?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_payouts_requested_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
