"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import type { Product } from "@/types/database.types";
import { t, type Lang } from "@/lib/i18n/translations";

export function AddToCartButton({ product, lang }: { product: Product; lang: Lang }) {
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
        showToast(t(lang, "added_to_cart_toast").replace("{name}", product.name), "success");
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
      disabled={product.stock <= 0}
      className="rounded-md bg-[var(--store-primary)] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
    >
      {product.stock <= 0
        ? t(lang, "out_of_stock_btn")
        : added
          ? t(lang, "added_to_cart_btn")
          : t(lang, "add_to_cart_btn")}
    </button>
  );
}
