import Image from "next/image";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 flex-col lg:flex-row">
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/40" />

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="animate-drop-in-fade mx-auto max-w-xl rounded-2xl bg-stone-100/70 p-6 lg:mx-0">
          <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
            Welcome to <span className="text-blue-900">Tajer</span><span className="text-teal-600">Link</span>
          </h1>
          <p className="mt-4 text-stone-700">
            TajerLink is a modern multi-store marketplace platform designed to help
            businesses create, manage, and share their own online stores with ease.
          </p>
          <p className="mt-4 text-stone-700">
            With TajerLink, store managers can add products, organize them into
            categories, manage prices and stock, track orders, and view sales
            transactions from one simple dashboard. Each store receives a public link
            that can be shared with customers, allowing them to browse products and
            make purchases without creating an account.
          </p>
          <p className="mt-4 text-stone-700">
            Customers can open a store link, explore available products, add items to
            their cart, and complete their purchase securely using card payments or
            digital wallet options such as Apple Pay, Google Pay, and Samsung Pay.
          </p>
          <p className="mt-4 text-stone-700">
            Whether you are managing one store or many, TajerLink gives you the tools
            to organize your products, simplify the buying process, and track your
            business performance in one place.
          </p>
          <p className="mt-6 text-lg font-semibold text-stone-900">
            Create. Share. Sell. Grow.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo imgClassName="h-12" />
          </div>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
