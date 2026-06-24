"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";
import { createStripeLoginLink } from "../settings/billing/actions";

export function ManageOnStripeButton({ lang }: { lang: Lang }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await createStripeLoginLink();
    if (result.url) {
      window.location.href = result.url;
    } else {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
    >
      {t(lang, "view_stripe_dashboard_link")}
    </button>
  );
}
