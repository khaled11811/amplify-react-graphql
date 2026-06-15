"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { retrievePayout } from "./actions";

export function RetrievePayoutButton({ canRetrieve }: { canRetrieve: boolean }) {
  const [state, formAction, pending] = useActionState(retrievePayout, undefined);
  useActionToast(state, "Payout retrieved and marked as paid.");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button
        type="submit"
        disabled={pending || !canRetrieve}
        className="self-start rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Retrieving..." : "Retrieve payout"}
      </button>
      {!canRetrieve && !state?.success && (
        <p className="text-sm text-stone-500">No funds available to retrieve right now.</p>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-700">
          Payout retrieved and marked as paid to your billing account.
        </p>
      )}
    </form>
  );
}
