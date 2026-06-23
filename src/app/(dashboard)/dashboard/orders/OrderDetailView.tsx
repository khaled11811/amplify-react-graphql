import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import type { OrderStatus } from "@/types/database.types";
import { updateOrderStatus } from "./actions";
import { formatPrice, formatDateTime } from "@/lib/format";

const STATUS_OPTIONS: OrderStatus[] = ["paid", "shipped", "completed", "cancelled"];

export async function OrderDetailView({
  storeId,
  basePath,
  orderId,
}: {
  storeId: string;
  basePath: string;
  orderId: string;
}) {
  const supabase = await createClient();
  const lang = await getLang();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("store_id", storeId)
    .single();

  if (!order) notFound();

  const [{ data: items }, { data: transactions }, { data: storeData }] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", order.id),
    supabase.from("transactions").select("*").eq("order_id", order.id).order("created_at", { ascending: false }),
    supabase.from("stores").select("currency").eq("id", storeId).single(),
  ]);
  const storeCurrency = storeData?.currency ?? "usd";

  return (
    <div className="max-w-2xl">
      <Link href={basePath} className="text-sm text-stone-600 hover:text-stone-900">
        {t(lang, "back_to_orders")}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-900">Order #{order.id.slice(0, 8)}</h1>
        <form action={updateOrderStatus.bind(null, storeId, order.id)} className="flex items-center gap-2">
          <select
            key={order.status}
            name="status"
            defaultValue={order.status}
            className="rounded-md border border-stone-300 px-2 py-1 text-sm"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            {t(lang, "update_status_btn")}
          </button>
        </form>
      </div>

      <p className="mt-1 text-sm text-stone-500">
        {t(lang, "placed_label")} {formatDateTime(order.created_at)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-sm sm:grid-cols-2">
        <div>
          <div className="font-medium text-stone-900">{t(lang, "customer_section")}</div>
          <div className="text-stone-600">{order.customer_name}</div>
          <div className="text-stone-600">{order.customer_email}</div>
          {order.customer_phone && <div className="text-stone-600">{order.customer_phone}</div>}
        </div>
        <div>
          <div className="font-medium text-stone-900">{t(lang, "shipping_address_section")}</div>
          <div className="whitespace-pre-line text-stone-600">
            {order.shipping_address || "—"}
          </div>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold">{t(lang, "items_heading")}</h2>
      <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_product")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_unit_price")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "qty_col")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "subtotal_col")}</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">{item.product_name}</td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(item.unit_price, storeCurrency)}
                </td>
                <td className="px-4 py-2 text-stone-600">{item.quantity}</td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(item.unit_price * item.quantity, storeCurrency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end text-lg font-semibold">
        {t(lang, "total_prefix")} {formatPrice(order.total_amount, storeCurrency)}
      </div>

      <h2 className="mt-6 text-lg font-semibold">{t(lang, "payments_heading")}</h2>
      <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_date")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_amount")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_method")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium">Payment intent</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx) => (
              <tr key={tx.id} className="border-t border-stone-200">
                <td className="px-4 py-2 text-stone-600">
                  {formatDateTime(tx.created_at)}
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(tx.amount, storeCurrency)}
                </td>
                <td className="px-4 py-2 text-stone-600">{tx.payment_method ?? "—"}</td>
                <td className="px-4 py-2 text-stone-600">{tx.status}</td>
                <td className="px-4 py-2 text-xs text-stone-500">
                  {tx.stripe_payment_intent_id}
                </td>
              </tr>
            ))}
            {!transactions?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_payments_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
