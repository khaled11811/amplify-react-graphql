"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartContext";

export function ClearCart({ storeSlug }: { storeSlug: string }) {
  const { clear } = useCart();

  useEffect(() => {
    // Remove from localStorage directly so it can't be restored
    // by CartProvider's load effect regardless of effect ordering
    localStorage.removeItem(`cart:${storeSlug}`);
    clear();
  }, [storeSlug, clear]);

  return null;
}
