"use client";

import { useActionState } from "react";
import type { BillingInfo } from "@/types/database.types";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateBillingInfo } from "../actions";

export function BillingForm({ billingInfo, lang }: { billingInfo: BillingInfo; lang: Lang }) {
  const [state, formAction, pending] = useActionState(updateBillingInfo, undefined);
  useActionToast(state, t(lang, "toast_billing_saved"));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-stone-600">{t(lang, "billing_intro")}</p>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="account_holder" className="text-sm font-medium">
          {t(lang, "account_holder_label")}
        </label>
        <input
          id="account_holder"
          name="account_holder"
          type="text"
          defaultValue={billingInfo.account_holder ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="bank_name" className="text-sm font-medium">
          {t(lang, "bank_name_label")}
        </label>
        <input
          id="bank_name"
          name="bank_name"
          type="text"
          defaultValue={billingInfo.bank_name ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="account_number" className="text-sm font-medium">
            {t(lang, "account_number_label")}
          </label>
          <input
            id="account_number"
            name="account_number"
            type="text"
            defaultValue={billingInfo.account_number ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="routing_number" className="text-sm font-medium">
            {t(lang, "routing_number_label")}
          </label>
          <input
            id="routing_number"
            name="routing_number"
            type="text"
            defaultValue={billingInfo.routing_number ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="paypal_email" className="text-sm font-medium">
          {t(lang, "paypal_email_label")}
        </label>
        <input
          id="paypal_email"
          name="paypal_email"
          type="email"
          defaultValue={billingInfo.paypal_email ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "saving_btn") : t(lang, "save_btn")}
      </button>
    </form>
  );
}
