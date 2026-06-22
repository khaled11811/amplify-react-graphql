"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { LanguageToggle } from "@/components/LanguageToggle";
import { login } from "./actions";

export function LoginForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(login, undefined);
  useActionToast(state);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          {t(lang, "email_label")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          {t(lang, "password_label")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "signing_in_btn") : t(lang, "sign_in_btn")}
      </button>

      <LanguageToggle
        currentLang={lang}
        className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
      />

      <a
        href="/signup"
        className="block rounded-md border border-teal-600 px-4 py-2 text-center text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50"
      >
        {t(lang, "signup_btn")}
      </a>
    </form>
  );
}
