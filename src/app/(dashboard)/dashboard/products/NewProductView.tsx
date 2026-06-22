import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { ProductForm } from "./ProductForm";
import { createProduct } from "./actions";

export async function NewProductView({ storeId, basePath }: { storeId: string; basePath: string }) {
  const supabase = await createClient();
  const [{ data: categories }, { data: store }, lang] = await Promise.all([
    supabase.from("categories").select("*").eq("store_id", storeId).order("name"),
    supabase.from("stores").select("currency, store_type").eq("id", storeId).single(),
    getLang(),
  ]);

  return (
    <div>
      <Link href={basePath} className="text-sm text-stone-500 hover:text-stone-900">
        {t(lang, "back_to_products")}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">{t(lang, "new_product_heading")}</h1>
      <div className="mt-6">
        <ProductForm
          categories={categories ?? []}
          storeId={storeId}
          currency={store?.currency ?? "usd"}
          isDisplayShop={store?.store_type === "display_shop"}
          lang={lang}
          action={createProduct.bind(null, storeId, basePath)}
        />
      </div>
    </div>
  );
}
