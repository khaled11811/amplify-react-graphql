import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { CategoriesView } from "./CategoriesView";

export default async function CategoriesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  return <CategoriesView storeId={profile.store_id} />;
}
