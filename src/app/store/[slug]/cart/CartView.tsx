"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import { formatPrice } from "@/lib/format";
import { t, type Lang } from "@/lib/i18n/translations";

export function CartView({ storeSlug, storeCurrency, lang }: { storeSlug: string; storeCurrency: string; lang: Lang }) {
  const { items, setQuantity, removeItem, totalAmount } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  if (items.length === 0) {
    return (
      <div>
        <p className="text-stone-600">{t(lang, "cart_empty_msg")}</p>
        <Link
          href={`/store/${storeSlug}`}
          className="mt-4 inline-block text-sm text-stone-900 underline"
        >
          {t(lang, "continue_shopping_link")}
        </Link>
      </div>
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          customer: { name, email, phone, address },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          lang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error ?? "Checkout failed.";
        setError(message);
        showToast(message, "error");
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      const message = t(lang, "something_wrong");
      setError(message);
      showToast(message, "error");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "product_col")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "price_col")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "qty_col")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "subtotal_col")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(item.price, storeCurrency)}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {formatPrice(item.price * item.quantity, storeCurrency)}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    {t(lang, "remove_btn")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end text-lg font-semibold">
        {t(lang, "total_label")} {formatPrice(totalAmount, storeCurrency)}
      </div>

      <hr className="my-6 border-stone-200" />

      <form onSubmit={handleCheckout} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t(lang, "shipping_details_heading")}</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t(lang, "full_name_label")}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            {t(lang, "email_field_label")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            {t(lang, "phone_optional_label")}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-medium">
            {t(lang, "shipping_address_label")}
          </label>
          <textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
          style={{ borderRadius: "var(--store-btn-radius, 0.375rem)" }}
        >
          {submitting ? t(lang, "redirecting_payment_msg") : t(lang, "checkout_btn")}
        </button>
      </form>
    </div>
  );
}
