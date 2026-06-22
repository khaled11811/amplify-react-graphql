import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrderStatus } from "@/types/database.types";
import { formatPrice } from "@/lib/format";

const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "completed"];

export type AmountsByCurrency = Map<string, number>;

function addAmounts(rows: { amount: number; currency: string }[]): AmountsByCurrency {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.currency, (map.get(row.currency) ?? 0) + row.amount);
  }
  return map;
}

export async function getStoreRevenueByCurrency(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<AmountsByCurrency> {
  const { data } = await supabase
    .from("orders")
    .select("total_amount, currency")
    .eq("store_id", storeId)
    .in("status", REVENUE_STATUSES);

  return addAmounts((data ?? []).map((row) => ({ amount: row.total_amount, currency: row.currency })));
}

export async function getStorePayoutsByCurrency(
  supabase: SupabaseClient<Database>,
  storeId: string
): Promise<AmountsByCurrency> {
  const { data } = await supabase.from("payouts").select("amount, currency").eq("store_id", storeId);

  return addAmounts(data ?? []);
}

export function formatAmounts(amounts: AmountsByCurrency): string {
  if (amounts.size === 0) return formatPrice(0, "usd");
  return [...amounts.entries()]
    .map(([currency, amount]) => formatPrice(amount, currency))
    .join(", ");
}

export function sumAmounts(amounts: AmountsByCurrency): number {
  let total = 0;
  for (const amount of amounts.values()) total += amount;
  return total;
}

export function subtractAmounts(a: AmountsByCurrency, b: AmountsByCurrency): AmountsByCurrency {
  const result = new Map<string, number>();
  for (const [currency, amount] of a) {
    result.set(currency, amount - (b.get(currency) ?? 0));
  }
  return result;
}
