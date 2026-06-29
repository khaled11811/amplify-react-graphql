"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

const WarningIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

export function DeleteButton({
  action,
  label,
  lang = "en",
  className = "text-sm text-red-600 hover:text-red-800",
  confirmMessage,
}: {
  action: () => Promise<{ error: string } | undefined | void> | void;
  label?: string;
  lang?: Lang;
  className?: string;
  confirmMessage?: string;
}) {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setOpen(false);
    const result = await action();
    if (result?.error) {
      setErrorMsg(result.error);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label ?? t(lang, "delete_btn")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="inline-flex flex-col items-center rounded-xl bg-white px-8 py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <WarningIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-stone-900 text-center">{t(lang, "delete_confirm_heading")}</h2>
            <p className="mt-1 text-sm text-stone-600 text-center">{confirmMessage ?? t(lang, "delete_confirm_msg")}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                onClick={() => setOpen(false)}
              >
                {t(lang, "cancel_btn")}
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={handleConfirm}
              >
                {t(lang, "delete_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setErrorMsg(null)}
        >
          <div
            className="inline-flex flex-col items-center rounded-xl bg-white px-8 py-6 shadow-xl max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <WarningIcon className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-stone-900 text-center">{t(lang, "cannot_delete_heading")}</h2>
            <p className="mt-1 text-sm text-stone-600 text-center">{errorMsg}</p>
            <button
              type="button"
              className="mt-5 rounded-md bg-stone-800 px-6 py-2 text-sm font-medium text-white hover:bg-stone-700"
              onClick={() => setErrorMsg(null)}
            >
              {t(lang, "ok_btn")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
