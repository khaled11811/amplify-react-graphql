export const APP_NAME = "TajerLink";

export const ROUTES = {
  home: "/",
  login: "/login",
  admin: "/admin",
  dashboard: "/dashboard",
  store: (slug: string) => `/store/${slug}`,
} as const;

export const USER_ROLES = {
  admin: "admin",
  storeManager: "store_manager",
} as const;
