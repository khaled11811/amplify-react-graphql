import Link from "next/link";
import { t, type Lang } from "@/lib/i18n/translations";

export function ConnectOnboardingBanner({ lang }: { lang: Lang }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span>{t(lang, "connect_banner_text")}</span>
      <Link
        href="/dashboard/settings/billing"
        className="font-medium text-amber-900 underline hover:no-underline"
      >
        {t(lang, "connect_banner_link")}
      </Link>
    </div>
  );
}
