import { requireStoreAccess } from "@/lib/data/auth";
import { EditProductView } from "@/app/(dashboard)/dashboard/products/[id]/edit/EditProductView";

export default async function AdminStoreEditProductPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;
  await requireStoreAccess(id);

  return <EditProductView storeId={id} basePath={`/admin/stores/${id}/products`} productId={productId} />;
}
