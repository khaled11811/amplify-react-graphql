export const DEFAULT_THEME_COLOR = "#92400e";

/** Darkens (or lightens, for negative amounts) a hex color by the given amount per channel. */
function shadeColor(hexColor: string, amount: number): string {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return hexColor;

  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const r = clamp(parseInt(hex.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(hex.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(hex.slice(4, 6), 16) + amount);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function themeStyle(primaryColor: string): React.CSSProperties {
  return {
    "--store-primary": primaryColor,
    "--store-primary-hover": shadeColor(primaryColor, -24),
  } as React.CSSProperties;
}

/** Returns black or white, whichever is more readable against the given hex color. */
export function getContrastTextColor(hexColor: string): "#000000" | "#ffffff" {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#000000";

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export const STORE_BACKGROUND_TYPES = ["none", "color", "preset", "image"] as const;

export type StoreBackgroundType = (typeof STORE_BACKGROUND_TYPES)[number];

export function isStoreBackgroundType(value: string): value is StoreBackgroundType {
  return (STORE_BACKGROUND_TYPES as readonly string[]).includes(value);
}

export const PRESET_BACKGROUNDS = [
  { id: "preset-1", url: "/backgrounds/preset-1.png", label: "Golden Arabesque" },
  { id: "preset-2", url: "/backgrounds/preset-2.png", label: "Rose Petals" },
  { id: "preset-3", url: "/backgrounds/preset-3.png", label: "Aqua Breeze" },
  { id: "preset-4", url: "/backgrounds/preset-4.png", label: "Cream Silk" },
  { id: "preset-5", url: "/backgrounds/preset-5.png", label: "Midnight Gold" },
] as const;

export const LATIN_STORE_FONTS = ["sans", "serif", "rounded"] as const;
export const ARABIC_STORE_FONTS = ["tajawal", "cairo", "amiri"] as const;
export const STORE_FONTS = [...LATIN_STORE_FONTS, ...ARABIC_STORE_FONTS] as const;

export type StoreFont = (typeof STORE_FONTS)[number];

export const FONT_LABELS: Record<StoreFont, string> = {
  sans: "Modern (Sans)",
  serif: "Elegant (Serif)",
  rounded: "Friendly (Rounded)",
  tajawal: "حديث (Tajawal)",
  cairo: "ودود (Cairo)",
  amiri: "أنيق (Amiri)",
};

export function isStoreFont(value: string): value is StoreFont {
  return (STORE_FONTS as readonly string[]).includes(value);
}

export const STORE_BUTTON_SHAPES = ["rounded", "pill", "square"] as const;
export type StoreButtonShape = (typeof STORE_BUTTON_SHAPES)[number];

export const BUTTON_SHAPE_LABELS: Record<StoreButtonShape, string> = {
  rounded: "Rounded",
  pill: "Pill",
  square: "Square",
};

const BUTTON_SHAPE_RADIUS: Record<StoreButtonShape, string> = {
  rounded: "0.375rem",
  pill: "9999px",
  square: "0",
};

export function buttonShapeStyle(shape: string): React.CSSProperties {
  const radius = BUTTON_SHAPE_RADIUS[shape as StoreButtonShape] ?? BUTTON_SHAPE_RADIUS.rounded;
  return { "--store-btn-radius": radius } as React.CSSProperties;
}

export const STORE_CARD_STYLES = ["grid", "list"] as const;
export type StoreCardStyle = (typeof STORE_CARD_STYLES)[number];

export function backgroundStyle(store: {
  background_type: StoreBackgroundType;
  background_value: string | null;
  banner_url: string | null;
}): React.CSSProperties | undefined {
  switch (store.background_type) {
    case "color":
      return store.background_value ? { backgroundColor: store.background_value } : undefined;
    case "preset": {
      const preset = PRESET_BACKGROUNDS.find((p) => p.id === store.background_value);
      if (!preset) return undefined;
      return {
        backgroundImage: `url(${preset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }
    case "image":
      if (!store.banner_url) return undefined;
      return {
        backgroundImage: `url(${store.banner_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    default:
      return undefined;
  }
}
