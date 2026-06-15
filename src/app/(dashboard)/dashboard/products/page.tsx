import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { ProductsListView } from "./ProductsListView";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const { q } = await searchParams;

  return (
    <ProductsListView storeId={profile.store_id} basePath="/dashboard/products" searchQuery={q} />
  );
}
