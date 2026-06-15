import { requireStoreAccess } from "@/lib/data/auth";
import { TransactionsListView } from "@/app/(dashboard)/dashboard/transactions/TransactionsListView";

export default async function AdminStoreTransactionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStoreAccess(id);

  return <TransactionsListView storeId={id} ordersBasePath={`/admin/stores/${id}/orders`} />;
}
