import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { formatPrice, formatDateTime } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-stone-200 text-stone-600",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-amber-100 text-amber-700",
};

export async function TransactionsListView({
  storeId,
  ordersBasePath,
}: {
  storeId: string;
  ordersBasePath: string;
}) {
  const supabase = await createClient();
  const lang = await getLang();
  const [{ data: transactions }, { data: storeData }] = await Promise.all([
    supabase.from("transactions").select("*").eq("store_id", storeId).order("created_at", { ascending: false }),
    supabase.from("stores").select("currency").eq("id", storeId).single(),
  ]);
  const storeCurrency = storeData?.currency ?? "usd";

  const orderIds = [...new Set((transactions ?? []).map((tx) => tx.order_id))];
  const { data: orders } = orderIds.length
    ? await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .in("id", orderIds)
    : { data: [] };

  const orderById = new Map(orders?.map((o) => [o.id, o]));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "transactions_heading")}</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_date")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_customer")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_amount")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_method")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx) => {
              const order = orderById.get(tx.order_id);
              return (
                <tr key={tx.id} className="border-t border-stone-200">
                  <td className="px-4 py-2 text-stone-600">
                    {formatDateTime(tx.created_at)}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {order?.customer_name ?? "—"}
                    <div className="text-xs text-stone-500">{order?.customer_email}</div>
                  </td>
                  <td className="px-4 py-2 text-stone-600">
                    {formatPrice(tx.amount, storeCurrency)}
                  </td>
                  <td className="px-4 py-2 text-stone-600">{tx.payment_method ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[tx.status] ?? "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`${ordersBasePath}/${tx.order_id}`}
                      className="text-sm text-stone-600 hover:text-stone-900"
                    >
                      {t(lang, "view_order_link")}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!transactions?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_transactions_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
