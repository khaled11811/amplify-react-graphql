import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { ClearCart } from "./ClearCart";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  return (
    <div className="max-w-lg">
      <ClearCart storeSlug={slug} />
      <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
      <p className="mt-2 text-stone-600">
        Your payment was successful. {store.name} will process your order
        shortly. A confirmation has been sent to your email.
      </p>
      <Link
        href={`/store/${slug}`}
        className="mt-6 inline-block text-sm text-stone-900 underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
