"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import type { Product } from "@/types/database.types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
        });
        showToast(`${product.name} added to cart.`, "success");
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      disabled={product.stock <= 0}
      className="rounded-md bg-[var(--store-primary)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
    >
      {product.stock <= 0 ? "Out of stock" : added ? "Added" : "Add to cart"}
    </button>
  );
}
