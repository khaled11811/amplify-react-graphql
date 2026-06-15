import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { EditProductView } from "./EditProductView";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const { created } = await searchParams;

  return (
    <EditProductView
      storeId={profile.store_id}
      basePath="/dashboard/products"
      productId={id}
      justCreated={created === "1"}
    />
  );
}
