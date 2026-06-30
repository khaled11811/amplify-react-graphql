"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import { sendOrderEmail, sendRatingRequestEmail } from "@/lib/email";
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

    // When order is completed, send rating request email (once per order)
    if (status === "completed" && !order.rating_email_sent_at) {
      const adminClient = createAdminClient();

      // Ensure rating_token exists (backfill if somehow null)
      let token = order.rating_token;
      if (!token) {
        const { data: refreshed } = await adminClient
          .from("orders")
          .update({ rating_token: crypto.randomUUID() })
          .eq("id", orderId)
          .select("rating_token")
          .single();
        token = refreshed?.rating_token ?? null;
      }

      if (token) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        await sendRatingRequestEmail({
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          storeName: store?.name ?? "The Store",
          ratingUrl: `${siteUrl}/rate?token=${token}`,
          items: items ?? [],
        });

        await adminClient
          .from("orders")
          .update({ rating_email_sent_at: new Date().toISOString() })
          .eq("id", orderId);
      }
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/admin/stores/${storeId}/orders`);
  revalidatePath(`/admin/stores/${storeId}/orders/${orderId}`);
}
