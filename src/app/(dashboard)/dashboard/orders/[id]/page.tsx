import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { OrderDetailView } from "../OrderDetailView";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  return <OrderDetailView storeId={profile.store_id} basePath="/dashboard/orders" orderId={id} />;
}
