"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { t, type Lang } from "@/lib/i18n/translations";
import { useActionToast } from "@/lib/toast/useActionToast";
import { updateCategory } from "./actions";

export function EditCategoryModal({
  storeId,
  categoryId,
  currentName,
  lang = "en",
}: {
  storeId: string;
  categoryId: string;
  currentName: string;
  lang?: Lang;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateCategory.bind(null, storeId, categoryId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);
  useActionToast(state, t(lang, "toast_category_updated"));
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on successful save: submitted + not pending + no error
  useEffect(() => {
    if (submittedRef.current && !pending && !state?.error) {
      setOpen(false);
      submittedRef.current = false;
    }
  }, [pending, state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
      >
        {t(lang, "edit_btn")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <h2 className="text-base font-semibold text-stone-900">
              {t(lang, "edit_category_heading")}
            </h2>

            <form
              action={(formData) => {
                submittedRef.current = true;
                formAction(formData);
              }}
              className="mt-4 flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor={`cat-name-${categoryId}`} className="text-sm font-medium text-stone-700">
                  {t(lang, "col_name")}
                </label>
                <input
                  ref={inputRef}
                  id={`cat-name-${categoryId}`}
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  defaultValue={currentName}
                  className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-stone-900"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
                >
                  {t(lang, "cancel_btn")}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {pending ? t(lang, "saving_btn") : t(lang, "save_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
