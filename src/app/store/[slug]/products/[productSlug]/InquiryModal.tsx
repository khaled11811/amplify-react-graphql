"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

export function InquiryModal({
  storeSlug,
  productId,
  productName,
  hasBusinessEmail,
  lang,
}: {
  storeSlug: string;
  productId: string;
  productName: string;
  hasBusinessEmail: boolean;
  lang: Lang;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleClose() {
    setOpen(false);
    setError(null);
    if (sent) {
      setEmail(""); setPhone(""); setName(""); setSent(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/store/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, productId, customerEmail: email, customerPhone: phone, customerName: name || undefined }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t(lang, "failed_to_send")); setSubmitting(false); return; }
      setSent(true);
    } catch {
      setError(t(lang, "something_wrong"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasBusinessEmail) {
    return (
      <p className="mt-3 text-sm text-stone-500 italic">
        {t(lang, "contact_not_available")}
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)]"
      >
        {t(lang, "enquire_btn")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {sent ? (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--store-primary)]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--store-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-stone-900">{t(lang, "enquiry_sent_heading")}</h2>
                <p className="mt-1 text-sm text-stone-600">{t(lang, "enquiry_sent_msg")}</p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--store-primary-hover)]"
                >
                  {t(lang, "close_btn")}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-stone-900">{t(lang, "enquire_about_heading")}</h2>
                <p className="mt-0.5 text-sm text-stone-500 truncate">{productName}</p>

                <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(lang, "email_required_label")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(lang, "phone_required_label")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">
                      {t(lang, "name_optional_label")} <span className="text-stone-400 text-xs">({lang === "ar" ? "اختياري" : "optional"})</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
                  >
                    {submitting ? t(lang, "sending_btn") : t(lang, "send_enquiry_btn")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
