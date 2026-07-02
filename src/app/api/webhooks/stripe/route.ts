import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendOrderEmail, sendSignupWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
      );
    } catch {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    if (meta.type === "signup") {
      await handleSignupPayment(session, meta);
    } else {
      await handleOrderPayment(session, meta);
    }
  }

  if (event.type === "account.updated") {
    await handleAccountUpdated(event.data.object as Stripe.Account);
  }

  return NextResponse.json({ received: true });
}

async function handleAccountUpdated(account: Stripe.Account) {
  const adminClient = createAdminClient();
  const status = account.charges_enabled
    ? "complete"
    : account.details_submitted
      ? "pending"
      : "not_started";

  await adminClient
    .from("stores")
    .update({
      stripe_charges_enabled: account.charges_enabled ?? false,
      stripe_onboarding_status: status,
    })
    .eq("stripe_account_id", account.id);
}

async function handleSignupPayment(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>
) {
  const pendingSignupId = meta.pending_signup_id;
  if (!pendingSignupId) return;

  const adminClient = createAdminClient();

  const { data: pending } = await adminClient
    .from("pending_signups")
    .select("*")
    .eq("id", pendingSignupId)
    .single();

  if (!pending || pending.processed_at) return; // already processed

  const amountAed = session.amount_total ? session.amount_total / 100 : undefined;
  await provisionSignup(pending, adminClient, amountAed);
}

export async function provisionSignup(
  pending: {
    id: string;
    store_name: string;
    store_slug: string;
    store_type: string;
    manager_name: string | null;
    manager_email: string;
    manager_password: string;
  },
  adminClient: ReturnType<typeof createAdminClient>,
  amountAed?: number
) {
  // Create auth user
  const { data: userData, error: userError } =
    await adminClient.auth.admin.createUser({
      email: pending.manager_email,
      password: pending.manager_password,
      email_confirm: true,
    });

  if (userError || !userData.user) {
    console.error("Signup provision: failed to create user", userError);
    return;
  }

  const userId = userData.user.id;

  // Create store
  const { data: store, error: storeError } = await adminClient
    .from("stores")
    .insert({
      owner_id: userId,
      name: pending.store_name,
      slug: pending.store_slug,
      store_type: pending.store_type as "paid_shop" | "display_shop",
      subscription_type: pending.store_type === "paid_shop" ? "paid" : "free",
    })
    .select()
    .single();

  if (storeError || !store) {
    console.error("Signup provision: failed to create store", storeError);
    return;
  }

  // Update profile
  await adminClient
    .from("profiles")
    .update({ store_id: store.id, full_name: pending.manager_name ?? null })
    .eq("id", userId);

  // Mark pending signup as processed
  await adminClient
    .from("pending_signups")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", pending.id);

  // Record subscription payment for revenue tracking (survives store deletion)
  if (amountAed !== undefined && amountAed > 0) {
    await adminClient
      .from("subscription_payments")
      .insert({ store_id: store.id, amount_aed: amountAed });
  }

  // Send welcome email
  await sendSignupWelcomeEmail({
    managerEmail: pending.manager_email,
    managerName: pending.manager_name ?? undefined,
    storeName: pending.store_name,
    storeSlug: pending.store_slug,
  });
}

async function handleOrderPayment(
  session: Stripe.Checkout.Session,
  meta: Record<string, string>
) {
  const storeId = meta.store_id;
  const customerName = meta.customer_name;
  const customerEmail = meta.customer_email;
  const customerPhone = meta.customer_phone || null;
  const customerAddress = meta.customer_address || null;
  const itemsMeta: { p: string; q: number }[] = meta.items ? JSON.parse(meta.items) : [];

  if (!storeId || !customerEmail || itemsMeta.length === 0) return;

  const supabase = createAdminClient();

  const productIds = itemsMeta.map((i) => i.p);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, currency")
    .in("id", productIds);

  if (!products || products.length === 0) return;

  const productById = new Map(products.map((p) => [p.id, p]));
  const currency = products[0]?.currency ?? "usd";
  const totalAmount = itemsMeta.reduce((sum, item) => {
    const product = productById.get(item.p);
    return sum + (product?.price ?? 0) * item.q;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: customerAddress,
      status: "paid",
      total_amount: totalAmount,
      currency,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Failed to create order from webhook:", orderError);
    return;
  }

  const orderItems = itemsMeta
    .map((item) => {
      const product = productById.get(item.p);
      if (!product) return null;
      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: item.q,
        unit_price: product.price,
      };
    })
    .filter(Boolean) as {
      order_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
    }[];

  await supabase.from("order_items").insert(orderItems);

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (paymentIntentId) {
    await supabase.from("transactions").insert({
      order_id: order.id,
      store_id: order.store_id,
      stripe_payment_intent_id: paymentIntentId,
      amount: session.amount_total ?? order.total_amount,
      currency: session.currency ?? order.currency,
      status: "succeeded",
      payment_method: session.payment_method_types?.[0] ?? null,
    });
  }

  for (const item of itemsMeta) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.p)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(product.stock - item.q, 0) })
        .eq("id", item.p);
    }
  }

  const { data: store } = await supabase
    .from("stores")
    .select("name")
    .eq("id", storeId)
    .single();

  await sendOrderEmail({
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    storeName: store?.name ?? "The Store",
    orderId: order.id,
    status: "paid",
    totalAmount: order.total_amount,
    currency: order.currency,
    items: orderItems,
  });
}
