"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { updateStoreAdmin } from "./actions";

export function EditStoreForm({
  storeId,
  name,
  managerEmail,
  publicEmail,
}: {
  storeId: string;
  name: string;
  managerEmail: string;
  publicEmail: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateStoreAdmin.bind(null, storeId),
    undefined
  );
  useActionToast(state, "Store updated.");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Store name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerEmail" className="text-sm font-medium">
          Store manager email (login)
        </label>
        <input
          id="managerEmail"
          name="managerEmail"
          type="email"
          required
          defaultValue={managerEmail}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium">
          Reset password (optional)
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="text"
          minLength={8}
          autoComplete="off"
          placeholder="Leave blank to keep current password"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
        <p className="text-xs text-stone-500">
          Setting a new password here will sign the store manager out of any active sessions
          using the old password.
        </p>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="publicEmail" className="text-sm font-medium">
          Public contact email (optional)
        </label>
        <input
          id="publicEmail"
          name="publicEmail"
          type="email"
          defaultValue={publicEmail}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
        <p className="text-xs text-stone-500">
          Shown to customers on the store page. Independent from the manager&apos;s login
          email above.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
