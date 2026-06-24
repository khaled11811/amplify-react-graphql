import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { stripe } from "@/lib/stripe/server";
import { formatPrice, formatDateTime } from "@/lib/format";
import { ConnectOnboardingBanner } from "@/components/ConnectOnboardingBanner";
import { ManageOnStripeButton } from "./ManageOnStripeButton";

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
  const { data: store } = await supabase
    .from("stores")
    .select("stripe_account_id, stripe_charges_enabled, currency")
    .eq("id", profile.store_id)
    .single();

  const storeCurrency = store?.currency ?? "usd";

  if (!store?.stripe_charges_enabled || !store.stripe_account_id) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "payouts_heading")}</h1>
        <div className="mt-6">
          <ConnectOnboardingBanner lang={lang} />
        </div>
      </div>
    );
  }

  const [balance, stripePayouts, { data: legacyPayouts }] = await Promise.all([
    stripe.balance.retrieve({}, { stripeAccount: store.stripe_account_id }),
    stripe.payouts.list({ limit: 10 }, { stripeAccount: store.stripe_account_id }),
    supabase
      .from("payouts")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("requested_at", { ascending: false }),
  ]);

  const available = balance.available.reduce((sum, b) => sum + b.amount, 0);
  const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "payouts_heading")}</h1>
        <ManageOnStripeButton lang={lang} />
      </div>

      <h2 className="mt-6 text-sm font-medium text-stone-900">{t(lang, "live_balance_heading")}</h2>
      <dl className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "available_balance_label")}</dt>
          <dd className="mt-1 text-lg font-semibold">{formatPrice(available, storeCurrency)}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">{t(lang, "pending_balance_label")}</dt>
          <dd className="mt-1 text-lg font-semibold">{formatPrice(pending, storeCurrency)}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-stone-900">{t(lang, "recent_payouts_heading")}</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-2 font-medium">{t(lang, "col_date_requested")}</th>
                <th className="px-4 py-2 font-medium">{t(lang, "col_amount")}</th>
                <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {stripePayouts.data.map((payout) => (
                <tr key={payout.id} className="border-t border-stone-200">
                  <td className="px-4 py-2 text-stone-600">{formatDateTime(new Date(payout.created * 1000).toISOString())}</td>
                  <td className="px-4 py-2 font-medium">{formatPrice(payout.amount, payout.currency)}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stripePayouts.data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                    {t(lang, "no_payouts_retrieved_yet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!!legacyPayouts?.length && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-stone-900">
            {t(lang, "legacy_payouts_heading")}
          </summary>
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
                {legacyPayouts.map((payout) => (
                  <tr key={payout.id} className="border-t border-stone-200">
                    <td className="px-4 py-2 text-stone-600">{formatDateTime(payout.requested_at)}</td>
                    <td className="px-4 py-2 font-medium">{formatPrice(payout.amount, payout.currency)}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[payout.status] ?? "bg-stone-200 text-stone-600"}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-stone-600">
                      {payout.paid_at ? formatDateTime(payout.paid_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
