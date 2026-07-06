import type { Metadata } from "next";
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
import { AnnouncementTicker } from "./AnnouncementTicker";
import { BackToTop } from "./BackToTop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};
  return {
    icons: store.favicon_url ? { icon: store.favicon_url } : undefined,
  };
}

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

  const whatsappNumber = (store.contact_info as Record<string, string> | null)?.whatsapp_number;

  const announcementBgColor = store.announcement_color || "#000000";
  const announcementBanner =
    store.announcement_active && store.announcement_texts?.length ? (
      <AnnouncementTicker
        texts={store.announcement_texts}
        bgColor={announcementBgColor}
        textColor={getContrastTextColor(announcementBgColor)}
      />
    ) : null;

  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : null;

  return (
    <CartProvider storeSlug={slug}>
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className={`flex min-h-screen flex-col ${fontClassName ?? ""}`}
        style={style}
      >
        <div className="sticky top-0 z-20 shadow-sm">
          {announcementBanner}
          <header style={{ backgroundColor: headerColor }}>
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
        </div>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>

        <footer className="border-t border-stone-200 bg-white/80 px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <StoreContact contactInfo={store.contact_info ?? {}} lang={lang} />
            {store.about_page_content && (
              <div className="mt-3 text-center">
                <Link
                  href={`/store/${slug}/about`}
                  className="text-xs text-stone-500 underline hover:text-stone-700"
                >
                  {t(lang, "about_page_label")}
                </Link>
              </div>
            )}
            {(store.trade_license_number || store.tax_registration_number) && (
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-stone-400">
                {store.trade_license_number && (
                  <span>
                    {lang === "ar" ? "رقم الرخصة التجارية" : "TL/CR No."}{": "}{store.trade_license_number}
                  </span>
                )}
                {store.tax_registration_number && (
                  <span className="flex items-center gap-1.5">
                    {lang === "ar" ? "رقم التسجيل الضريبي" : "Tax Reg. No."}{": "}{store.tax_registration_number}
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

        <BackToTop dir={lang === "ar" ? "rtl" : "ltr"} />

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t(lang, "whatsapp_chat_label")}
            style={{ right: lang === "ar" ? undefined : "1.5rem", left: lang === "ar" ? "1.5rem" : undefined }}
            className="fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-7 w-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.374 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.849L0 24l6.335-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.013-1.379l-.36-.214-3.733.976.999-3.648-.235-.374A9.818 9.818 0 0112 2.182c5.428 0 9.818 4.39 9.818 9.818S17.428 21.818 12 21.818z" />
            </svg>
          </a>
        )}
      </div>
    </CartProvider>
  );
}
