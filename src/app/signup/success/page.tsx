import Link from "next/link";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { provisionSignup } from "@/app/api/webhooks/stripe/route";

export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const lang = await getLang();

  if (!session_id) {
    return <ErrorView lang={lang} />;
  }

  let storeName = "";
  let storeSlug = "";

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return <ErrorView lang={lang} />;
    }

    const meta = session.metadata ?? {};
    const pendingSignupId = meta.pending_signup_id;

    if (!pendingSignupId) {
      return <ErrorView lang={lang} />;
    }

    const adminClient = createAdminClient();
    const { data: pending } = await adminClient
      .from("pending_signups")
      .select("*")
      .eq("id", pendingSignupId)
      .single();

    if (!pending) {
      return <ErrorView lang={lang} />;
    }

    storeName = pending.store_name;
    storeSlug = pending.store_slug;

    if (!pending.processed_at) {
      await provisionSignup(pending, adminClient);
    }
  } catch (err) {
    console.error("Signup success page error:", err);
    return <ErrorView lang={lang} />;
  }

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6" dir={dir}>
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-stone-900">{t(lang, "signup_success_heading")}</h1>
        <p className="mt-3 text-stone-600">{t(lang, "signup_success_msg")}</p>

        {storeName && (
          <p className="mt-2 text-sm text-stone-500">
            {lang === "ar" ? `متجرك: ${storeName}` : `Store: ${storeName}`}
            {storeSlug && (
              <span className="block text-xs text-stone-400">/store/{storeSlug}</span>
            )}
          </p>
        )}

        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
        >
          {t(lang, "go_to_login_btn")}
        </Link>
      </div>
    </div>
  );
}

function ErrorView({ lang }: { lang: string }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6" dir={dir}>
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg text-center">
        <h1 className="text-xl font-semibold text-stone-900">
          {lang === "ar" ? "حدث خطأ" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-stone-500">
          {lang === "ar"
            ? "لم يتم التحقق من دفعتك. يرجى التواصل معنا."
            : "We could not verify your payment. Please contact support."}
        </p>
        <Link href="/signup" className="mt-4 inline-block text-sm text-teal-600 hover:underline">
          {lang === "ar" ? "العودة والمحاولة مجدداً" : "Go back and try again"}
        </Link>
      </div>
    </div>
  );
}
