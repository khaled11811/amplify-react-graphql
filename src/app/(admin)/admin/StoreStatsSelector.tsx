"use client";

import { useState } from "react";

export type StoreStat = {
  id: string;
  name: string;
  ownerLabel: string;
  productCount: number;
  categoryCount: number;
  revenue: string;
  lastPurchaseAt: string | null;
  managerLastLoginAt: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US");
}

export function StoreStatsSelector({ stores }: { stores: StoreStat[] }) {
  const [selectedId, setSelectedId] = useState(stores[0]?.id ?? "");
  const selected = stores.find((store) => store.id === selectedId);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-stone-500">Store details</div>
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="mt-2 w-full max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      {selected ? (
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-stone-500">Store owner</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.ownerLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Products</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.productCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Categories</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.categoryCount}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Revenue</dt>
            <dd className="mt-1 font-medium text-stone-900">{selected.revenue}</dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Last item purchased</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {formatDateTime(selected.lastPurchaseAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-stone-500">Manager last login</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {formatDateTime(selected.managerLastLoginAt)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-stone-500">No stores yet.</p>
      )}
    </div>
  );
}
