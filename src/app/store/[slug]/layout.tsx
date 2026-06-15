import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { CartProvider } from "@/lib/cart/CartContext";
import { themeStyle, backgroundStyle, getContrastTextColor, DEFAULT_THEME_COLOR } from "@/lib/theme";
import { CartLink } from "./CartLink";
import { StoreContact } from "./StoreContact";

const playfairDisplay = Playfair_Display({
  variable: "--font-store-serif",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-store-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) notFound();

  const style = {
    ...themeStyle(store.theme || DEFAULT_THEME_COLOR),
    ...backgroundStyle(store),
  };

  const fontClassName =
    store.font === "serif"
      ? playfairDisplay.className
      : store.font === "rounded"
        ? poppins.className
        : undefined;

  const headerColor = store.header_color || "#ffffff";
  const headerTextColor = getContrastTextColor(headerColor);

  return (
    <CartProvider storeSlug={slug}>
      <div className={`flex min-h-screen flex-col ${fontClassName ?? ""}`} style={style}>
        <header className="sticky top-0 z-20 shadow-sm" style={{ backgroundColor: headerColor }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href={`/store/${slug}`}
              className="flex items-center gap-2 font-semibold"
              style={{ color: headerTextColor }}
            >
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: headerTextColor, color: headerColor }}
                >
                  {store.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              {store.name}
            </Link>
            <CartLink slug={slug} textColor={headerTextColor} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
        <footer className="border-t border-stone-200 bg-white/80 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <StoreContact contactInfo={store.contact_info ?? {}} />
            <p className="mt-4 text-center text-xs text-stone-400">Powered by TajerLink</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
