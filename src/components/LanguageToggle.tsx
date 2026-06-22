"use client";

import { useTransition } from "react";
import { setLanguage } from "@/lib/i18n/actions";
import { t, type Lang } from "@/lib/i18n/translations";

export function LanguageToggle({
  currentLang,
  className,
  style,
}: {
  currentLang: Lang;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next: Lang = currentLang === "en" ? "ar" : "en";
    startTransition(async () => {
      await setLanguage(next);
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={className}
      style={style}
    >
      {pending ? "..." : t(currentLang, "lang_toggle")}
    </button>
  );
}
