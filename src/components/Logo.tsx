import Image from "next/image";
import Link from "next/link";

export function Logo({
  href = "/",
  className = "",
  imgClassName = "h-8",
}: {
  href?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-full.png"
        alt="TajerLink"
        width={1102}
        height={261}
        className={`w-auto ${imgClassName}`}
        priority
      />
    </Link>
  );
}
