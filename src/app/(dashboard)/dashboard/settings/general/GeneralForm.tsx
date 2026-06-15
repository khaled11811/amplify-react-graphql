"use client";

import { useActionState } from "react";
import type { ContactInfo } from "@/types/database.types";
import { useActionToast } from "@/lib/toast/useActionToast";
import { updateGeneralSettings } from "../actions";

export function GeneralForm({
  name,
  contactInfo,
}: {
  name: string;
  contactInfo: ContactInfo;
}) {
  const [state, formAction, pending] = useActionState(updateGeneralSettings, undefined);
  useActionToast(state, "General settings saved.");

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
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> the information below is shown publicly on your store
          page so customers can contact you. Only fill in what you&apos;re comfortable
          sharing.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone_number" className="text-sm font-medium">
          Phone number
        </label>
        <input
          id="phone_number"
          name="phone_number"
          type="tel"
          placeholder="+1 555 123 4567"
          defaultValue={contactInfo.phone_number ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="whatsapp_number" className="text-sm font-medium">
          WhatsApp number
        </label>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          type="tel"
          placeholder="+1 555 123 4567"
          defaultValue={contactInfo.whatsapp_number ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="business_email" className="text-sm font-medium">
          Business email
        </label>
        <input
          id="business_email"
          name="business_email"
          type="email"
          placeholder="hello@yourstore.com"
          defaultValue={contactInfo.business_email ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="instagram" className="text-sm font-medium">
            Instagram username
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            placeholder="yourstore"
            defaultValue={contactInfo.instagram ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="facebook" className="text-sm font-medium">
            Facebook page
          </label>
          <input
            id="facebook"
            name="facebook"
            type="text"
            placeholder="yourstore"
            defaultValue={contactInfo.facebook ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="website" className="text-sm font-medium">
          Website (optional)
        </label>
        <input
          id="website"
          name="website"
          type="text"
          placeholder="https://yourstore.com"
          defaultValue={contactInfo.website ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Change password</h2>
        <p className="text-xs text-stone-500">
          Leave blank to keep your current password.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            autoComplete="new-password"
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>
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
