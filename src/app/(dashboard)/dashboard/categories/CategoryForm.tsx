"use client";

import { useActionState, useState } from "react";
import type { CategoryActionState } from "./actions";
import type { CategoryNode } from "@/lib/categories";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";

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
  lang?: Lang;
};

export function CategoryForm({ action, parentOptions, lang = "en" }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useActionToast(state, t(lang, "toast_category_saved"));
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          {t(lang, "category_name_label")}
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
          {t(lang, "slug_label")}
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
          {t(lang, "parent_category_label")}
        </label>
        <select
          id="parent_id"
          name="parent_id"
          defaultValue=""
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          <option value="">{t(lang, "none_top_level_option")}</option>
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
        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "adding_btn") : t(lang, "add_category_btn")}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
