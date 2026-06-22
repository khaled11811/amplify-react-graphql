export function formatPrice(cents: number, _currency?: string): string {
  return `AED ${(cents / 100).toFixed(2)}`;
}
