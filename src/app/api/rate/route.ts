import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, ratings } = body as {
    token: string;
    ratings: { productId: string; rating: number }[];
  };

  if (!token || !Array.isArray(ratings) || ratings.length === 0) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  for (const r of ratings) {
    if (!r.productId || typeof r.rating !== "number" || r.rating < 1 || r.rating > 5) {
      return NextResponse.json({ error: "Invalid rating value." }, { status: 400 });
    }
  }

  const adminClient = createAdminClient();

  const { data: order } = await adminClient
    .from("orders")
    .select("id, store_id")
    .eq("rating_token", token)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Invalid or expired rating link." }, { status: 404 });
  }

  // Prevent double submission
  const { count } = await adminClient
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id);

  if (count && count > 0) {
    return NextResponse.json({ error: "Already rated." }, { status: 409 });
  }

  const rows = ratings.map((r) => ({
    order_id: order.id,
    product_id: r.productId,
    store_id: order.store_id,
    rating: r.rating,
  }));

  const { error } = await adminClient.from("ratings").insert(rows);

  if (error) {
    console.error("Rating insert error:", error);
    return NextResponse.json({ error: "Failed to save ratings." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
