"use client";

import { useTransition, useActionState } from "react";
import { toggleAllowPurchaseStores } from "./actions";
import { updateSubscriptionFee } from "../stores/actions";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";

const copy = {
  en: {
    heading: "Platform Settings",
    purchase_stores_label: "Allow Purchase Stores",
    purchase_stores_desc: "When enabled, users signing up can choose to create a Purchase store (with cart & online payment). When disabled, only Display stores are available on the signup page.",
    enabled_badge: "Enabled",
    disabled_badge: "Disabled",
    fee_heading: "Subscription Fee",
    fee_desc: "One-time fee charged to store managers when signing up. Currently this is informational only — signup is free.",
    fee_label: "Fee amount (AED)",
  },
  ar: {
    heading: "إعدادات المنصة",
    purchase_stores_label: "السماح بمتاجر المبيعات",
    purchase_stores_desc: "عند التفعيل، يمكن للمستخدمين عند التسجيل اختيار إنشاء متجر مبيعات (بسلة تسوق ودفع إلكتروني). عند التعطيل، تتوفر فقط متاجر العرض في صفحة التسجيل.",
    enabled_badge: "مفعّل",
    disabled_badge: "معطّل",
    fee_heading: "رسوم الاشتراك",
    fee_desc: "الرسوم المدفوعة مرة واحدة عند تسجيل مديري المتاجر. حالياً هذا للأغراض المرجعية فقط — التسجيل مجاني.",
    fee_label: "مبلغ الرسوم (AED)",
  },
};

export function SettingsClient({
  lang,
  allowPurchaseStores,
  currentFeeAed,
}: {
  lang: Lang;
  allowPurchaseStores: boolean;
  currentFeeAed: number;
}) {
  const c = copy[lang];
  const [isPending, startTransition] = useTransition();
  const [feeState, feeAction, feePending] = useActionState(updateSubscriptionFee, undefined);
  useActionToast(feeState, t(lang, "fee_saved_toast"));

  const feeErrorMsg = feeState?.error === "fee_zero_warning"
    ? t(lang, "fee_zero_warning")
    : feeState?.error;

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleAllowPurchaseStores(checked);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-stone-900">{c.heading}</h1>

      {/* Purchase stores toggle */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-6 p-5">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-900">{c.purchase_stores_label}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                allowPurchaseStores ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-500"
              }`}>
                {allowPurchaseStores ? c.enabled_badge : c.disabled_badge}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">{c.purchase_stores_desc}</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={allowPurchaseStores}
            disabled={isPending}
            onClick={() => handleToggle(!allowPurchaseStores)}
            className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              allowPurchaseStores ? "bg-teal-600" : "bg-stone-300"
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
              allowPurchaseStores ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      </div>

      {/* Subscription fee */}
      <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="p-5">
          <p className="text-sm font-semibold text-stone-900">{c.fee_heading}</p>
          <p className="mt-1 text-sm text-stone-500">{c.fee_desc}</p>

          <form action={feeAction} className="mt-4 flex items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="fee" className="text-sm font-medium text-stone-700">
                {c.fee_label}
              </label>
              <input
                id="fee"
                name="fee"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={currentFeeAed}
                className="w-36 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={feePending}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {feePending ? t(lang, "saving_btn") : t(lang, "save_btn")}
            </button>
          </form>

          {feeErrorMsg && (
            <p className="mt-2 text-sm text-red-600">{feeErrorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
