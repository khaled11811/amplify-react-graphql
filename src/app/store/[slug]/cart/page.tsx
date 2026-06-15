import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { CartView } from "./CartView";

export default async function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-stone-900">Your cart</h1>
      <div className="mt-6">
        <CartView storeSlug={slug} />
      </div>
    </div>
  );
}
