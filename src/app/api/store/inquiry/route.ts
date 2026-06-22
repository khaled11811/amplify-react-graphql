import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM ?? "orders@resend.dev";

const inquirySchema = z.object({
  storeSlug: z.string().min(1),
  productId: z.string().uuid(),
  customerEmail: z.email(),
  customerPhone: z.string().min(1, { error: "Phone number is required." }),
  customerName: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { storeSlug, productId, customerEmail, customerPhone, customerName } = parsed.data;

  const supabase = createAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, contact_info, store_type, currency")
    .eq("slug", storeSlug)
    .eq("status", "active")
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  if (store.store_type !== "display_shop") {
    return NextResponse.json({ error: "Inquiries are only available for display shops." }, { status: 400 });
  }

  const businessEmail = store.contact_info?.business_email;
  if (!businessEmail) {
    return NextResponse.json(
      { error: "This store has not set up a contact email yet. Please try another way to reach them." },
      { status: 400 }
    );
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price, currency")
    .eq("id", productId)
    .eq("store_id", store.id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1c1917;background:#f5f5f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:#0d9488;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">${store.name}</h1>
      <p style="margin:8px 0 0;color:#ccfbf1;font-size:14px;">New product enquiry</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 24px;color:#57534e;">A customer has expressed interest in one of your products.</p>

      <h2 style="margin:0 0 12px;font-size:16px;color:#1c1917;">Product</h2>
      <div style="background:#f5f5f4;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;">${product.name}</p>
        ${product.description ? `<p style="margin:8px 0 0;font-size:14px;color:#57534e;">${product.description}</p>` : ""}
        <p style="margin:12px 0 0;font-size:18px;font-weight:700;">${formatPrice(product.price, store.currency ?? product.currency)}</p>
      </div>

      <h2 style="margin:0 0 12px;font-size:16px;color:#1c1917;">Customer details</h2>
      <div style="background:#f5f5f4;border-radius:8px;padding:16px 20px;">
        ${customerName ? `<p style="margin:0 0 8px;font-size:14px;"><span style="color:#78716c;">Name:</span> <strong>${customerName}</strong></p>` : ""}
        <p style="margin:0 0 8px;font-size:14px;"><span style="color:#78716c;">Email:</span> <strong>${customerEmail}</strong></p>
        <p style="margin:0;font-size:14px;"><span style="color:#78716c;">Phone:</span> <strong>${customerPhone}</strong></p>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f5f5f4;font-size:12px;color:#a8a29e;text-align:center;">
      This enquiry was sent via your ${store.name} store page.
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: businessEmail,
    replyTo: customerEmail,
    subject: `New enquiry: ${product.name} — ${store.name}`,
    html,
  });

  return NextResponse.json({ ok: true });
}
