import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import {
  getStoreRevenueByCurrency,
  getStorePayoutsByCurrency,
  subtractAmounts,
  sumAmounts,
} from "@/lib/data/revenue";
import { RetrievePayoutButton } from "./RetrievePayoutButton";
import { formatPrice, formatDateTime } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-600",
  paid: "bg-green-100 text-green-700",
};

export default async function PayoutsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const [supabase, lang] = [await createClient(), await getLang()];
  const [{ data: store }, revenue, retrieved, { data: payouts }] = await Promise.all([
    supabase.from("stores").select("billing_info, currency").eq("id", profile.store_id).single(),
    getStoreRevenueByCurrency(supabase, profile.store_id),
    getStorePayoutsByCurrency(supabase, profile.store_id),
    supabase
      .from("payouts")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("requested_at", { ascending: false }),
  ]);

  const remaining = subtractAmounts(revenue, retrieved);
  const canRetrieve = [...remaining.values()].some((amount) => amount > 0);
  const hasBillingInfo = Object.values(store?.billing_info ?? {}).some((value) => value);
  const storeCurrency = store?.currency ?? "usd";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "payouts_heading")}</h1>

      {!hasBillingInfo && (
        <p className="mt-2 text-sm text-amber-700">
          {t(lang, "billing_info_missing_before")}{" "}
          <Link href="/dashboard/settings/billing" className="underline">
            {t(lang, "billing_info_link_text")}
          </Link>{" "}
          {t(lang, "billing_info_missing_after")}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
          <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "total_revenue_stat")}</dt>
          <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{formatPrice(sumAmounts(revenue), storeCurrency)}</dd>
        </div>
        <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
          <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "retrieved_stat")}</dt>
          <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{formatPrice(sumAmounts(retrieved), storeCurrency)}</dd>
        </div>
        <div className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:bg-teal-600 hover:border-teal-600">
          <dt className="text-sm text-stone-600 transition-colors group-hover:text-white">{t(lang, "remaining_stat")}</dt>
          <dd className="mt-1 text-lg font-semibold transition-colors group-hover:text-white">{formatPrice(sumAmounts(remaining), storeCurrency)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-sm text-stone-600">{t(lang, "retrieved_funds_desc")}</p>

      <div className="mt-6">
        <RetrievePayoutButton canRetrieve={canRetrieve} hasBillingInfo={hasBillingInfo} lang={lang} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-stone-900">{t(lang, "retrieval_history_heading")}</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-2 font-medium">{t(lang, "col_date_requested")}</th>
                <th className="px-4 py-2 font-medium">{t(lang, "col_amount")}</th>
                <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
                <th className="px-4 py-2 font-medium">{t(lang, "col_date_paid")}</th>
              </tr>
            </thead>
            <tbody>
              {payouts?.map((payout) => (
                <tr key={payout.id} className="border-t border-stone-200">
                  <td className="px-4 py-2 text-stone-600">
                    {formatDateTime(payout.requested_at)}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {formatPrice(payout.amount, storeCurrency)}
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
                    {payout.paid_at ? formatDateTime(payout.paid_at) : "—"}
                  </td>
                </tr>
              ))}
              {!payouts?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                    {t(lang, "no_payouts_retrieved_yet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
