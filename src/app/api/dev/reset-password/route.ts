import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// DEV ONLY — remove before production
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }

  const { userId, password } = await request.json();
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
