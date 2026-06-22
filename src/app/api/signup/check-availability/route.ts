import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const value = searchParams.get("value");

  if (!type || !value) {
    return NextResponse.json({ error: "Missing params." }, { status: 400 });
  }

  const adminClient = createAdminClient();

  if (type === "email") {
    const { data } = await adminClient.auth.admin.listUsers();
    const taken = data?.users?.some((u) => u.email === value.toLowerCase());
    return NextResponse.json({ available: !taken });
  }

  if (type === "slug") {
    const { data } = await adminClient
      .from("stores")
      .select("id")
      .eq("slug", value.toLowerCase())
      .is("deleted_at", null)
      .maybeSingle();
    return NextResponse.json({ available: !data });
  }

  return NextResponse.json({ error: "Invalid type." }, { status: 400 });
}
