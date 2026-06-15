import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database.types";
import { updateOrderStatus } from "./actions";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

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
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("store_id", storeId)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <Link href={basePath} className="text-sm text-stone-600 hover:text-stone-900">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-stone-900">Order #{order.id.slice(0, 8)}</h1>
        <form action={updateOrderStatus.bind(null, storeId, order.id)} className="flex items-center gap-2">
          <select
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
            className="rounded-md bg-[var(--store-primary)] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)]"
          >
            Update status
          </button>
        </form>
      </div>

      <p className="mt-1 text-sm text-stone-500">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm text-sm sm:grid-cols-2">
        <div>
          <div className="font-medium text-stone-900">Customer</div>
          <div className="text-stone-600">{order.customer_name}</div>
          <div className="text-stone-600">{order.customer_email}</div>
          {order.customer_phone && <div className="text-stone-600">{order.customer_phone}</div>}
        </div>
        <div>
          <div className="font-medium text-stone-900">Shipping address</div>
          <div className="whitespace-pre-line text-stone-600">
            {order.shipping_address || "—"}
          </div>
        </div>
      </div>

      <h2 className="mt-6 text-lg font-semibold">Items</h2>
      <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Unit price</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">{item.product_name}</td>
                <td className="px-4 py-2 text-stone-600">
                  ${(item.unit_price / 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-stone-600">{item.quantity}</td>
                <td className="px-4 py-2 text-stone-600">
                  ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end text-lg font-semibold">
        Total: ${(order.total_amount / 100).toFixed(2)}
      </div>

      <h2 className="mt-6 text-lg font-semibold">Payments</h2>
      <div className="mt-2 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Payment intent</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((tx) => (
              <tr key={tx.id} className="border-t border-stone-200">
                <td className="px-4 py-2 text-stone-600">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-stone-600">
                  ${(tx.amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
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
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
