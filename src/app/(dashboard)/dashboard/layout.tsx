import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { AppHeader } from "@/components/AppHeader";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/payouts", label: "Payouts" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "store_manager") redirect("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader links={LINKS} email={profile.email} />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
