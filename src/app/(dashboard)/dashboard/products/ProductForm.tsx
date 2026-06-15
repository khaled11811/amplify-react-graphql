"use client";

import { useActionState, useState } from "react";
import type { Category, Product } from "@/types/database.types";
import type { ProductActionState } from "./actions";
import { buildCategoryTree, flattenCategoryTree } from "@/lib/categories";
import { useActionToast } from "@/lib/toast/useActionToast";
import { NewProductImages } from "./NewProductImages";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ProductFormProps = {
  categories: Category[];
  product?: Product;
  storeId?: string;
  action: (
    state: ProductActionState,
    formData: FormData
  ) => Promise<ProductActionState>;
};

export function ProductForm({ categories, product, storeId, action }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useActionToast(state, product ? "Product updated." : "Product added.");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [newProductId] = useState(() => crypto.randomUUID());

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {!product && storeId && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Images</span>
            <NewProductImages storeId={storeId} productId={newProductId} />
          </div>

          <hr className="border-stone-200" />
        </>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Product name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

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

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="price" className="text-sm font-medium">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product ? (product.price / 100).toFixed(2) : undefined}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="stock" className="text-sm font-medium">
            Stock
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
            className="w-full min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          />
        </div>
      </div>

      <input type="hidden" name="currency" value="usd" />

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-1">
        <label htmlFor="category_id" className="text-sm font-medium">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={product?.category_id ?? ""}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          <option value="">No category</option>
          {flattenCategoryTree(buildCategoryTree(categories)).map((category) => (
            <option key={category.id} value={category.id}>
              {"— ".repeat(category.depth)}
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-stone-200" />

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product?.is_active ?? true}
        />
        Visible in store
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving..." : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
