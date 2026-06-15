import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./CategoryForm";
import { createCategory, deleteCategory } from "./actions";
import { buildCategoryTree, flattenCategoryTree } from "@/lib/categories";

export async function CategoriesView({ storeId }: { storeId: string }) {
  const supabase = await createClient();
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
      <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
      <p className="mt-1 text-sm text-stone-600">
        Organize your products into categories, sub-categories, and sub-sub-categories.
      </p>

      <div className="mt-6">
        <CategoryForm action={createCategory.bind(null, storeId)} parentOptions={parentOptions} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Slug</th>
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
                <td className="px-4 py-2 text-right">
                  <form action={deleteCategory.bind(null, storeId, category.id)}>
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!flat.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-stone-500">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
