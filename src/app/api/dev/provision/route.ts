import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { provisionSignup } from "@/app/api/webhooks/stripe/route";

// DEV ONLY — remove before production
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }

  const body = await request.json();
  const adminClient = createAdminClient();
  await provisionSignup(body, adminClient, body.amount_aed);
  return NextResponse.json({ ok: true });
}
