import Link from "next/link";
import { Logo } from "@/components/Logo";
import { logout } from "@/app/login/actions";

export function AppHeader({
  links,
  email,
}: {
  links: { href: string; label: string }[];
  email?: string | null;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-800 bg-stone-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-1 sm:gap-4">
          <Logo className="mr-2 rounded-md bg-white px-2 py-1" />
          <nav className="flex flex-wrap items-center gap-1">
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
        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-stone-400 sm:inline">{email}</span>}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-stone-700 px-3 py-1.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
