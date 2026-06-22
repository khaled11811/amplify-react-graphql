"use client";

import { useActionState, useState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { createStore } from "../actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewStoreForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(createStore, undefined);
  useActionToast(state, t(lang, "toast_store_created"));
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="storeName" className="text-sm font-medium">
          {t(lang, "store_name")}
        </label>
        <input
          id="storeName"
          name="storeName"
          type="text"
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="storeSlug" className="text-sm font-medium">
          {t(lang, "public_url_slug")}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">/store/</span>
          <input
            id="storeSlug"
            name="storeSlug"
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
          />
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "store_type_label")}</span>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
          <input type="radio" name="storeType" value="paid_shop" defaultChecked className="mt-0.5 accent-teal-600" />
          <div>
            <div className="text-sm font-medium">{t(lang, "purchase_shop_name")}</div>
            <div className="text-xs text-stone-500">{t(lang, "purchase_shop_desc")}</div>
          </div>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
          <input type="radio" name="storeType" value="display_shop" className="mt-0.5 accent-teal-600" />
          <div>
            <div className="text-sm font-medium">{t(lang, "display_shop_name")}</div>
            <div className="text-xs text-stone-500">{t(lang, "display_shop_desc")}</div>
          </div>
        </label>
        <p className="text-xs text-stone-400">{t(lang, "store_type_note")}</p>
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
          autoComplete="off"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerEmail" className="text-sm font-medium">
          {t(lang, "manager_email_label")}
        </label>
        <input
          id="managerEmail"
          name="managerEmail"
          type="email"
          required
          autoComplete="off"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerPassword" className="text-sm font-medium">
          {t(lang, "manager_temp_password_label")}
        </label>
        <div className="relative">
          <input
            id="managerPassword"
            name="managerPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="off"
            className="w-full rounded-md border border-stone-300 px-3 py-2 pr-10 text-sm focus:outline-2 focus:outline-amber-700"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-stone-500">{t(lang, "share_password_hint")}</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "creating_store_btn") : t(lang, "create_store_btn")}
      </button>
    </form>
  );
}
