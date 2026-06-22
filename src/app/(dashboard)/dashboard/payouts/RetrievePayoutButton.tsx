"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { useToast } from "@/lib/toast/ToastContext";
import { t, type Lang } from "@/lib/i18n/translations";
import { retrievePayout } from "./actions";

export function RetrievePayoutButton({
  canRetrieve,
  hasBillingInfo,
  lang = "en",
}: {
  canRetrieve: boolean;
  hasBillingInfo: boolean;
  lang?: Lang;
}) {
  const [state, formAction, pending] = useActionState(retrievePayout, undefined);
  const { showToast } = useToast();
  useActionToast(state, t(lang, "toast_payout_retrieved"));

  function handleClick() {
    if (!hasBillingInfo) {
      showToast(t(lang, "billing_required_error"), "error");
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending || !canRetrieve}
        onClick={handleClick}
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "retrieving_btn") : t(lang, "retrieve_payout_btn")}
      </button>
      {!canRetrieve && !state?.success && (
        <p className="text-sm text-stone-500">{t(lang, "no_funds_msg")}</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-600">{t(lang, state.error as Parameters<typeof t>[1])}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700">{t(lang, "payout_success_msg")}</p>
      )}
    </form>
  );
}
