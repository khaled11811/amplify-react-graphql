import type { ContactInfo } from "@/types/database.types";
import { t, type Lang } from "@/lib/i18n/translations";

function digitsOnly(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.71-.84-1.97-.94-.27-.1-.46-.15-.66.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.15-1.21-.45-2.3-1.42-.85-.76-1.42-1.7-1.59-1.99-.17-.29-.02-.45.13-.6.15-.15.34-.39.5-.58.17-.2.22-.34.34-.56.12-.22.06-.41-.03-.56-.1-.15-.65-1.57-.9-2.15-.24-.58-.48-.5-.66-.5-.17 0-.37 0-.56 0-.2 0-.51.07-.78.36-.27.29-1.03 1.01-1.03 2.46s1.06 2.86 1.21 3.06c.15.2 2.06 3.15 5.04 4.29 2.98 1.13 2.98.76 3.52.71.54-.05 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34z" />
      <path d="M12 2a10 10 0 0 0-8.55 15.13L2 22l4.99-1.41A10 10 0 1 0 12 2zm0 18.18a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.08.87.86-3-.2-.31A8.18 8.18 0 1 1 12 20.18z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2 .2v.6l8 5.33 8-5.33V5.2L12 10.5zm16 2.61-7.45 4.96a1 1 0 0 1-1.1 0L4 7.81V19h16z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5zm10 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1-.39z" />
    </svg>
  );
}

function XTwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function StoreContact({ contactInfo, lang }: { contactInfo: ContactInfo; lang: Lang }) {
  const links: { label: string; href: string; icon: React.ReactNode }[] = [];

  if (contactInfo.phone_number) {
    links.push({
      label: `Call ${contactInfo.phone_number}`,
      href: `tel:${digitsOnly(contactInfo.phone_number)}`,
      icon: <PhoneIcon />,
    });
  }
  if (contactInfo.whatsapp_number) {
    links.push({
      label: "WhatsApp",
      href: `https://wa.me/${digitsOnly(contactInfo.whatsapp_number).replace(/^\+/, "")}`,
      icon: <WhatsAppIcon />,
    });
  }
  if (contactInfo.business_email) {
    links.push({
      label: contactInfo.business_email,
      href: `mailto:${contactInfo.business_email}`,
      icon: <EmailIcon />,
    });
  }
  if (contactInfo.instagram) {
    links.push({
      label: `@${contactInfo.instagram.replace(/^@/, "")}`,
      href: `https://instagram.com/${contactInfo.instagram.replace(/^@/, "")}`,
      icon: <InstagramIcon />,
    });
  }
  if (contactInfo.facebook) {
    links.push({
      label: contactInfo.facebook,
      href: contactInfo.facebook.startsWith("http")
        ? contactInfo.facebook
        : `https://facebook.com/${contactInfo.facebook}`,
      icon: <FacebookIcon />,
    });
  }
  if (contactInfo.tiktok) {
    const handle = contactInfo.tiktok.replace(/^@/, "");
    links.push({
      label: `@${handle}`,
      href: `https://tiktok.com/@${handle}`,
      icon: <TikTokIcon />,
    });
  }
  if (contactInfo.x_twitter) {
    const handle = contactInfo.x_twitter.replace(/^@/, "");
    links.push({
      label: `@${handle}`,
      href: `https://x.com/${handle}`,
      icon: <XTwitterIcon />,
    });
  }
  if (contactInfo.website) {
    links.push({
      label: contactInfo.website.replace(/^https?:\/\//, ""),
      href: contactInfo.website.startsWith("http")
        ? contactInfo.website
        : `https://${contactInfo.website}`,
      icon: <WebsiteIcon />,
    });
  }

  if (links.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-medium text-stone-900">{t(lang, "contact_us_heading")}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-[var(--store-primary)] hover:text-white"
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
