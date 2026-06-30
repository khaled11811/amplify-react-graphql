import { createAdminClient } from "@/lib/supabase/server";
import { RatingForm } from "./RatingForm";

type Lang = "en" | "ar";

const copy = {
  en: {
    invalid_link: "Invalid rating link.",
    expired_link: "This rating link is invalid or has expired.",
    no_items: "No items found for this order.",
    already_rated_heading: "Already rated",
    already_rated_msg: "You have already submitted a rating for this order. Thank you!",
    heading: "Rate your purchase",
    subheading: (name: string, store: string) => `Hi ${name}, how would you rate your items from ${store}?`,
    oops: "Oops",
    dir: "ltr" as const,
  },
  ar: {
    invalid_link: "رابط التقييم غير صالح.",
    expired_link: "هذا الرابط غير صالح أو انتهت صلاحيته.",
    no_items: "لم يتم العثور على منتجات لهذا الطلب.",
    already_rated_heading: "تم التقييم مسبقاً",
    already_rated_msg: "لقد قدّمت تقييمك لهذا الطلب بالفعل. شكراً لك!",
    heading: "قيّم مشترياتك",
    subheading: (name: string, store: string) => `مرحباً ${name}، كيف تقيّم منتجاتك من ${store}؟`,
    oops: "عذراً",
    dir: "rtl" as const,
  },
};

export default async function RatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorView message={copy.en.invalid_link} dir="ltr" oops={copy.en.oops} />;
  }

  const adminClient = createAdminClient();

  const { data: order } = await adminClient
    .from("orders")
    .select("id, store_id, customer_name, rating_email_sent_at")
    .eq("rating_token", token)
    .single();

  if (!order) {
    return <ErrorView message={copy.en.expired_link} dir="ltr" oops={copy.en.oops} />;
  }

  // Fetch store to determine language
  const { data: store } = await adminClient
    .from("stores")
    .select("name, store_language")
    .eq("id", order.store_id)
    .single();

  const lang: Lang = store?.store_language === "ar" ? "ar" : "en";
  const c = copy[lang];
  const storeName = store?.name ?? "the store";

  // Check if already rated
  const { count } = await adminClient
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);

  if (count && count > 0) {
    return (
      <PageShell dir={c.dir}>
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
            <span className="text-2xl">⭐</span>
          </div>
          <h2 className="text-xl font-semibold text-stone-900">{c.already_rated_heading}</h2>
          <p className="mt-2 text-stone-500">{c.already_rated_msg}</p>
        </div>
      </PageShell>
    );
  }

  const { data: orderItems } = await adminClient
    .from("order_items")
    .select("product_id, product_name")
    .eq("order_id", order.id);

  if (!orderItems?.length) {
    return <ErrorView message={c.no_items} dir={c.dir} oops={c.oops} />;
  }

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

  return (
    <PageShell dir={c.dir}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <span className="text-2xl">⭐</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900">{c.heading}</h1>
        <p className="mt-1 text-sm text-stone-500">{c.subheading(order.customer_name, storeName)}</p>
      </div>
      <RatingForm token={token} storeName={storeName} items={items} lang={lang} />
    </PageShell>
  );
}

function PageShell({ children, dir }: { children: React.ReactNode; dir: "ltr" | "rtl" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4" dir={dir}>
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-lg sm:p-8">
        {children}
      </div>
    </div>
  );
}

function ErrorView({ message, dir, oops }: { message: string; dir: "ltr" | "rtl"; oops: string }) {
  return (
    <PageShell dir={dir}>
      <div className="text-center py-4">
        <h2 className="text-lg font-semibold text-stone-900">{oops}</h2>
        <p className="mt-2 text-stone-500">{message}</p>
      </div>
    </PageShell>
  );
}
