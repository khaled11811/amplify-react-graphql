import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { CategoryForm } from "./CategoryForm";
import { createCategory, deleteCategory } from "./actions";
import { buildCategoryTree, flattenCategoryTree } from "@/lib/categories";
import { DeleteButton } from "@/components/DeleteButton";
import { EditCategoryModal } from "./EditCategoryModal";

export async function CategoriesView({ storeId }: { storeId: string }) {
  const supabase = await createClient();
  const lang = await getLang();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("store_id", storeId)
    .order("name");

  const tree = buildCategoryTree(categories ?? []);
  const flat = flattenCategoryTree(tree);
  const parentOptions = flat.filter((category) => category.depth < 2);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "categories_heading")}</h1>
      <p className="mt-1 text-sm text-stone-600">{t(lang, "categories_desc")}</p>

      <div className="mt-6">
        <CategoryForm action={createCategory.bind(null, storeId)} parentOptions={parentOptions} lang={lang} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">{t(lang, "col_name")}</th>
              <th className="px-4 py-2 font-medium">{t(lang, "slug_label")}</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {flat.map((category) => (
              <tr key={category.id} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">
                  <span style={{ paddingLeft: `${category.depth * 1.5}rem` }}>
                    {category.depth > 0 && "↳ "}
                    {category.name}
                  </span>
                </td>
                <td className="px-4 py-2 text-stone-600">{category.slug}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <EditCategoryModal
                      storeId={storeId}
                      categoryId={category.id}
                      currentName={category.name}
                      lang={lang}
                    />
                    <DeleteButton action={deleteCategory.bind(null, storeId, category.id)} lang={lang} />
                  </div>
                </td>
              </tr>
            ))}
            {!flat.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                  {t(lang, "no_categories_yet")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
