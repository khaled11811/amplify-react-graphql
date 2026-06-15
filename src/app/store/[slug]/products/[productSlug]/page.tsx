import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlug, getProductBySlug } from "@/lib/data/storefront";
import { AddToCartButton } from "../../AddToCartButton";
import { ProductGallery } from "./ProductGallery";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;

  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const product = await getProductBySlug(store.id, productSlug);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <Link href={`/store/${slug}`} className="text-sm text-stone-600 hover:text-stone-900">
        &larr; Back to {store.name}
      </Link>

      {product.images.length > 0 ? (
        <ProductGallery images={product.images} productName={product.name} />
      ) : (
        <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-md bg-stone-100 text-sm text-stone-400">
          No image
        </div>
      )}

      <h1 className="mt-4 text-2xl font-semibold">{product.name}</h1>
      {product.description && (
        <p className="mt-2 text-stone-600">{product.description}</p>
      )}

      <div className="mt-4 flex items-center gap-4">
        <span className="text-2xl font-semibold text-stone-900">
          ${(product.price / 100).toFixed(2)}
        </span>
        <AddToCartButton product={product} />
      </div>

      {product.stock > 0 ? (
        <p className="mt-2 text-sm text-stone-500">{product.stock} in stock</p>
      ) : (
        <p className="mt-2 text-sm text-red-600">Out of stock</p>
      )}
    </div>
  );
}
