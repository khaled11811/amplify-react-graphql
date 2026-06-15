import { requireStoreAccess } from "@/lib/data/auth";
import { ProductsListView } from "@/app/(dashboard)/dashboard/products/ProductsListView";

export default async function AdminStoreProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  const { q } = await searchParams;

  return (
    <ProductsListView storeId={id} basePath={`/admin/stores/${id}/products`} searchQuery={q} />
  );
}
