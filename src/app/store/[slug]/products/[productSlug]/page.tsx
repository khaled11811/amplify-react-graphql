import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlug, getProductBySlug } from "@/lib/data/storefront";
import { t, type Lang } from "@/lib/i18n/translations";
import { AddToCartButton } from "../../AddToCartButton";
import { ProductGallery } from "./ProductGallery";
import { InquiryModal } from "./InquiryModal";
import { formatPrice } from "@/lib/format";
import { StarDisplay } from "@/components/StarDisplay";
import { getContrastTextColor, DEFAULT_THEME_COLOR } from "@/lib/theme";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;

  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";

  const product = await getProductBySlug(store.id, productSlug);
  if (!product) notFound();

  const themeColor = store.theme || DEFAULT_THEME_COLOR;
  const themeText = getContrastTextColor(themeColor);

  return (
    <div className="max-w-2xl">
      {/* Back link — slides in first */}
      <Link
        href={`/store/${slug}`}
        className="inline-block text-sm text-stone-500 transition-colors hover:text-stone-900 animate-slide-in-fade [animation-delay:0s]"
      >
        &larr; {store.name}
      </Link>

      {/* Gallery — slides in slightly after */}
      <div className="animate-slide-in-fade [animation-delay:0.12s]">
        {product.images.length > 0 ? (
          <ProductGallery images={product.images} productName={product.name} />
        ) : (
          <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-xl bg-stone-100 text-sm text-stone-400">
            {t(lang, "no_image_placeholder")}
          </div>
        )}
      </div>

      {/* Info card — slides in last, with theme accent bar on top */}
      <div
        className="mt-4 rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur-sm border-t-4 animate-slide-in-fade [animation-delay:0.24s]"
        style={{ borderColor: themeColor }}
      >
        <h1 className="text-2xl font-semibold leading-snug">{product.name}</h1>

        {(product.avg_rating && product.rating_count > 0) && (
          <div className="mt-1">
            <StarDisplay avgRating={product.avg_rating} ratingCount={product.rating_count} />
          </div>
        )}

        {product.description && (
          <p className="mt-3 text-stone-600 leading-relaxed">{product.description}</p>
        )}

        {/* Price pill + action */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {store.store_type !== "display_shop" && (
            <span
              className="rounded-full px-5 py-2 text-xl font-bold tracking-tight shadow-sm"
              style={{ backgroundColor: themeColor, color: themeText }}
            >
              {formatPrice(product.price, store.currency)}
            </span>
          )}
          {store.store_type === "paid_shop" && <AddToCartButton product={product} lang={lang} />}
        </div>

        {/* Stock indicator */}
        <div className="mt-3 flex items-center gap-2">
          {product.stock > 0 ? (
            <>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm text-stone-500">
                {product.stock} {t(lang, "in_stock_text")}
              </span>
            </>
          ) : (
            <>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-600">
                {t(lang, "out_of_stock_text")}
              </span>
            </>
          )}
        </div>

        {store.store_type === "display_shop" && (
          <div className="mt-4">
            <InquiryModal
              storeSlug={store.slug}
              productId={product.id}
              productName={product.name}
              hasBusinessEmail={!!store.contact_info?.business_email}
              lang={lang}
            />
          </div>
        )}
      </div>
    </div>
  );
}
