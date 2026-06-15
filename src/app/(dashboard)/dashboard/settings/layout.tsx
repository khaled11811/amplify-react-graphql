import Link from "next/link";

const TABS = [
  { href: "/dashboard/settings/general", label: "General" },
  { href: "/dashboard/settings/appearance", label: "Appearance" },
  { href: "/dashboard/settings/billing", label: "Billing information" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-stone-900">Store Settings</h1>

      <nav className="mt-4 flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-white hover:text-stone-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
