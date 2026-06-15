import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { OrdersListView } from "./OrdersListView";

export default async function OrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  return <OrdersListView storeId={profile.store_id} basePath="/dashboard/orders" />;
}
