import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  let body: {
    storeName: string;
    storeSlug: string;
    storeType: string;
    managerName?: string;
    email: string;
    password: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { storeName, storeSlug, storeType, managerName, email, password } = body;

  if (!storeName || !storeSlug || !email || !password) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const adminClient = createAdminClient();

  // Get current subscription fee
  const { data: feeSetting } = await adminClient
    .from("app_settings")
    .select("value")
    .eq("key", "subscription_fee_aed")
    .single();

  const feeAed = Number(feeSetting?.value ?? 50);
  const feeFils = Math.round(feeAed * 100); // AED → fils (smallest unit)

  // Create pending signup record (password stored temporarily, only accessible via service role)
  const { data: pending, error: pendingError } = await adminClient
    .from("pending_signups")
    .insert({
      store_name: storeName,
      store_slug: storeSlug,
      store_type: storeType,
      manager_name: managerName || null,
      manager_email: email.toLowerCase(),
      manager_password: password,
    })
    .select("id")
    .single();

  if (pendingError || !pending) {
    return NextResponse.json({ error: "Failed to save signup. Please try again." }, { status: 500 });
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "aed",
          unit_amount: feeFils,
          product_data: {
            name: `TajerLink store subscription – ${storeName}`,
            description: "One-time subscription fee to activate your store.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "signup",
      pending_signup_id: pending.id,
    },
    success_url: `${origin}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/signup`,
  });

  return NextResponse.json({ url: session.url });
}
