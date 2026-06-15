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

  const currency = products[0]?.currency ?? "usd";
  const totalAmount = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: store.id,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      shipping_address: customer.address || null,
      status: "pending",
      total_amount: totalAmount,
      currency,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order." },
      { status: 500 }
    );
  }

  const orderItems = items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity,
      unit_price: product.price,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
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
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
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
