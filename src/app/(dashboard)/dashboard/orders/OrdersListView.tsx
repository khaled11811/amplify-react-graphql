import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { formatPrice } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-700",
};

export async function OrdersListView({ storeId, basePath }: { storeId: string; basePath: string }) {
  const supabase = await createClient();
  const lang = await getLang();
  const [{ data: orders }, { data: storeData }] = await Promise.all([
    supabase.from("orders").select("*").eq("store_id", storeId).order("created_at", { ascending: false }),
    supabase.from("stores").select("currency").eq("id", storeId).single(),
  ]);
  const storeCurrency = storeData?.currency ?? "usd";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "orders_heading")}</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_date")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_customer")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_total")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-t border-stone-200">
                <td className="px-4 py-2 text-stone-600">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-medium">
                  {order.customer_name}
                  <div className="text-xs text-stone-500">{order.customer_email}</div>
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(order.total_amount, storeCurrency)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[order.status] ?? "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`${basePath}/${order.id}`}
                    className="text-sm text-stone-600 hover:text-stone-900"
                  >
                    {t(lang, "action_view")}
                  </Link>
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_orders_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
