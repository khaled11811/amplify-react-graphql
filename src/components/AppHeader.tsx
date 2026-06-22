"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/login/actions";
import { LanguageToggle } from "@/components/LanguageToggle";
import { t, type Lang } from "@/lib/i18n/translations";

export function AppHeader({
  links,
  email,
  lang,
}: {
  links: { href: string; label: string }[];
  email?: string | null;
  lang: Lang;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-stone-800 bg-stone-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-4">
          <Logo className="mr-2 rounded-md bg-white px-2 py-1" />
          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {email && <span className="hidden text-sm text-stone-400 sm:inline">{email}</span>}
          <LanguageToggle
            currentLang={lang}
            className="rounded-md border border-stone-700 px-3 py-1.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:opacity-50"
          />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-stone-700 px-3 py-1.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
            >
              {t(lang, "nav_sign_out")}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center rounded-md p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={`absolute top-0 ${lang === "ar" ? "right-0" : "left-0"} flex h-full w-72 flex-col bg-stone-900 p-4 shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <Logo className="rounded-md bg-white px-2 py-1" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center rounded-md p-2 text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {email && <div className="mt-4 text-sm text-stone-400">{email}</div>}

            <nav className="mt-4 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2">
              <LanguageToggle
                currentLang={lang}
                className="rounded-md border border-stone-700 px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white disabled:opacity-50"
              />
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded-md border border-stone-700 px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
                >
                  {t(lang, "nav_sign_out")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
