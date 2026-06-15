import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { StoreLogo } from "./StoreLogo";
import { AppearanceForm } from "./AppearanceForm";

export default async function AppearanceSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile?.store_id) {
    return <p className="text-stone-600">No store assigned.</p>;
  }

  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", profile.store_id)
    .single();

  if (!store) {
    return <p className="text-stone-600">Store not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-medium text-stone-900">Store logo</h2>
        <div className="mt-2">
          <StoreLogo storeId={store.id} logoUrl={store.logo_url} />
        </div>
      </div>

      <hr className="border-stone-200" />

      <AppearanceForm
        storeId={store.id}
        description={store.description}
        theme={store.theme}
        headerColor={store.header_color}
        font={store.font}
        backgroundType={store.background_type}
        backgroundValue={store.background_value}
        bannerUrl={store.banner_url}
      />
    </div>
  );
}
