"use client";

import { useActionState, useState } from "react";
import type { CategoryActionState } from "./actions";
import type { CategoryNode } from "@/lib/categories";
import { useActionToast } from "@/lib/toast/useActionToast";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CategoryFormProps = {
  action: (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  parentOptions: CategoryNode[];
};

export function CategoryForm({ action, parentOptions }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useActionToast(state, "Category saved.");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Category name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="parent_id" className="text-sm font-medium">
          Parent category
        </label>
        <select
          id="parent_id"
          name="parent_id"
          defaultValue=""
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          <option value="">None (top-level category)</option>
          {parentOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {"— ".repeat(category.depth)}
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add category"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
