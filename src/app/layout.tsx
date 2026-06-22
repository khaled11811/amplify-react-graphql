import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { ToastProvider } from "@/lib/toast/ToastContext";
import type { Lang } from "@/lib/i18n/translations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TajerLink",
  description: "Admin, Store Manager, and storefront platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const lang: Lang = jar.get("lang")?.value === "ar" ? "ar" : "en";

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased ${lang === "ar" ? "font-cairo" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
