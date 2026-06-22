import Image from "next/image";
import { Logo } from "@/components/Logo";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const lang = await getLang();

  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/40" />

      <div className="relative z-10 order-2 flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:order-1 lg:px-16">
        <div className="animate-drop-in-fade mx-auto max-w-xl rounded-2xl bg-stone-100/70 p-4 sm:p-6 lg:mx-0">
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
            {t(lang, "login_welcome_heading")} <span className="text-blue-900">Tajer</span><span className="text-teal-600">Link</span>
          </h1>
          <p className="mt-3 text-sm text-stone-700 sm:mt-4 sm:text-base">{t(lang, "login_intro_1")}</p>
          <p className="mt-3 text-sm text-stone-700 sm:mt-4 sm:text-base">{t(lang, "login_intro_2")}</p>
          <p className="mt-3 text-sm text-stone-700 sm:mt-4 sm:text-base">{t(lang, "login_intro_3")}</p>
          <p className="mt-3 text-sm text-stone-700 sm:mt-4 sm:text-base">{t(lang, "login_intro_4")}</p>
          <p className="mt-4 text-base font-semibold text-stone-900 sm:mt-6 sm:text-lg">{t(lang, "login_tagline")}</p>
        </div>
      </div>

      <div className="relative z-10 order-1 flex flex-1 flex-col items-center justify-center gap-6 p-4 sm:p-6 lg:order-2">
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo imgClassName="h-10 sm:h-12" />
          </div>
          <div className="mt-6">
            <LoginForm lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
