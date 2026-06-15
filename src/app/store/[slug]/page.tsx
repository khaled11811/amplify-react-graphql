import Image from "next/image";
import Link from "next/link";
import {
  getStoreBySlug,
  getStoreCategories,
  getStoreProducts,
} from "@/lib/data/storefront";
import { notFound } from "next/navigation";
import { AddToCartButton } from "./AddToCartButton";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { category, q } = await searchParams;

  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const [categories, products] = await Promise.all([
    getStoreCategories(store.id),
    getStoreProducts(store.id, category, q),
  ]);

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
          placeholder="Search products by name..."
          defaultValue={q}
          className="w-full max-w-sm rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </form>

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/store/${slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            className={
              !category
                ? "rounded-full bg-[var(--store-primary)] px-3 py-1 text-xs font-medium text-white"
                : "rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200"
            }
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/store/${slug}?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={
                category === c.slug
                  ? "rounded-full bg-[var(--store-primary)] px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200"
              }
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
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
                    No image
                  </div>
                )}
              </div>
              <h2 className="mt-2 font-medium hover:underline">{product.name}</h2>
            </Link>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                {product.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">
                ${(product.price / 100).toFixed(2)}
              </span>
              <AddToCartButton product={product} />
            </div>
          </div>
        ))}
        {!products.length && (
          <p className="text-stone-500">
            {q ? `No products found matching "${q}".` : "No products available yet."}
          </p>
        )}
      </div>
    </div>
  );
}
