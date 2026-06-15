import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabase = createAdminClient();

      const { data: order } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId)
        .select()
        .single();

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (order && paymentIntentId) {
        await supabase.from("transactions").insert({
          order_id: order.id,
          store_id: order.store_id,
          stripe_payment_intent_id: paymentIntentId,
          amount: session.amount_total ?? order.total_amount,
          currency: session.currency ?? order.currency,
          status: "succeeded",
          payment_method: session.payment_method_types?.[0] ?? null,
        });

        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", order.id);

        for (const item of orderItems ?? []) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({ stock: Math.max(product.stock - item.quantity, 0) })
              .eq("id", item.product_id);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
