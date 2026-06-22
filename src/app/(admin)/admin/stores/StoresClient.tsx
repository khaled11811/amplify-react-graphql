"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n/translations";
import { DeleteButton } from "@/components/DeleteButton";
import { useActionToast } from "@/lib/toast/useActionToast";
import { deleteStore, toggleStoreStatus, updateSubscriptionFee } from "./actions";

type Store = {
  id: string;
  name: string;
  slug: string;
  store_type: string;
  subscription_type: string;
  status: string;
  owner_id: string;
};

type Filter = "all" | "paid" | "free";

function SubscriptionFeeModal({
  lang,
  currentFee,
  onClose,
}: {
  lang: Lang;
  currentFee: number;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateSubscriptionFee, undefined);
  useActionToast(state, t(lang, "fee_saved_toast"));

  const errorMsg = state?.error === "fee_zero_warning"
    ? t(lang, "fee_zero_warning")
    : state?.error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <h2 className="text-base font-semibold text-stone-900">{t(lang, "fee_heading")}</h2>

        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="fee" className="text-sm font-medium text-stone-700">
              {t(lang, "fee_label")}
            </label>
            <input
              id="fee"
              name="fee"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={currentFee}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-stone-900"
            />
            <p className="text-xs text-stone-500">{t(lang, "fee_desc")}</p>
          </div>

          {errorMsg && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}

export function StoresClient({
  stores,
  ownerEmailById,
  lang,
  currentFeeAed,
}: {
  stores: Store[];
  ownerEmailById: Map<string, string>;
  lang: Lang;
  currentFeeAed: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [feeModalOpen, setFeeModalOpen] = useState(false);

  const filtered = stores.filter((s) => {
    if (filter === "paid") return s.subscription_type === "paid";
    if (filter === "free") return s.subscription_type === "free";
    return true;
  });

  const filterOptions: { value: Filter; label: string }[] = [
    { value: "all", label: t(lang, "filter_all_stores") },
    { value: "paid", label: t(lang, "filter_paid_stores") },
    { value: "free", label: t(lang, "filter_free_stores") },
  ];

  return (
    <>
      {feeModalOpen && (
        <SubscriptionFeeModal
          lang={lang}
          currentFee={currentFeeAed}
          onClose={() => setFeeModalOpen(false)}
        />
      )}

      <div className="mt-4 flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 focus:outline-2 focus:outline-stone-900"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {filterOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFeeModalOpen(true)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
        >
          {t(lang, "change_fee_btn")}: {currentFeeAed} AED
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_name")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_type")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_subscription")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_public_link")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_manager")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "col_status")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((store) => (
              <tr key={store.id} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">
                  <Link href={`/admin/stores/${store.id}`} className="hover:underline">
                    {store.name}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    store.store_type === "display_shop"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-teal-100 text-teal-700"
                  }`}>
                    {store.store_type === "display_shop"
                      ? t(lang, "store_type_display")
                      : t(lang, "store_type_purchase")}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    store.subscription_type === "paid"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-stone-100 text-stone-600"
                  }`}>
                    {store.subscription_type === "paid"
                      ? t(lang, "subscription_type_paid")
                      : t(lang, "subscription_type_free")}
                  </span>
                </td>
                <td className="px-4 py-2 text-stone-600">
                  <Link
                    href={`/store/${store.slug}`}
                    target="_blank"
                    className="underline hover:text-stone-900"
                  >
                    /store/{store.slug}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {ownerEmailById.get(store.owner_id) ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <span className={
                    store.status === "active"
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                      : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                  }>
                    {store.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/stores/${store.id}/edit`}
                      className="text-sm text-stone-600 hover:text-stone-900"
                    >
                      {t(lang, "action_edit")}
                    </Link>
                    <form action={toggleStoreStatus.bind(null, store.id, store.status)}>
                      <button type="submit" className="text-sm text-stone-600 hover:text-stone-900">
                        {store.status === "active"
                          ? t(lang, "action_suspend")
                          : t(lang, "action_activate")}
                      </button>
                    </form>
                    <DeleteButton action={deleteStore.bind(null, store.id)} lang={lang} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_stores_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
