"use client";

import { useState } from "react";
import Image from "next/image";

type RatingItem = {
  productId: string;
  productName: string;
  imageUrl: string | null;
};

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <span className={(hovered || value) >= star ? "text-amber-400" : "text-stone-300"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function RatingForm({
  token,
  storeName,
  items,
}: {
  token: string;
  storeName: string;
  items: RatingItem[];
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRated = items.every((i) => ratings[i.productId] > 0);

  async function handleSubmit() {
    if (!allRated) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          ratings: items.map((i) => ({ productId: i.productId, rating: ratings[i.productId] })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-stone-900">Thank you for your feedback!</h2>
        <p className="mt-2 text-stone-500">Your rating helps other shoppers at {storeName}.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {items.map((item) => (
        <div key={item.productId} className="flex items-center gap-4 rounded-xl border border-stone-200 p-4">
          {item.imageUrl && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <p className="font-medium text-stone-900 truncate">{item.productName}</p>
            <StarPicker
              value={ratings[item.productId] ?? 0}
              onChange={(v) => setRatings((prev) => ({ ...prev, [item.productId]: v }))}
            />
          </div>
        </div>
      ))}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allRated || submitting}
        className="rounded-md bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit ratings"}
      </button>

      {!allRated && (
        <p className="text-xs text-stone-400 text-center">Please rate all items to continue</p>
      )}
    </div>
  );
}
