"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import { sendOrderEmail } from "@/lib/email";
import type { OrderStatus } from "@/types/database.types";

const VALID_STATUSES: OrderStatus[] = [
  "paid",
  "shipped",
  "completed",
  "cancelled",
];

export async function updateOrderStatus(storeId: string, orderId: string, formData: FormData) {
  const profile = await getCurrentProfile();
  if (!canAccessStore(profile, storeId)) return;

  const status = formData.get("status");
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as OrderStatus)) {
    return;
  }

  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId)
    .eq("store_id", storeId)
    .select()
    .single();

  if (order) {
    const [{ data: items }, { data: store }] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", orderId),
      supabase.from("stores").select("name, currency").eq("id", storeId).single(),
    ]);

    await sendOrderEmail({
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      storeName: store?.name ?? "The Store",
      orderId: order.id,
      status: order.status,
      totalAmount: order.total_amount,
      currency: store?.currency ?? order.currency,
      items: items ?? [],
    });
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/admin/stores/${storeId}/orders`);
  revalidatePath(`/admin/stores/${storeId}/orders/${orderId}`);
}
