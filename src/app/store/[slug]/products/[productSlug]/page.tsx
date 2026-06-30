import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlug, getProductBySlug } from "@/lib/data/storefront";
import { t, type Lang } from "@/lib/i18n/translations";
import { AddToCartButton } from "../../AddToCartButton";
import { ProductGallery } from "./ProductGallery";
import { InquiryModal } from "./InquiryModal";
import { formatPrice } from "@/lib/format";
import { StarDisplay } from "@/components/StarDisplay";

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

  return (
    <div className="max-w-2xl">
      <Link href={`/store/${slug}`} className="text-sm text-stone-600 hover:text-stone-900">
        &larr; {store.name}
      </Link>

      {product.images.length > 0 ? (
        <ProductGallery images={product.images} productName={product.name} />
      ) : (
        <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-md bg-stone-100 text-sm text-stone-400">
          {t(lang, "no_image_placeholder")}
        </div>
      )}

      <div className="mt-4 rounded-xl bg-white/80 p-4 shadow-sm backdrop-blur-sm">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="mt-1">
          <StarDisplay avgRating={product.avg_rating} ratingCount={product.rating_count} />
        </div>
        {product.description && (
          <p className="mt-2 text-stone-600">{product.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4">
          <span className="text-2xl font-semibold text-stone-900">
            {formatPrice(product.price, store.currency)}
          </span>
          {store.store_type === "paid_shop" && <AddToCartButton product={product} lang={lang} />}
        </div>

        {product.stock > 0 ? (
          <p className="mt-2 text-sm text-stone-500">{product.stock} {t(lang, "in_stock_text")}</p>
        ) : (
          <p className="mt-2 text-sm text-red-600">{t(lang, "out_of_stock_text")}</p>
        )}

        {store.store_type === "display_shop" && (
          <InquiryModal
            storeSlug={store.slug}
            productId={product.id}
            productName={product.name}
            hasBusinessEmail={!!store.contact_info?.business_email}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
