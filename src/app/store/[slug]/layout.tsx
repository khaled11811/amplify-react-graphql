import Image from "next/image";
import Link from "next/link";
import { Playfair_Display, Poppins, Tajawal, Cairo, Amiri } from "next/font/google";
import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/data/storefront";
import { CartProvider } from "@/lib/cart/CartContext";
import { themeStyle, backgroundStyle, getContrastTextColor, DEFAULT_THEME_COLOR, buttonShapeStyle } from "@/lib/theme";
import { t, type Lang } from "@/lib/i18n/translations";
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

const tajawal = Tajawal({
  variable: "--font-store-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

const cairo = Cairo({
  variable: "--font-store-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

const amiri = Amiri({
  variable: "--font-store-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
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

  const lang: Lang = store.store_language === "ar" ? "ar" : "en";

  const style = {
    ...themeStyle(store.theme || DEFAULT_THEME_COLOR),
    ...backgroundStyle(store),
    ...buttonShapeStyle(store.button_shape ?? "rounded"),
  };

  const fontClassName =
    store.font === "serif"
      ? playfairDisplay.className
      : store.font === "rounded"
        ? poppins.className
        : store.font === "tajawal"
          ? tajawal.className
          : store.font === "cairo"
            ? cairo.className
            : store.font === "amiri"
              ? amiri.className
              : undefined;

  const headerColor = store.header_color || "#ffffff";
  const headerTextColor = getContrastTextColor(headerColor);

  const isPaidShop = store.store_type === "paid_shop";

  return (
    <CartProvider storeSlug={slug}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} className={`flex min-h-screen flex-col ${fontClassName ?? ""}`} style={style}>
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
            {isPaidShop && <CartLink slug={slug} textColor={headerTextColor} lang={lang} />}
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
        <footer className="border-t border-stone-200 bg-white/80 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <StoreContact contactInfo={store.contact_info ?? {}} lang={lang} />
            {(store.trade_license_number || store.tax_registration_number) && (
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-stone-400">
                {store.trade_license_number && (
                  <span>
                    {lang === "ar" ? "رقم الرخصة التجارية" : "TL/CR No."}: {store.trade_license_number}
                  </span>
                )}
                {store.tax_registration_number && (
                  <span className="flex items-center gap-1.5">
                    {lang === "ar" ? "رقم التسجيل الضريبي" : "Tax Reg. No."}: {store.tax_registration_number}
                    {store.vat_certificate_url && (
                      <a
                        href={store.vat_certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={lang === "ar" ? "شهادة تسجيل ضريبة القيمة المضافة" : "VAT Registration Certificate"}
                        className="text-stone-400 hover:text-teal-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    )}
                  </span>
                )}
              </div>
            )}
            {store.footer_text && (
              <p className="mt-3 text-center text-xs text-stone-500">{store.footer_text}</p>
            )}
            <p className="mt-2 text-center text-xs text-stone-400">{t(lang, "powered_by_text")}</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
