import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteStore, toggleStoreStatus } from "./actions";

export default async function AdminStoresPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  const ownerIds = stores?.map((s) => s.owner_id) ?? [];
  const { data: owners } =
    ownerIds.length > 0
      ? await supabase.from("profiles").select("id, email").in("id", ownerIds)
      : { data: [] };

  const ownerEmailById = new Map(owners?.map((o) => [o.id, o.email]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Stores</h1>
        <Link
          href="/admin/stores/new"
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          New Store
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Public Link</th>
              <th className="px-4 py-2 font-medium">Manager</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {stores?.map((store) => (
              <tr key={store.id} className="border-t border-stone-200">
                <td className="px-4 py-2 font-medium">
                  <Link href={`/admin/stores/${store.id}`} className="hover:underline">
                    {store.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-600">
                  <Link
                    href={`/store/${store.slug}`}
                    target="_blank"
                    className="underline hover:text-stone-900"
                  >
                    /store/{store.slug}
                  </Link>
                </td>
                <td className="px-4 py-2 text-stone-600">
                  {ownerEmailById.get(store.owner_id) ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      store.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                    }
                  >
                    {store.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/stores/${store.id}/edit`}
                      className="text-sm text-stone-600 hover:text-stone-900"
                    >
                      Edit
                    </Link>
                    <form action={toggleStoreStatus.bind(null, store.id, store.status)}>
                      <button
                        type="submit"
                        className="text-sm text-stone-600 hover:text-stone-900"
                      >
                        {store.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteStore.bind(null, store.id)}>
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!stores?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  No stores yet. Create your first store to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
