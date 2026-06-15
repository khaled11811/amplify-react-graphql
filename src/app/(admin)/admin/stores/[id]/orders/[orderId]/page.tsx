import { requireStoreAccess } from "@/lib/data/auth";
import { OrderDetailView } from "@/app/(dashboard)/dashboard/orders/OrderDetailView";

export default async function AdminStoreOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; orderId: string }>;
}) {
  const { id, orderId } = await params;
  await requireStoreAccess(id);

  return <OrderDetailView storeId={id} basePath={`/admin/stores/${id}/orders`} orderId={orderId} />;
}
