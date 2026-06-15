"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/CartContext";

export function ClearCart({ storeSlug }: { storeSlug: string }) {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [storeSlug, clear]);

  return null;
}
