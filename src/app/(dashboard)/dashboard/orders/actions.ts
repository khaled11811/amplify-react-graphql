"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canAccessStore, getCurrentProfile } from "@/lib/data/auth";
import type { OrderStatus } from "@/types/database.types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
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
  await supabase
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId)
    .eq("store_id", storeId);

  revalidatePath("/dashboard/orders");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath(`/admin/stores/${storeId}/orders`);
  revalidatePath(`/admin/stores/${storeId}/orders/${orderId}`);
}
