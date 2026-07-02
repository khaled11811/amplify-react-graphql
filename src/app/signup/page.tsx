import Image from "next/image";
import { getLang } from "@/lib/i18n/server";
import { SignupFlow } from "./SignupFlow";

export default async function SignupPage() {
  const lang = await getLang();

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
        <SignupFlow lang={lang} />
      </div>
    </div>
  );
}
