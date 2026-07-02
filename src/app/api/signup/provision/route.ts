import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { provisionSignup } from "@/app/api/webhooks/stripe/route";

export async function POST(request: Request) {
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
    .select("*")
    .single();

  if (pendingError || !pending) {
    console.error("Provision: failed to create pending signup", pendingError);
    return NextResponse.json({ error: "Failed to create store. Please try again." }, { status: 500 });
  }

  await provisionSignup(pending, adminClient);

  return NextResponse.json({ success: true });
}
