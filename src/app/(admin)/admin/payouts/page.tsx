import { createClient } from "@/lib/supabase/server";
import type { BillingInfo } from "@/types/database.types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-600",
  paid: "bg-green-100 text-green-700",
};

function formatBillingInfo(billingInfo: BillingInfo): string {
  const parts = [
    billingInfo.account_holder,
    billingInfo.bank_name,
    billingInfo.account_number && `acct ${billingInfo.account_number}`,
    billingInfo.routing_number && `routing ${billingInfo.routing_number}`,
    billingInfo.paypal_email && `PayPal: ${billingInfo.paypal_email}`,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "No billing info on file";
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .order("requested_at", { ascending: false });

  const storeIds = [...new Set((payouts ?? []).map((p) => p.store_id))];
  const { data: stores } = storeIds.length
    ? await supabase.from("stores").select("id, name, billing_info").in("id", storeIds)
    : { data: [] };

  const storeById = new Map(stores?.map((s) => [s.id, s]));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Payouts</h1>
      <p className="mt-1 text-sm text-stone-600">
        Retrieval history for every store. Store managers mark their own payouts as paid.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Date requested</th>
              <th className="px-4 py-2 font-medium">Store</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Billing info</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Date paid</th>
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
                    {(payout.amount / 100).toFixed(2)} {payout.currency.toUpperCase()}
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {formatBillingInfo(store?.billing_info ?? {})}
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
                  No payouts requested yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
