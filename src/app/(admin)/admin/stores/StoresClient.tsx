"use client";

import { useState } from "react";
import Link from "next/link";
import { t, type Lang } from "@/lib/i18n/translations";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteStore, toggleStoreStatus } from "./actions";

type Store = {
  id: string;
  name: string;
  slug: string;
  store_type: string;
  subscription_type: string;
  status: string;
  owner_id: string;
  deleted_at: string | null;
};

type Filter = "all" | "paid" | "free";
type StatusFilter = "all" | "active" | "suspended" | "deleted";

export function StoresClient({
  stores,
  ownerEmailById,
  lang,
}: {
  stores: Store[];
  ownerEmailById: Map<string, string>;
  lang: Lang;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = stores.filter((s) => {
    if (filter === "paid" && s.subscription_type !== "paid") return false;
    if (filter === "free" && s.subscription_type !== "free") return false;

    if (statusFilter === "deleted") return s.deleted_at !== null;
    if (statusFilter === "active") return s.deleted_at === null && s.status === "active";
    if (statusFilter === "suspended") return s.deleted_at === null && s.status === "suspended";
    return true;
  });

  const filterOptions: { value: Filter; label: string }[] = [
    { value: "all", label: t(lang, "filter_all_stores") },
    { value: "paid", label: t(lang, "filter_paid_stores") },
    { value: "free", label: t(lang, "filter_free_stores") },
  ];

  const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t(lang, "filter_all_statuses") },
    { value: "active", label: t(lang, "store_status_active") },
    { value: "suspended", label: t(lang, "store_status_suspended") },
    { value: "deleted", label: t(lang, "store_status_deleted") },
  ];

  return (
    <>
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 focus:outline-2 focus:outline-stone-900"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {statusFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
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
                    store.deleted_at !== null
                      ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                      : store.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                  }>
                    {store.deleted_at !== null
                      ? t(lang, "store_status_deleted")
                      : store.status === "active"
                        ? t(lang, "store_status_active")
                        : t(lang, "store_status_suspended")}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {store.deleted_at === null && (
                      <>
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
                      </>
                    )}
                    {store.deleted_at === null && (
                      <DeleteButton
                        action={deleteStore.bind(null, store.id)}
                        lang={lang}
                        confirmMessage={t(lang, "delete_store_confirm_msg")}
                      />
                    )}
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
