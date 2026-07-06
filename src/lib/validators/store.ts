import { z } from "zod";
import { DEFAULT_THEME_COLOR, STORE_BACKGROUND_TYPES, STORE_FONTS, PRESET_BACKGROUNDS, STORE_BUTTON_SHAPES, STORE_CARD_STYLES, STORE_SORT_OPTIONS } from "@/lib/theme";

const STORE_LANGUAGE_VALUES = ["en", "ar"] as const;

export const storeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().trim().max(500).optional(),
});

export const createStoreSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  storeSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      error: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  storeType: z.enum(["paid_shop", "display_shop"]),
  managerName: z.string().trim().max(100).optional(),
  managerEmail: z.email(),
  managerPassword: z.string().min(8, {
    error: "Password must be at least 8 characters.",
  }),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(2000).optional(),
  price: z.number().int().nonnegative(),
  currency: z.string().length(3).default("usd"),
  stock: z.number().int().nonnegative().default(0),
  category_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

const presetBackgroundIds = PRESET_BACKGROUNDS.map((p) => p.id) as [string, ...string[]];

const hexColorSchema = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, {
  error: "Must be a valid hex color.",
});

export const storeAppearanceSchema = z
  .object({
    description: z.string().trim().max(500).optional(),
    footer_text: z.string().trim().max(200).optional(),
    hero_title: z.string().trim().max(120).optional(),
    hero_subtitle: z.string().trim().max(200).optional(),
    theme: hexColorSchema.optional(),
    header_color: hexColorSchema.optional(),
    font: z.enum(STORE_FONTS),
    background_type: z.enum(STORE_BACKGROUND_TYPES),
    background_color: z.string().trim().optional(),
    background_preset: z.enum(presetBackgroundIds).optional(),
    button_shape: z.enum(STORE_BUTTON_SHAPES).default("rounded"),
    product_card_style: z.enum(STORE_CARD_STYLES).default("grid"),
    products_per_row: z.coerce.number().int().min(2).max(4).default(3),
    announcement_active: z.coerce.boolean().default(false),
    announcement_color: hexColorSchema.default("#000000"),
    announcement_texts: z.array(
      z.string().trim()
        .min(1, "Announcement cannot be empty")
        .max(120, "Max 120 characters per announcement")
        .regex(/^[^<>{}`\\]*$/, "Characters < > { } ` \\ are not allowed")
    ).max(5, "Up to 5 announcements allowed").default([]),
    product_sort_default: z.enum(STORE_SORT_OPTIONS).default("newest"),
  })
  .transform((data) => {
    let background_value: string | null = null;
    if (data.background_type === "color") {
      background_value = data.background_color || null;
    } else if (data.background_type === "preset") {
      background_value = data.background_preset ?? null;
    }

    return {
      description: data.description,
      footer_text: data.footer_text || null,
      hero_title: data.hero_title || null,
      hero_subtitle: data.hero_subtitle || null,
      theme: data.theme || DEFAULT_THEME_COLOR,
      header_color: data.header_color || "#ffffff",
      font: data.font,
      background_type: data.background_type,
      background_value,
      button_shape: data.button_shape,
      product_card_style: data.product_card_style,
      products_per_row: data.products_per_row,
      announcement_active: data.announcement_active,
      announcement_color: data.announcement_color,
      announcement_texts: data.announcement_texts,
      product_sort_default: data.product_sort_default,
    };
  });

export const billingInfoSchema = z.object({
  account_holder: z.string().trim().max(150).optional(),
  bank_name: z.string().trim().max(150).optional(),
  account_number: z.string().trim().max(50).optional(),
  routing_number: z.string().trim().max(50).optional(),
  paypal_email: z.union([z.email(), z.literal("")]).optional(),
});

export const contactInfoSchema = z.object({
  phone_number: z.string().trim().max(30).optional(),
  whatsapp_number: z.string().trim().max(30).optional(),
  instagram: z.string().trim().max(100).optional(),
  facebook: z.string().trim().max(100).optional(),
  tiktok: z.string().trim().max(100).optional(),
  x_twitter: z.string().trim().max(100).optional(),
  business_email: z.union([z.email(), z.literal("")]).optional(),
  website: z.string().trim().max(200).optional(),
});

export const editStoreSchema = z.object({
  name: z.string().trim().min(2).max(100),
  managerName: z.string().trim().max(100).optional(),
  managerEmail: z.email(),
  publicEmail: z.union([z.email(), z.literal("")]).optional(),
  newPassword: z.union([
    z.string().min(8, { error: "Password must be at least 8 characters." }),
    z.literal(""),
  ]).optional(),
});

export const storeGeneralSchema = contactInfoSchema.extend({
  name: z.string().trim().min(2).max(100),
  fullName: z.string().trim().max(100).optional(),
  storeLanguage: z.enum(STORE_LANGUAGE_VALUES).optional(),
  newPassword: z.union([
    z.string().min(8, { error: "Password must be at least 8 characters." }),
    z.literal(""),
  ]).optional(),
  confirmPassword: z.union([z.string(), z.literal("")]).optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  parent_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((val) => (val ? val : null)),
});

export type StoreInput = z.infer<typeof storeSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

