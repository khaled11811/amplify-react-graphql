import { requireStoreAccess } from "@/lib/data/auth";
import { OrdersListView } from "@/app/(dashboard)/dashboard/orders/OrdersListView";

export default async function AdminStoreOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  return <OrdersListView storeId={id} basePath={`/admin/stores/${id}/orders`} />;
}
