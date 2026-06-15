"use client";

import { useActionState, useState } from "react";
import { useActionToast } from "@/lib/toast/useActionToast";
import { createStore } from "../actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewStoreForm() {
  const [state, action, pending] = useActionState(createStore, undefined);
  useActionToast(state, "Store created.");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="storeName" className="text-sm font-medium">
          Store name
        </label>
        <input
          id="storeName"
          name="storeName"
          type="text"
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="storeSlug" className="text-sm font-medium">
          Public URL slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">/store/</span>
          <input
            id="storeSlug"
            name="storeSlug"
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
          />
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerEmail" className="text-sm font-medium">
          Store manager email
        </label>
        <input
          id="managerEmail"
          name="managerEmail"
          type="email"
          required
          autoComplete="off"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="managerPassword" className="text-sm font-medium">
          Store manager temporary password
        </label>
        <input
          id="managerPassword"
          name="managerPassword"
          type="text"
          required
          minLength={8}
          autoComplete="off"
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-amber-700"
        />
        <p className="text-xs text-stone-500">
          Share this with the store manager. They can change it after signing
          in.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create store"}
      </button>
    </form>
  );
}
