"use client";

import { useTransition } from "react";
import { toggleAllowPurchaseStores } from "./actions";
import { type Lang } from "@/lib/i18n/translations";

const copy = {
  en: {
    heading: "Platform Settings",
    purchase_stores_label: "Allow Purchase Stores",
    purchase_stores_desc: "When enabled, users signing up can choose to create a Purchase store (with cart & online payment). When disabled, only Display stores are available on the signup page.",
    enabled_badge: "Enabled",
    disabled_badge: "Disabled",
    saving: "Saving…",
  },
  ar: {
    heading: "إعدادات المنصة",
    purchase_stores_label: "السماح بمتاجر المبيعات",
    purchase_stores_desc: "عند التفعيل، يمكن للمستخدمين عند التسجيل اختيار إنشاء متجر مبيعات (بسلة تسوق ودفع إلكتروني). عند التعطيل، تتوفر فقط متاجر العرض في صفحة التسجيل.",
    enabled_badge: "مفعّل",
    disabled_badge: "معطّل",
    saving: "جارٍ الحفظ…",
  },
};

export function SettingsClient({
  lang,
  allowPurchaseStores,
}: {
  lang: Lang;
  allowPurchaseStores: boolean;
}) {
  const c = copy[lang];
  const [isPending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleAllowPurchaseStores(checked);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{c.heading}</h1>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-6 p-5">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-900">{c.purchase_stores_label}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                allowPurchaseStores
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-200 text-stone-500"
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
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                allowPurchaseStores ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
