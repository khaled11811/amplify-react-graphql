"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { t, type Lang } from "@/lib/i18n/translations";

export function CartLink({ slug, textColor, lang }: { slug: string; textColor: string; lang: Lang }) {
  const { totalQuantity } = useCart();

  return (
    <Link
      href={`/store/${slug}/cart`}
      className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80"
      style={{ color: textColor }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h2l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L21 6H6" />
      </svg>
      {t(lang, "nav_cart")} {totalQuantity > 0 ? `(${totalQuantity})` : ""}
    </Link>
  );
}
