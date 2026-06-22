import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";

// Temporary test route — remove before going to production.
// Usage: GET /api/test-email?to=you@example.com&status=paid
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");
  const status = searchParams.get("status") ?? "paid";

  if (!to) {
    return NextResponse.json({ error: "Pass ?to=your@email.com in the URL." }, { status: 400 });
  }

  const validStatuses = ["paid", "shipped", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Use one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  await sendOrderEmail({
    customerEmail: to,
    customerName: "Test Customer",
    storeName: "Demo Store",
    orderId: "abcd1234-0000-0000-0000-000000000000",
    status,
    totalAmount: 7500, // $75.00
    currency: "usd",
    items: [
      { product_name: "Wireless Headphones", quantity: 1, unit_price: 4999 },
      { product_name: "Phone Case",          quantity: 2, unit_price: 1250 },
    ],
  });

  return NextResponse.json({ ok: true, sentTo: to, status });
}
