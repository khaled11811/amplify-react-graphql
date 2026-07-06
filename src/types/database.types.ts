// Hand-written types matching supabase/schema.sql.
// Once the Supabase project is created, regenerate this file with:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

export type UserRole = "admin" | "store_manager";

export type OrderStatus =
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export type TransactionStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";

export type StoreStatus = "active" | "suspended";

export type StoreType = "paid_shop" | "display_shop";

export type StoreBackgroundType = "none" | "color" | "preset" | "image";

export type StoreFont = "sans" | "serif" | "rounded" | "tajawal" | "cairo" | "amiri";

export type BillingInfo = {
  account_holder?: string;
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  paypal_email?: string;
};

export type ContactInfo = {
  phone_number?: string;
  whatsapp_number?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  x_twitter?: string;
  business_email?: string;
  website?: string;
};

export type Profile = {
  id: string; // references auth.users.id
  role: UserRole;
  store_id: string | null; // set for store_manager, null for admin
  full_name: string | null;
  email: string;
  created_at: string;
};

export type Store = {
  id: string;
  owner_id: string; // references profiles.id (store manager)
  name: string;
  slug: string; // used for public store link, e.g. /store/[slug]
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: StoreStatus;
  theme: string;
  header_color: string;
  background_type: StoreBackgroundType;
  background_value: string | null;
  font: StoreFont;
  store_language: string;
  store_type: StoreType;
  subscription_type: string;
  currency: string;
  billing_info: BillingInfo;
  contact_info: ContactInfo;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_onboarding_status: StripeOnboardingStatus;
  trade_license_number: string | null;
  trade_license_expiry: string | null;
  trade_license_doc_url: string | null;
  tax_registration_number: string | null;
  vat_certificate_url: string | null;
  footer_text: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  products_per_row: number;
  button_shape: string;
  product_card_style: string;
  announcement_text: string | null;
  announcement_texts: string[];
  announcement_color: string;
  announcement_active: boolean;
  about_page_content: string | null;
  product_sort_default: string;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type StripeOnboardingStatus = "not_started" | "pending" | "complete";

export type Category = {
  id: string;
  store_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number; // stored in smallest currency unit (e.g. cents)
  currency: string; // e.g. "usd"
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string | null;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  rating_token: string | null;
  rating_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Rating = {
  id: string;
  order_id: string;
  product_id: string;
  store_id: string;
  rating: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type Transaction = {
  id: string;
  order_id: string;
  store_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: string | null;
  created_at: string;
};

export type PayoutStatus = "pending" | "paid";

export type Payout = {
  id: string;
  store_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  requested_at: string;
  paid_at: string | null;
};

export type AppSetting = {
  key: string;
  value: string;
  updated_at: string | null;
};

export type PendingSignup = {
  id: string;
  store_name: string;
  store_slug: string;
  store_type: string;
  manager_name: string | null;
  manager_email: string;
  manager_password: string;
  created_at: string | null;
  processed_at: string | null;
};

export type SubscriptionPayment = {
  id: string;
  store_id: string | null;
  amount_aed: number;
  paid_at: string;
};

// Supabase-generated `Database` type shape, kept minimal until
// `supabase gen types` is run against the real project.
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      stores: Table<Store>;
      categories: Table<Category>;
      products: Table<Product>;
      product_images: Table<ProductImage>;
      orders: Table<Order>;
      order_items: Table<OrderItem>;
      transactions: Table<Transaction>;
      payouts: Table<Payout>;
      app_settings: Table<AppSetting>;
      pending_signups: Table<PendingSignup>;
      subscription_payments: Table<SubscriptionPayment>;
      ratings: Table<Rating>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
