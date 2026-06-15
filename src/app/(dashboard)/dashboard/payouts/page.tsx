import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreRevenueByCurrency,
  getStorePayoutsByCurrency,
  subtractAmounts,
  formatAmounts,
} from "@/lib/data/revenue";
import { RetrievePayoutButton } from "./RetrievePayoutButton";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-600",
  paid: "bg-green-100 text-green-700",
};

export default async function PayoutsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const supabase = await createClient();
  const [{ data: store }, revenue, retrieved, { data: payouts }] = await Promise.all([
    supabase.from("stores").select("billing_info").eq("id", profile.store_id).single(),
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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Payouts</h1>

      {!hasBillingInfo && (
        <p className="mt-2 text-sm text-amber-700">
          Add your{" "}
          <Link href="/dashboard/settings/billing" className="underline">
            billing information
          </Link>{" "}
          so the marketplace admin knows where to send your payouts.
        </p>
      )}

      <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Total revenue</dt>
          <dd className="mt-1 text-lg font-semibold">{formatAmounts(revenue)}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Retrieved</dt>
          <dd className="mt-1 text-lg font-semibold">{formatAmounts(retrieved)}</dd>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <dt className="text-sm text-stone-600">Remaining</dt>
          <dd className="mt-1 text-lg font-semibold">{formatAmounts(remaining)}</dd>
        </div>
      </dl>

      <p className="mt-2 text-sm text-stone-600">
        Retrieved funds are sent to the bank account or PayPal email in your billing
        information.
      </p>

      <div className="mt-6">
        <RetrievePayoutButton canRetrieve={canRetrieve} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-stone-900">Retrieval history</h2>
        <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-4 py-2 font-medium">Date requested</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Date paid</th>
              </tr>
            </thead>
            <tbody>
              {payouts?.map((payout) => (
                <tr key={payout.id} className="border-t border-stone-200">
                  <td className="px-4 py-2 text-stone-600">
                    {new Date(payout.requested_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {(payout.amount / 100).toFixed(2)} {payout.currency.toUpperCase()}
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
                    {payout.paid_at ? new Date(payout.paid_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {!payouts?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                    No payouts retrieved yet.
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
