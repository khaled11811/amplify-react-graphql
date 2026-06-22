import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { checkoutSchema } from "@/lib/validators/checkout";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { storeSlug, customer, items } = parsed.data;
  const supabase = createAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .eq("status", "active")
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .in("id", productIds);

  if (!products || products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products are unavailable." },
      { status: 400 }
    );
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId)!;
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} only has ${product.stock} left in stock.` },
        { status: 400 }
      );
    }
  }

  // Encode items compactly for Stripe metadata (max 500 chars per value).
  // Format: [{"p":"<uuid>","q":<qty>}, ...]
  const itemsMeta = JSON.stringify(items.map((i) => ({ p: i.productId, q: i.quantity })));
  if (itemsMeta.length > 500) {
    return NextResponse.json(
      { error: "Cart has too many items. Please reduce your cart size." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customer.email,
    line_items: items.map((item) => {
      const product = productById.get(item.productId)!;
      return {
        quantity: item.quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.price,
          product_data: { name: product.name },
        },
      };
    }),
    metadata: {
      store_id: store.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || "",
      customer_address: (customer.address || "").slice(0, 500),
      items: itemsMeta,
    },
    success_url: `${origin}/store/${storeSlug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/store/${storeSlug}/cart`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
