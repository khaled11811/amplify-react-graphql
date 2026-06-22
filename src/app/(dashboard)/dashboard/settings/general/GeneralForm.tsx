"use client";

import { useActionState } from "react";
import type { ContactInfo } from "@/types/database.types";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateGeneralSettings } from "../actions";

export function GeneralForm({
  name,
  fullName,
  contactInfo,
  storeLang,
  lang,
}: {
  name: string;
  fullName: string;
  contactInfo: ContactInfo;
  storeLang: Lang;
  lang: Lang;
}) {
  const [state, formAction, pending] = useActionState(updateGeneralSettings, undefined);
  useActionToast(state, t(lang, "toast_general_saved"));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-sm font-medium">
          {t(lang, "your_name_label")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={fullName}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          {t(lang, "store_name_setting")}
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

      <div className="flex flex-col gap-1">
        <label htmlFor="storeLanguage" className="text-sm font-medium">
          {t(lang, "store_language_label")}
        </label>
        <p className="text-xs text-stone-500">{t(lang, "store_language_desc")}</p>
        <select
          id="storeLanguage"
          name="storeLanguage"
          defaultValue={storeLang}
          className="max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          <option value="en">{t(lang, "language_en")}</option>
          <option value="ar">{t(lang, "language_ar")}</option>
        </select>
      </div>

      <hr className="border-stone-200" />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> {t(lang, "contact_info_note")}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone_number" className="text-sm font-medium">
          {t(lang, "phone_number_label")}
        </label>
        <input
          id="phone_number"
          name="phone_number"
          type="tel"
          defaultValue={contactInfo.phone_number ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="whatsapp_number" className="text-sm font-medium">
          {t(lang, "whatsapp_number_label")}
        </label>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          type="tel"
          defaultValue={contactInfo.whatsapp_number ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="business_email" className="text-sm font-medium">
          {t(lang, "business_email_label")}
        </label>
        <input
          id="business_email"
          name="business_email"
          type="email"
          defaultValue={contactInfo.business_email ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="instagram" className="text-sm font-medium">
            {t(lang, "instagram_label")}
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            defaultValue={contactInfo.instagram ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="facebook" className="text-sm font-medium">
            {t(lang, "facebook_label")}
          </label>
          <input
            id="facebook"
            name="facebook"
            type="text"
            defaultValue={contactInfo.facebook ?? ""}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="website" className="text-sm font-medium">
          {t(lang, "website_label")}
        </label>
        <input
          id="website"
          name="website"
          type="text"
          defaultValue={contactInfo.website ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">{t(lang, "change_password_heading")}</h2>
        <p className="text-xs text-stone-500">{t(lang, "leave_blank_password_hint")}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="newPassword" className="text-sm font-medium">
            {t(lang, "new_password_label")}
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
            {t(lang, "confirm_password_label")}
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
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "saving_btn") : t(lang, "save_btn")}
      </button>
    </form>
  );
}
