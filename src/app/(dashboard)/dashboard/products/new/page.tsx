import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { NewProductView } from "../NewProductView";

export default async function NewProductPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  return <NewProductView storeId={profile.store_id} basePath="/dashboard/products" />;
}
