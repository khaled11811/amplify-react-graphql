import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { t, type Lang } from "@/lib/i18n/translations";

export default async function AboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store || !store.about_page_content) notFound();

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">{t(lang, "about_page_heading")}</h1>
      <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">{store.about_page_content}</div>
    </div>
  );
}
