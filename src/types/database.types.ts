// Hand-written types matching supabase/schema.sql.
// Once the Supabase project is created, regenerate this file with:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

export type UserRole = "admin" | "store_manager";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type TransactionStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded";

export type StoreStatus = "active" | "suspended";

export type StoreBackgroundType = "none" | "color" | "preset" | "image";

export type StoreFont = "sans" | "serif" | "rounded";

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
  billing_info: BillingInfo;
  contact_info: ContactInfo;
  created_at: string;
  updated_at: string;
};

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
  created_at: string;
  updated_at: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
