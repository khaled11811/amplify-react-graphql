"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateAboutContent } from "../actions";

export function AboutSection({
  aboutPageContent,
  lang,
}: {
  aboutPageContent: string | null;
  lang: Lang;
}) {
  const [state, formAction, pending] = useActionState(updateAboutContent, undefined);
  useActionToast(state, t(lang, "about_page_save_btn"));

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="about_page_content" className="text-sm font-medium text-stone-900">
          {t(lang, "about_page_label")}
        </label>
        <p className="mt-0.5 text-xs text-stone-500">{t(lang, "about_page_desc")}</p>
      </div>
      <textarea
        id="about_page_content"
        name="about_page_content"
        rows={6}
        maxLength={2000}
        defaultValue={aboutPageContent ?? ""}
        placeholder={t(lang, "about_page_placeholder")}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "saving_btn") : t(lang, "about_page_save_btn")}
      </button>
    </form>
  );
}
