import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { EditStoreForm } from "./EditStoreForm";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") notFound();

  const [supabase, lang] = [await createClient(), await getLang()];
  const { data: store } = await supabase.from("stores").select("*").eq("id", id).single();
  if (!store) notFound();

  const { data: owner } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", store.owner_id)
    .single();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-stone-900">{t(lang, "edit_store_heading")}</h1>
      <div className="mt-6">
        <EditStoreForm
          storeId={id}
          name={store.name}
          managerName={owner?.full_name ?? ""}
          managerEmail={owner?.email ?? ""}
          publicEmail={store.contact_info?.business_email ?? ""}
          lang={lang}
        />
      </div>
    </div>
  );
}
