import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { AppHeader } from "@/components/AppHeader";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/payouts", label: "Payouts" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader links={LINKS} email={profile.email} />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
