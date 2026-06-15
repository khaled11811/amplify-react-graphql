"use client";

import { useActionState } from "react";
import type { BillingInfo } from "@/types/database.types";
import { useActionToast } from "@/lib/toast/useActionToast";
import { updateBillingInfo } from "../actions";

export function BillingForm({ billingInfo }: { billingInfo: BillingInfo }) {
  const [state, formAction, pending] = useActionState(updateBillingInfo, undefined);
  useActionToast(state, "Billing information saved.");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-stone-600">
        Enter the account where your store&apos;s revenue should be paid out. This
        information is only visible to you and the marketplace admin.
      </p>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="account_holder" className="text-sm font-medium">
          Account holder name
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
          Bank name
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
            Account number
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
            Routing number
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
          PayPal email (optional)
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
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
