import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/server";
import { SignupFlow } from "./SignupFlow";

export default async function SignupPage() {
  const lang = await getLang();

  const adminClient = createAdminClient();
  const { data: feeSetting } = await adminClient
    .from("app_settings")
    .select("value")
    .eq("key", "subscription_fee_aed")
    .single();

  const feeAed = Number(feeSetting?.value ?? 50);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/40" />
      <div className="relative z-10 flex w-full flex-col items-center py-6 sm:py-8">
        <SignupFlow lang={lang} feeAed={feeAed} />
      </div>
    </div>
  );
}
