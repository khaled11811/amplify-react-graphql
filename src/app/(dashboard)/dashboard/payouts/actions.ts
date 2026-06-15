"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/auth";
import {
  getStoreRevenueByCurrency,
  getStorePayoutsByCurrency,
  subtractAmounts,
} from "@/lib/data/revenue";

export type PayoutActionState = { error?: string; success?: boolean } | undefined;

export async function retrievePayout(
  _state: PayoutActionState,
  _formData: FormData
): Promise<PayoutActionState> {
  const profile = await getCurrentProfile();
  if (profile?.role !== "store_manager" || !profile.store_id) {
    return { error: "Not authorized." };
  }

  const supabase = await createClient();
  const [revenue, retrieved] = await Promise.all([
    getStoreRevenueByCurrency(supabase, profile.store_id),
    getStorePayoutsByCurrency(supabase, profile.store_id),
  ]);
  const remaining = subtractAmounts(revenue, retrieved);

  const now = new Date().toISOString();
  const rows = [...remaining.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => ({
      store_id: profile.store_id!,
      amount,
      currency,
      status: "paid" as const,
      paid_at: now,
    }));

  if (rows.length === 0) {
    return { error: "No funds available to retrieve." };
  }

  const { error } = await supabase.from("payouts").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/payouts");
  return { success: true };
}
