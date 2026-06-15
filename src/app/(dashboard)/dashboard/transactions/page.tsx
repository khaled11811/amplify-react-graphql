import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { TransactionsListView } from "./TransactionsListView";

export default async function TransactionsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  return <TransactionsListView storeId={profile.store_id} ordersBasePath="/dashboard/orders" />;
}
