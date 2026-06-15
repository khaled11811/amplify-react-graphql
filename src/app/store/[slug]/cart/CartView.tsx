"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";

export function CartView({ storeSlug }: { storeSlug: string }) {
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
        <p className="text-stone-600">Your cart is empty.</p>
        <Link
          href={`/store/${storeSlug}`}
          className="mt-4 inline-block text-sm text-stone-900 underline"
        >
          Continue shopping
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
      const message = "Something went wrong. Please try again.";
      setError(message);
      showToast(message, "error");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Product</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Qty</th>
              <th className="px-4 py-2 font-medium">Subtotal</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">{item.name}</td>
                <td className="px-4 py-2 text-stone-600">
                  ${(item.price / 100).toFixed(2)}
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
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end text-lg font-semibold">
        Total: ${(totalAmount / 100).toFixed(2)}
      </div>

      <form onSubmit={handleCheckout} className="mt-8 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Shipping details</h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" className="text-sm font-medium">
            Shipping address (optional)
          </label>
          <textarea
            id="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
        >
          {submitting ? "Redirecting to payment..." : "Checkout"}
        </button>
      </form>
    </div>
  );
}
