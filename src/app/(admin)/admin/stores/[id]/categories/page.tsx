import { requireStoreAccess } from "@/lib/data/auth";
import { CategoriesView } from "@/app/(dashboard)/dashboard/categories/CategoriesView";

export default async function AdminStoreCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  return <CategoriesView storeId={id} />;
}
