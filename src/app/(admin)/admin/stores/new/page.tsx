import Link from "next/link";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { NewStoreForm } from "./NewStoreForm";

export default async function NewStorePage() {
  const lang = await getLang();
  return (
    <div>
      <Link href="/admin/stores" className="text-sm text-stone-500 hover:text-stone-900">
        ← {t(lang, "stores_heading")}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">{t(lang, "new_store_heading")}</h1>
      <div className="mt-6">
        <NewStoreForm lang={lang} />
      </div>
    </div>
  );
}
