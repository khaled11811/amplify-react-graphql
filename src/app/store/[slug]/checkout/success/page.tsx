import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { t, type Lang } from "@/lib/i18n/translations";
import { ClearCart } from "./ClearCart";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";

  return (
    <div className="max-w-lg">
      <ClearCart storeSlug={slug} />
      <h1 className="text-2xl font-semibold">{t(lang, "thank_you_heading")}</h1>
      <p className="mt-2 text-stone-600">
        {t(lang, "order_processing_msg").replace("{store}", store.name)}
      </p>
      <Link
        href={`/store/${slug}`}
        className="mt-6 inline-block text-sm text-stone-900 underline"
      >
        {t(lang, "continue_shopping_success")}
      </Link>
    </div>
  );
}
