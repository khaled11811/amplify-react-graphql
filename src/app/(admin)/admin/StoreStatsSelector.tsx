"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n/translations";

export type StoreStat = {
  id: string;
  name: string;
  storeType: "paid_shop" | "display_shop";
  ownerLabel: string;
  productCount: number;
  categoryCount: number;
  orderCount: number;
  revenue: string;
  lastPurchaseAt: string | null;
  managerLastLoginAt: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US");
}

export function StoreStatsSelector({ stores, lang }: { stores: StoreStat[]; lang: Lang }) {
  const [selectedId, setSelectedId] = useState(stores[0]?.id ?? "");
  const selected = stores.find((store) => store.id === selectedId);
  const isDisplay = selected?.storeType === "display_shop";

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="text-sm text-stone-500">{t(lang, "store_details_heading")}</div>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mt-2 w-full max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} {store.storeType === "display_shop" ? t(lang, "display_type_suffix") : t(lang, "purchase_type_suffix")}
          </option>
        ))}
      </select>

      {selected ? (
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-stone-500">{t(lang, "store_owner_label")}</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.ownerLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">{t(lang, "stat_products")}</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.productCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">{t(lang, "stat_categories")}</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.categoryCount}</dd>
          </div>
          {!isDisplay && (
            <div>
              <dt className="text-sm text-stone-500">{t(lang, "stat_orders")}</dt>
              <dd className="mt-1 font-medium text-stone-900">{selected.orderCount}</dd>
            </div>
          )}
          {!isDisplay && (
            <>
              <div>
                <dt className="text-sm text-stone-500">{t(lang, "stat_revenue")}</dt>
                <dd className="mt-1 font-medium text-stone-900">{selected.revenue}</dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">{t(lang, "last_purchase_label")}</dt>
                <dd className="mt-1 font-medium text-stone-900">
                  {formatDateTime(selected.lastPurchaseAt)}
                </dd>
              </div>
            </>
          )}
          <div>
            <dt className="text-sm text-stone-500">{t(lang, "manager_last_login_label")}</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {formatDateTime(selected.managerLastLoginAt)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-stone-500">{t(lang, "no_stores_label")}</p>
      )}
    </div>
  );
}
