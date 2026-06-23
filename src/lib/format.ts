export function formatPrice(cents: number, _currency?: string): string {
  return `AED ${(cents / 100).toFixed(2)}`;
}

const STORE_TIME_ZONE = "Asia/Dubai";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { timeZone: STORE_TIME_ZONE });
}
