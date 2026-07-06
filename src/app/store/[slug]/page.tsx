import Image from "next/image";
import Link from "next/link";
import {
  getStoreBySlug,
  getStoreCategories,
  getStoreProducts,
} from "@/lib/data/storefront";
import { notFound } from "next/navigation";
import { t, type Lang } from "@/lib/i18n/translations";
import { AddToCartButton } from "./AddToCartButton";
import { CategoryDropdown } from "./CategoryDropdown";
import { formatPrice } from "@/lib/format";
import { StarDisplay } from "@/components/StarDisplay";

const PAGE_SIZE = 30;

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { category, q, page: pageParam, sort: sortParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const storeData = await getStoreBySlug(slug);
  if (!storeData) notFound();
  const store = storeData;

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";
  const sort = sortParam ?? store.product_sort_default ?? "newest";

  const [categories, { products, total }] = await Promise.all([
    getStoreCategories(store.id),
    getStoreProducts(store.id, category, q, page, sort),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildUrl(p: number) {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (q) sp.set("q", q);
    if (sort !== (store.product_sort_default ?? "newest")) sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/store/${slug}${qs ? `?${qs}` : ""}`;
  }

  function buildSortUrl(s: string) {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (q) sp.set("q", q);
    if (s !== (store.product_sort_default ?? "newest")) sp.set("sort", s);
    const qs = sp.toString();
    return `/store/${slug}${qs ? `?${qs}` : ""}`;
  }

  const SORT_OPTIONS = ["newest", "oldest", "price_asc", "price_desc", "name_asc", "name_desc"] as const;
  const sortLabels: Record<string, string> = {
    newest: t(lang, "sort_newest"),
    oldest: t(lang, "sort_oldest"),
    price_asc: t(lang, "sort_price_asc"),
    price_desc: t(lang, "sort_price_desc"),
    name_asc: t(lang, "sort_name_asc"),
    name_desc: t(lang, "sort_name_desc"),
  };

  return (
    <div>
      <div className="animate-slide-in-fade rounded-xl bg-stone-100/60 p-4 sm:p-6">
        {store.logo_url && (
          <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-2xl border border-stone-200 shadow-sm sm:h-40 sm:w-40">
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <h1 className="text-2xl font-semibold">{store.name}</h1>
        {store.description && (
          <p className="mt-1 text-stone-600">{store.description}</p>
        )}
      </div>

      <form method="get" className="mt-4">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="search"
          name="q"
          placeholder={t(lang, "search_products_placeholder")}
          defaultValue={q}
          className="w-full max-w-sm rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </form>

      {categories.length > 0 && (
        <div className="mt-4">
          <CategoryDropdown
            slug={slug}
            categories={categories}
            currentCategory={category}
            currentQ={q}
            lang={lang}
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-stone-500">{t(lang, "sort_label")}:</span>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt}
              href={buildSortUrl(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sort === opt
                  ? "bg-[var(--store-primary)] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {sortLabels[opt]}
            </Link>
          ))}
        </div>
      </div>

      {store.product_card_style === "list" ? (
        <div className="mt-6 flex flex-col gap-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
              <Link href={`/store/${slug}/products/${product.slug}`} className="group shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-stone-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">
                      {t(lang, "no_image_placeholder")}
                    </div>
                  )}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/store/${slug}/products/${product.slug}`}>
                  <h2 className="line-clamp-1 text-sm font-medium hover:underline">{product.name}</h2>
                </Link>
                <StarDisplay avgRating={product.avg_rating} ratingCount={product.rating_count} size="xs" />
                {product.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{product.description}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-sm font-semibold">{formatPrice(product.price, store.currency)}</span>
                {store.store_type === "paid_shop" && <AddToCartButton product={product} lang={lang} />}
              </div>
            </div>
          ))}
          {!products.length && (
            <p className="text-stone-500">
              {q ? `${t(lang, "no_products_matching")} "${q}".` : t(lang, "no_products_available")}
            </p>
          )}
        </div>
      ) : (
        <div
          className={`mt-6 grid grid-cols-2 gap-2 sm:gap-4 ${
            store.products_per_row === 2
              ? "sm:grid-cols-2"
              : store.products_per_row === 4
                ? "sm:grid-cols-3 lg:grid-cols-4"
                : "sm:grid-cols-3"
          }`}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-stone-200 bg-white p-2 shadow-sm sm:p-4"
            >
              <Link href={`/store/${slug}/products/${product.slug}`} className="group">
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone-400">
                      {t(lang, "no_image_placeholder")}
                    </div>
                  )}
                </div>
                <h2 className="mt-2 line-clamp-2 text-xs font-medium hover:underline sm:text-base">{product.name}</h2>
                <StarDisplay avgRating={product.avg_rating} ratingCount={product.rating_count} size="xs" />
              </Link>
              {product.description && (
                <p className="mt-1 line-clamp-2 hidden text-sm text-stone-600 sm:block">
                  {product.description}
                </p>
              )}
              <div className="mt-auto flex flex-col gap-1 pt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-3">
                <span className="text-xs font-semibold sm:text-base">
                  {formatPrice(product.price, store.currency)}
                </span>
                {store.store_type === "paid_shop" && <AddToCartButton product={product} lang={lang} />}
              </div>
            </div>
          ))}
          {!products.length && (
            <p className="text-stone-500">
              {q ? `${t(lang, "no_products_matching")} "${q}".` : t(lang, "no_products_available")}
            </p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <Link
            href={buildUrl(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              page <= 1
                ? "pointer-events-none text-stone-300"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t(lang, "prev_page_btn")}
          </Link>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`min-w-[2.25rem] rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                p === page
                  ? "bg-[var(--store-primary)] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {p}
            </Link>
          ))}

          <Link
            href={buildUrl(page + 1)}
            aria-disabled={page >= totalPages}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              page >= totalPages
                ? "pointer-events-none text-stone-300"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {t(lang, "next_page_btn")}
          </Link>
        </div>
      )}
    </div>
  );
}
