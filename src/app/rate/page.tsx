import { createAdminClient } from "@/lib/supabase/server";
import { RatingForm } from "./RatingForm";

export default async function RatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorView message="Invalid rating link." />;
  }

  const adminClient = createAdminClient();

  const { data: order } = await adminClient
    .from("orders")
    .select("id, store_id, customer_name, rating_email_sent_at")
    .eq("rating_token", token)
    .single();

  if (!order) {
    return <ErrorView message="This rating link is invalid or has expired." />;
  }

  // Check if already rated (any rating for this order exists)
  const { count } = await adminClient
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);

  if (count && count > 0) {
    return (
      <PageShell>
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
            <span className="text-2xl">⭐</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-900">Already rated</h2>
          <p className="mt-2 text-stone-500">You have already submitted a rating for this order. Thank you!</p>
        </div>
      </PageShell>
    );
  }

  const [{ data: store }, { data: orderItems }] = await Promise.all([
    adminClient.from("stores").select("name").eq("id", order.store_id).single(),
    adminClient
      .from("order_items")
      .select("product_id, product_name")
      .eq("order_id", order.id),
  ]);

  if (!orderItems?.length) {
    return <ErrorView message="No items found for this order." />;
  }

  // Fetch product images for display
  const productIds = orderItems.map((i) => i.product_id);
  const { data: images } = await adminClient
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  const imageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!imageByProduct.has(img.product_id)) {
      imageByProduct.set(img.product_id, img.image_url);
    }
  }

  const items = orderItems.map((i) => ({
    productId: i.product_id,
    productName: i.product_name,
    imageUrl: imageByProduct.get(i.product_id) ?? null,
  }));

  const storeName = store?.name ?? "the store";

  return (
    <PageShell>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <span className="text-2xl">⭐</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900">Rate your purchase</h1>
        <p className="mt-1 text-sm text-stone-500">
          Hi {order.customer_name}, how would you rate your items from {storeName}?
        </p>
      </div>
      <RatingForm token={token} storeName={storeName} items={items} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-lg sm:p-8">
        {children}
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <PageShell>
      <div className="text-center py-4">
        <h2 className="text-lg font-semibold text-stone-900">Oops</h2>
        <p className="mt-2 text-stone-500">{message}</p>
      </div>
    </PageShell>
  );
}
