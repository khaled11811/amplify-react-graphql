"use client";

import { useActionState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { type Lang } from "@/lib/i18n/translations";
import { updateLicenseInfo } from "../actions";
import { LicenseDocUpload } from "./LicenseDocUpload";

const copy = {
  en: {
    heading: "Trade License / Commercial Registration",
    number_label: "TL/CR Number",
    expiry_label: "TL/CR Expiry Date",
    doc_label: "TL/CR Document",
    tax_label: "Tax Registration Number",
    vat_label: "VAT Registration Certificate",
    note: "Fields marked * are mandatory and will appear in your store footer.",
    save: "Save License Info",
    saving: "Saving…",
    toast: "License info saved.",
  },
  ar: {
    heading: "الرخصة التجارية / السجل التجاري",
    number_label: "رقم الرخصة التجارية / السجل التجاري",
    expiry_label: "تاريخ انتهاء الرخصة التجارية",
    doc_label: "مستند الرخصة التجارية",
    tax_label: "رقم التسجيل الضريبي",
    vat_label: "شهادة تسجيل ضريبة القيمة المضافة",
    note: "الحقول المعلّمة بـ * إلزامية وستظهر في تذييل متجرك.",
    save: "حفظ معلومات الترخيص",
    saving: "جارٍ الحفظ…",
    toast: "تم حفظ معلومات الترخيص.",
  },
};

export function LicenseSection({
  storeId,
  lang,
  tradeLicenseNumber,
  tradeLicenseExpiry,
  tradeLicenseDocUrl,
  taxRegistrationNumber,
  vatCertificateUrl,
}: {
  storeId: string;
  lang: Lang;
  tradeLicenseNumber: string | null;
  tradeLicenseExpiry: string | null;
  tradeLicenseDocUrl: string | null;
  taxRegistrationNumber: string | null;
  vatCertificateUrl: string | null;
}) {
  const c = copy[lang];
  const [state, formAction, pending] = useActionState(updateLicenseInfo, undefined);
  useActionToast(state, c.toast);

  const inputClass = "rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-stone-900">{c.heading}</h2>
        <p className="mt-0.5 text-xs text-stone-500">{c.note}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {/* TL/CR Number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="trade_license_number" className="text-sm font-medium text-stone-700">
            {c.number_label} <span className="text-red-500">*</span>
          </label>
          <input
            id="trade_license_number"
            name="trade_license_number"
            type="text"
            required
            defaultValue={tradeLicenseNumber ?? ""}
            className={inputClass}
            dir="ltr"
          />
        </div>

        {/* TL/CR Expiry Date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="trade_license_expiry" className="text-sm font-medium text-stone-700">
            {c.expiry_label} <span className="text-red-500">*</span>
          </label>
          <input
            id="trade_license_expiry"
            name="trade_license_expiry"
            type="date"
            required
            defaultValue={tradeLicenseExpiry ?? ""}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        {/* Tax Registration Number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="tax_registration_number" className="text-sm font-medium text-stone-700">
            {c.tax_label} <span className="text-red-500">*</span>
          </label>
          <input
            id="tax_registration_number"
            name="tax_registration_number"
            type="text"
            required
            defaultValue={taxRegistrationNumber ?? ""}
            className={inputClass}
            dir="ltr"
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {pending ? c.saving : c.save}
        </button>
      </form>

      <hr className="border-stone-200" />

      {/* TL/CR Document upload */}
      <LicenseDocUpload
        storeId={storeId}
        field="trade_license_doc_url"
        currentUrl={tradeLicenseDocUrl}
        label={c.doc_label}
        required
        lang={lang}
      />

      <hr className="border-stone-200" />

      {/* VAT Certificate upload (optional) */}
      <LicenseDocUpload
        storeId={storeId}
        field="vat_certificate_url"
        currentUrl={vatCertificateUrl}
        label={c.vat_label}
        lang={lang}
      />
    </div>
  );
}
