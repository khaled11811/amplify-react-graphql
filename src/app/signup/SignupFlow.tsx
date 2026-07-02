"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n/translations";
import { LanguageToggle } from "@/components/LanguageToggle";
import { TermsContent } from "./TermsContent";

type StoreInfo = {
  storeName: string;
  storeSlug: string;
  storeType: "paid_shop" | "display_shop";
  managerName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Step = 1 | 2 | 3;

function slugify(val: string) {
  return val
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function Stepper({ step, lang }: { step: Step; lang: Lang }) {
  const steps = [
    t(lang, "step_store_info"),
    t(lang, "step_terms"),
    lang === "ar" ? "تأكيد" : "Confirm",
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const num = (i + 1) as Step;
        const active = step === num;
        const done = step > num;
        return (
          <div key={num} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-6 flex-1 ${done ? "bg-teal-500" : "bg-stone-200"}`} />}
            <div className="flex flex-col items-center gap-0.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                done ? "bg-teal-500 text-white" : active ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"
              }`}>
                {done ? "✓" : num}
              </div>
              <span className={`hidden text-[10px] sm:block ${active ? "font-semibold text-stone-900" : "text-stone-400"}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AvailabilityIndicator({ status }: { status: "idle" | "checking" | "available" | "taken" }) {
  if (status === "idle") return null;
  if (status === "checking") return <span className="text-xs text-stone-400">...</span>;
  if (status === "available") return <span className="text-xs text-teal-600 font-medium">✓</span>;
  return <span className="text-xs text-red-600 font-medium">✗</span>;
}

export function SignupFlow({ lang, allowPurchaseStores }: { lang: Lang; allowPurchaseStores: boolean }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [step, setStep] = useState<Step>(1);
  const [info, setInfo] = useState<StoreInfo>({
    storeName: "",
    storeSlug: "",
    storeType: allowPurchaseStores ? "paid_shop" : "display_shop",
    managerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StoreInfo, string>>>({});
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced email check
  useEffect(() => {
    if (!info.email.includes("@")) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    if (emailTimer.current) clearTimeout(emailTimer.current);
    emailTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/signup/check-availability?type=email&value=${encodeURIComponent(info.email)}`);
        const data = await res.json();
        setEmailStatus(data.available ? "available" : "taken");
      } catch {
        setEmailStatus("idle");
      }
    }, 600);
    return () => { if (emailTimer.current) clearTimeout(emailTimer.current); };
  }, [info.email]);

  // Debounced slug check
  useEffect(() => {
    if (info.storeSlug.length < 2) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/signup/check-availability?type=slug&value=${encodeURIComponent(info.storeSlug)}`);
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 600);
    return () => { if (slugTimer.current) clearTimeout(slugTimer.current); };
  }, [info.storeSlug]);

  function handleStoreNameChange(val: string) {
    setInfo((prev) => ({
      ...prev,
      storeName: val,
      storeSlug: prev.storeSlug === slugify(prev.storeName) ? slugify(val) : prev.storeSlug,
    }));
  }

  function validateStep1(): boolean {
    const newErrors: Partial<Record<keyof StoreInfo, string>> = {};

    if (!info.storeName.trim()) newErrors.storeName = lang === "ar" ? "مطلوب" : "Required";
    if (info.storeSlug.length < 2) newErrors.storeSlug = lang === "ar" ? "مطلوب (٢ أحرف على الأقل)" : "Required (min 2 chars)";
    if (!info.email.includes("@")) newErrors.email = lang === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email";
    if (emailStatus === "taken") newErrors.email = t(lang, "email_taken_error");
    if (slugStatus === "taken") newErrors.storeSlug = t(lang, "slug_taken_error");
    if (info.password.length < 8) newErrors.password = t(lang, "password_min_length_error");
    if (info.password !== info.confirmPassword) newErrors.confirmPassword = t(lang, "passwords_no_match");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!termsAccepted) return;
      setStep(3);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/signup/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: info.storeName,
          storeSlug: info.storeSlug,
          storeType: info.storeType,
          managerName: info.managerName || undefined,
          email: info.email,
          password: info.password,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? (lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again."));
        setCreating(false);
        return;
      }
      setSuccess(true);
    } catch {
      setCreateError(lang === "ar" ? "حدث خطأ. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.");
      setCreating(false);
    }
  }

  const inputClass = "rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-teal-600 w-full";
  const labelClass = "text-sm font-medium text-stone-700";
  const errorClass = "text-xs text-red-600";

  // Success screen
  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:p-8" dir={dir}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{t(lang, "signup_success_heading")}</h1>
          <p className="mt-3 text-stone-600">{t(lang, "signup_success_msg")}</p>
          {info.storeName && (
            <p className="mt-2 text-sm text-stone-500">
              {lang === "ar" ? `متجرك: ${info.storeName}` : `Store: ${info.storeName}`}
              <span className="block text-xs text-stone-400">/store/{info.storeSlug}</span>
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

  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white/95 p-5 shadow-lg backdrop-blur-sm sm:p-8" dir={dir}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-bold text-stone-900">{t(lang, "signup_heading")}</h1>
        <p className="text-sm text-stone-500">{t(lang, "signup_sub")}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Stepper step={step} lang={lang} />
      </div>

      <div className="mt-6">
        {/* Step 1: Store info */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Store name */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "store_name")} *</label>
              <input
                type="text"
                value={info.storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                className={inputClass}
                placeholder={lang === "ar" ? "اسم متجرك" : "My Store"}
              />
              {errors.storeName && <span className={errorClass}>{errors.storeName}</span>}
            </div>

            {/* Store URL */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "store_url_label")} *</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-stone-400 whitespace-nowrap">/store/</span>
                <input
                  type="text"
                  value={info.storeSlug}
                  onChange={(e) => setInfo((p) => ({ ...p, storeSlug: slugify(e.target.value) }))}
                  className={inputClass}
                  placeholder="my-store"
                  dir="ltr"
                />
                <AvailabilityIndicator status={slugStatus} />
              </div>
              {errors.storeSlug && <span className={errorClass}>{errors.storeSlug}</span>}
              {slugStatus === "taken" && <span className={errorClass}>{t(lang, "slug_taken_error")}</span>}
              {slugStatus === "available" && <span className="text-xs text-teal-600">{t(lang, "available_label")}</span>}
            </div>

            {/* Store type */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "store_type_label")}</label>
              <div className="flex flex-col gap-2">
                {(["paid_shop", "display_shop"] as const).filter((type) => type !== "paid_shop" || allowPurchaseStores).map((type) => (
                  <label key={type} className="flex cursor-pointer items-start gap-2 rounded-md border border-stone-200 p-3 hover:border-teal-500 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input
                      type="radio"
                      name="storeType"
                      value={type}
                      checked={info.storeType === type}
                      onChange={() => setInfo((p) => ({ ...p, storeType: type }))}
                      className="mt-0.5 accent-teal-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {type === "paid_shop" ? t(lang, "purchase_shop_name") : t(lang, "display_shop_name")}
                        </span>
                        {allowPurchaseStores && (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            type === "paid_shop"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-teal-100 text-teal-700"
                          }`}>
                            {lang === "ar"
                              ? (type === "paid_shop" ? "مدفوع" : "مجاني")
                              : (type === "paid_shop" ? "Paid" : "Free")}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-stone-500">
                        {type === "paid_shop" ? t(lang, "purchase_shop_desc") : t(lang, "display_shop_desc")}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-stone-200" />

            {/* Manager name */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "your_name_label")}</label>
              <input
                type="text"
                value={info.managerName}
                onChange={(e) => setInfo((p) => ({ ...p, managerName: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "email_label")} *</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass}
                  dir="ltr"
                />
                <span className="absolute end-3">
                  <AvailabilityIndicator status={emailStatus} />
                </span>
              </div>
              {errors.email && <span className={errorClass}>{errors.email}</span>}
              {emailStatus === "taken" && !errors.email && <span className={errorClass}>{t(lang, "email_taken_error")}</span>}
              {emailStatus === "available" && <span className="text-xs text-teal-600">{t(lang, "available_label")}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "password_label")} *</label>
              <input
                type="password"
                value={info.password}
                onChange={(e) => setInfo((p) => ({ ...p, password: e.target.value }))}
                className={inputClass}
                dir="ltr"
              />
              {errors.password && <span className={errorClass}>{errors.password}</span>}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1">
              <label className={labelClass}>{t(lang, "confirm_password_signup")} *</label>
              <input
                type="password"
                value={info.confirmPassword}
                onChange={(e) => setInfo((p) => ({ ...p, confirmPassword: e.target.value }))}
                className={inputClass}
                dir="ltr"
              />
              {errors.confirmPassword && <span className={errorClass}>{errors.confirmPassword}</span>}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="mt-2 w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
            >
              {t(lang, "next_btn")}
            </button>

            <a href="/login" className="block text-center text-sm text-stone-500 hover:text-stone-700">
              {lang === "ar" ? "لديك حساب؟ سجّل دخولك" : "Already have an account? Sign in"}
            </a>
          </div>
        )}

        {/* Step 2: Terms */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <TermsContent lang={lang} />

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 accent-teal-600"
              />
              <span className="text-sm text-stone-700">{t(lang, "terms_accept_label")}</span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
              >
                {t(lang, "back_btn")}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!termsAccepted}
                className="flex-1 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-40"
              >
                {t(lang, "accept_terms_btn")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Create */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-stone-900">
                {lang === "ar" ? "ملخص المتجر" : "Store summary"}
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">{t(lang, "store_name")}</span>
                  <span className="font-medium text-stone-900">{info.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{lang === "ar" ? "الرابط" : "URL"}</span>
                  <span className="font-medium text-stone-900 dir-ltr" dir="ltr">/store/{info.storeSlug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t(lang, "store_type_label")}</span>
                  <span className="font-medium text-stone-900">
                    {info.storeType === "paid_shop" ? t(lang, "purchase_shop_name") : t(lang, "display_shop_name")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t(lang, "email_label")}</span>
                  <span className="font-medium text-stone-900 dir-ltr" dir="ltr">{info.email}</span>
                </div>
                <hr className="border-stone-200" />
                <div className="flex justify-between">
                  <span className="text-stone-500">{lang === "ar" ? "رسوم الاشتراك" : "Subscription fee"}</span>
                  <span className="font-semibold text-teal-700">{lang === "ar" ? "مجاني" : "Free"}</span>
                </div>
              </div>
            </div>

            {createError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{createError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={creating}
                className="flex-1 rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-40"
              >
                {t(lang, "back_btn")}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
              >
                {creating
                  ? (lang === "ar" ? "جارٍ الإنشاء…" : "Creating…")
                  : (lang === "ar" ? "إنشاء المتجر" : "Create Store")}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <LanguageToggle
          currentLang={lang}
          className="w-full rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
        />
      </div>
    </div>
  );
}
