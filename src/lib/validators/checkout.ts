import { z } from "zod";

export const checkoutSchema = z.object({
  storeSlug: z.string().min(1),
  customer: z.object({
    name: z.string().trim().min(1, { error: "Name is required." }),
    email: z.email(),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().max(500).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, { error: "Cart is empty." }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
