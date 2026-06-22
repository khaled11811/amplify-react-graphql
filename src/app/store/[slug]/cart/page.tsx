import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { t, type Lang } from "@/lib/i18n/translations";
import { CartView } from "./CartView";

export default async function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";
  if (store.store_type === "display_shop") redirect(`/store/${slug}`);

  return (
    <div className="max-w-2xl">
      <Link href={`/store/${slug}`} className="text-sm text-stone-500 hover:text-stone-900">
        {t(lang, "back_to_store_prefix")} {store.name}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">{t(lang, "your_cart_heading")}</h1>
      <div className="mt-6">
        <CartView storeSlug={slug} storeCurrency={store.currency} lang={lang} />
      </div>
    </div>
  );
}
