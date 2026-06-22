import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// DEV ONLY — remove before production
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }

  const adminClient = createAdminClient();

  // Reset admin password to known value
  await adminClient.auth.admin.updateUserById("ffe02691-29be-4598-85d5-f142ebdbb757", {
    password: "12345678",
  });

  // Sign in with the known password using the regular client
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@example.com",
    password: "12345678",
  });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, email: data.user?.email });
}
