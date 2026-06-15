import { requireStoreAccess } from "@/lib/data/auth";
import { NewProductView } from "@/app/(dashboard)/dashboard/products/NewProductView";

export default async function AdminStoreNewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  return <NewProductView storeId={id} basePath={`/admin/stores/${id}/products`} />;
}
