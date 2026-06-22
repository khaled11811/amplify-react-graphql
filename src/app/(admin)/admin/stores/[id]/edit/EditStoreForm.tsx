"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateStoreAdmin } from "./actions";

export function EditStoreForm({
  storeId,
  name,
  managerName,
  managerEmail,
  publicEmail,
  lang,
}: {
  storeId: string;
  name: string;
  managerName: string;
  managerEmail: string;
  publicEmail: string;
  lang: Lang;
}) {
  const [state, formAction, pending] = useActionState(
    updateStoreAdmin.bind(null, storeId),
    undefined
  );
  useActionToast(state, t(lang, "toast_store_updated"));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          {t(lang, "store_name")}
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
        <label htmlFor="managerName" className="text-sm font-medium">
          {t(lang, "manager_name_label")}
        </label>
        <input
          id="managerName"
          name="managerName"
          type="text"
          defaultValue={managerName}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerEmail" className="text-sm font-medium">
          {t(lang, "manager_email_login_label")}
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
          {t(lang, "reset_password_label")}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="text"
          minLength={8}
          autoComplete="off"
          placeholder={lang === "ar" ? "اتركه فارغاً للإبقاء على كلمة المرور الحالية" : "Leave blank to keep current password"}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
        <p className="text-xs text-stone-500">{t(lang, "reset_password_desc")}</p>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="publicEmail" className="text-sm font-medium">
          {t(lang, "public_contact_email_label")}
        </label>
        <input
          id="publicEmail"
          name="publicEmail"
          type="email"
          defaultValue={publicEmail}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
        <p className="text-xs text-stone-500">{t(lang, "public_contact_email_desc")}</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "saving_btn") : t(lang, "save_changes_btn")}
      </button>
    </form>
  );
}
