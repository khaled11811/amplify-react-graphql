import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";

export default async function Home() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}
