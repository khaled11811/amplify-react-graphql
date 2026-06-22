import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM ?? "orders@resend.dev";

export type OrderEmailData = {
  customerEmail: string;
  customerName: string;
  storeName: string;
  orderId: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
};

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: "Paid",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

function buildEmailHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;">${item.product_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">${formatPrice(item.unit_price, data.currency)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e7e5e4;text-align:right;">${formatPrice(item.unit_price * item.quantity, data.currency)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1c1917;background:#f5f5f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:#0d9488;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">${data.storeName}</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 8px;">Hi ${data.customerName},</p>
      <p style="margin:0 0 24px;color:#57534e;">Here is an update on your order.</p>

      <div style="background:#f5f5f4;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#78716c;">Order ID</p>
        <p style="margin:0;font-size:13px;font-family:monospace;">#${data.orderId.slice(0, 8)}</p>
        <p style="margin:16px 0 4px;font-size:13px;color:#78716c;">Order Status</p>
        <p style="margin:0;font-size:18px;"><strong>${statusLabel(data.status)}</strong></p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f5f5f4;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#57534e;">Product</th>
            <th style="padding:8px 12px;text-align:center;font-weight:600;color:#57534e;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#57534e;">Unit price</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#57534e;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="text-align:right;margin-top:12px;font-size:16px;font-weight:600;">
        Total: ${formatPrice(data.totalAmount, data.currency)}
      </div>
    </div>
    <div style="padding:16px 32px;background:#f5f5f4;font-size:12px;color:#a8a29e;text-align:center;">
      You are receiving this email because you placed an order at ${data.storeName}.
    </div>
  </div>
</body>
</html>`;
}

export type SignupWelcomeEmailData = {
  managerEmail: string;
  managerName?: string;
  storeName: string;
  storeSlug: string;
};

export async function sendSignupWelcomeEmail(data: SignupWelcomeEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://tajerlink.com"}/store/${data.storeSlug}`;
  const greeting = data.managerName ? `Hi ${data.managerName},` : "Hi,";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;color:#1c1917;background:#f5f5f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:#0d9488;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;">Welcome to TajerLink!</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 16px;color:#57534e;">Your store <strong>${data.storeName}</strong> has been created and is ready to go.</p>
      <div style="background:#f5f5f4;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#78716c;">Your login email</p>
        <p style="margin:0;font-size:15px;font-weight:600;">${data.managerEmail}</p>
        <p style="margin:16px 0 4px;font-size:13px;color:#78716c;">Your store link</p>
        <a href="${storeUrl}" style="color:#0d9488;font-size:14px;">${storeUrl}</a>
      </div>
      <p style="color:#57534e;font-size:14px;">Sign in using the email above and the password you created during signup.</p>
    </div>
    <div style="padding:16px 32px;background:#f5f5f4;font-size:12px;color:#a8a29e;text-align:center;">
      TajerLink &mdash; Create. Share. Sell. Grow.
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.managerEmail,
    subject: `Your TajerLink store "${data.storeName}" is ready!`,
    html,
  });
}

export async function sendOrderEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const isNew = data.status === "paid";
  const subject = isNew
    ? `Order confirmed – ${data.storeName} (#${data.orderId.slice(0, 8)})`
    : `Order update: ${statusLabel(data.status)} – ${data.storeName} (#${data.orderId.slice(0, 8)})`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject,
    html: buildEmailHtml(data),
  });
}
