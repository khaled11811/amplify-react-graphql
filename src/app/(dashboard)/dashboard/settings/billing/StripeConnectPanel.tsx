"use client";

import { useActionState, useState } from "react";
import { t, type Lang, type TranslationKey } from "@/lib/i18n/translations";
import type { StripeOnboardingStatus } from "@/types/database.types";
import { createStripeOnboardingLink, createStripeLoginLink } from "./actions";

const COUNTRIES: { code: string; labelKey: TranslationKey }[] = [
  { code: "AE", labelKey: "country_ae" },
  { code: "SA", labelKey: "country_sa" },
  { code: "US", labelKey: "country_us" },
  { code: "GB", labelKey: "country_gb" },
];

const STATUS_STYLES: Record<StripeOnboardingStatus, string> = {
  not_started: "bg-stone-200 text-stone-600",
  pending: "bg-amber-100 text-amber-700",
  complete: "bg-green-100 text-green-700",
};

export function StripeConnectPanel({
  lang,
  onboardingStatus,
}: {
  lang: Lang;
  onboardingStatus: StripeOnboardingStatus;
}) {
  const [state, formAction, pending] = useActionState(createStripeOnboardingLink, undefined);
  const [managePending, setManagePending] = useState(false);

  const statusLabel =
    onboardingStatus === "complete"
      ? t(lang, "connect_status_complete")
      : onboardingStatus === "pending"
        ? t(lang, "connect_status_pending")
        : t(lang, "connect_status_not_started");

  async function handleManageClick() {
    setManagePending(true);
    const result = await createStripeLoginLink();
    if (result.url) {
      window.location.href = result.url;
    } else {
      setManagePending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-stone-600">{t(lang, "connect_intro")}</p>

      <div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[onboardingStatus]}`}>
          {statusLabel}
        </span>
      </div>

      {onboardingStatus === "complete" ? (
        <button
          type="button"
          onClick={handleManageClick}
          disabled={managePending}
          className="self-start rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
        >
          {t(lang, "connect_manage_link")}
        </button>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="country" className="text-sm font-medium">
              {t(lang, "connect_country_label")}
            </label>
            <select
              id="country"
              name="country"
              defaultValue="AE"
              className="w-full max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {t(lang, c.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{t(lang, state.error as TranslationKey)}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {pending ? t(lang, "connect_redirecting_btn") : t(lang, "connect_btn")}
          </button>
        </form>
      )}
    </div>
  );
}
