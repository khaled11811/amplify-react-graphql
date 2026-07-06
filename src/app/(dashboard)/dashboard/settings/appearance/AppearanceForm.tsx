"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  DEFAULT_THEME_COLOR,
  STORE_BACKGROUND_TYPES,
  PRESET_BACKGROUNDS,
  LATIN_STORE_FONTS,
  ARABIC_STORE_FONTS,
  FONT_LABELS,
  STORE_BUTTON_SHAPES,
  STORE_CARD_STYLES,
  STORE_SORT_OPTIONS,
  type StoreBackgroundType,
  type StoreFont,
  type StoreButtonShape,
  type StoreSortOption,
} from "@/lib/theme";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateStoreAppearance } from "../actions";
import { BackgroundUpload } from "./BackgroundUpload";

export function AppearanceForm({
  storeId,
  description,
  footerText,
  theme,
  headerColor,
  font,
  backgroundType,
  backgroundValue,
  bannerUrl,
  buttonShape,
  productCardStyle,
  productsPerRow,
  announcementTexts,
  announcementColor,
  announcementActive,
  productSortDefault,
  storeLang,
  lang,
}: {
  storeId: string;
  description: string | null;
  footerText: string | null;
  theme: string;
  headerColor: string;
  font: StoreFont;
  backgroundType: StoreBackgroundType;
  backgroundValue: string | null;
  bannerUrl: string | null;
  buttonShape: string;
  productCardStyle: string;
  productsPerRow: number;
  announcementTexts: string[];
  announcementColor: string;
  announcementActive: boolean;
  productSortDefault: string;
  storeLang: Lang;
  lang: Lang;
}) {
  const [state, formAction, pending] = useActionState(updateStoreAppearance, undefined);
  useActionToast(state, t(lang, "toast_appearance_saved"));
  const [selectedTheme, setSelectedTheme] = useState(theme || DEFAULT_THEME_COLOR);
  const [selectedHeaderColor, setSelectedHeaderColor] = useState(headerColor || "#ffffff");
  const availableFonts = storeLang === "ar" ? ARABIC_STORE_FONTS : LATIN_STORE_FONTS;
  const defaultFont: StoreFont =
    (availableFonts as readonly string[]).includes(font)
      ? font
      : storeLang === "ar"
        ? "tajawal"
        : "sans";
  const [selectedFont, setSelectedFont] = useState<StoreFont>(defaultFont);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState<StoreBackgroundType>(backgroundType);
  const [backgroundColor, setBackgroundColor] = useState(
    backgroundType === "color" && backgroundValue ? backgroundValue : "#fafaf9"
  );
  const [selectedPreset, setSelectedPreset] = useState(
    backgroundType === "preset" ? backgroundValue ?? PRESET_BACKGROUNDS[0].id : PRESET_BACKGROUNDS[0].id
  );
  const [selectedButtonShape, setSelectedButtonShape] = useState<StoreButtonShape>(
    (STORE_BUTTON_SHAPES as readonly string[]).includes(buttonShape) ? buttonShape as StoreButtonShape : "rounded"
  );
  const [selectedCardStyle, setSelectedCardStyle] = useState(
    (STORE_CARD_STYLES as readonly string[]).includes(productCardStyle) ? productCardStyle : "grid"
  );
  const [selectedPerRow, setSelectedPerRow] = useState(productsPerRow ?? 3);
  const [announcementOn, setAnnouncementOn] = useState(announcementActive);
  const [announcements, setAnnouncements] = useState<string[]>(announcementTexts);
  const [announcementBgColor, setAnnouncementBgColor] = useState(announcementColor || "#000000");
  const [selectedSort, setSelectedSort] = useState<StoreSortOption>(
    (STORE_SORT_OPTIONS as readonly string[]).includes(productSortDefault)
      ? productSortDefault as StoreSortOption
      : "newest"
  );

  const BG_LABELS: Record<StoreBackgroundType, string> = {
    none: t(lang, "bg_none"),
    color: t(lang, "bg_solid_color"),
    preset: t(lang, "bg_preset"),
    image: t(lang, "bg_upload"),
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          {t(lang, "store_description_label")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={description ?? ""}
          placeholder={t(lang, "store_description_placeholder")}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="footer_text" className="text-sm font-medium">
          {t(lang, "footer_tagline_label")}
        </label>
        <p className="text-xs text-stone-500">{t(lang, "footer_tagline_desc")}</p>
        <input
          id="footer_text"
          name="footer_text"
          type="text"
          maxLength={200}
          defaultValue={footerText ?? ""}
          placeholder={t(lang, "footer_tagline_placeholder")}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "header_bar_color_label")}</span>
        <p className="text-xs text-stone-500">{t(lang, "header_bar_color_desc")}</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="header_color"
            value={selectedHeaderColor}
            onChange={(e) => setSelectedHeaderColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-stone-300"
          />
          <span className="text-sm text-stone-600">{selectedHeaderColor}</span>
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "color_theme_label")}</span>
        <p className="text-xs text-stone-500">{t(lang, "color_theme_desc")}</p>
        <div className="flex items-center gap-3">
          <input
            type="color"
            name="theme"
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded-md border border-stone-300"
          />
          <span className="text-sm text-stone-600">{selectedTheme}</span>
        </div>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <label htmlFor="font" className="text-sm font-medium">
          {t(lang, "storefront_font_label")}
        </label>
        <select
          id="font"
          name="font"
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value as StoreFont)}
          className="max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          {availableFonts.map((option) => (
            <option key={option} value={option}>
              {FONT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "storefront_bg_label")}</span>
        <input type="hidden" name="background_type" value={selectedBackgroundType} />
        <div className="flex flex-wrap gap-3">
          {STORE_BACKGROUND_TYPES.map((option) => {
            const isSelected = option === selectedBackgroundType;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedBackgroundType(option)}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                {BG_LABELS[option]}
              </button>
            );
          })}
        </div>

        {selectedBackgroundType === "color" && (
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              name="background_color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-md border border-stone-300"
            />
            <span className="text-sm text-stone-600">{backgroundColor}</span>
          </div>
        )}

        {selectedBackgroundType === "preset" && (
          <div className="mt-2 flex flex-wrap gap-3">
            <input type="hidden" name="background_preset" value={selectedPreset} />
            {PRESET_BACKGROUNDS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`relative h-16 w-28 overflow-hidden rounded-md border-2 transition-colors ${
                  selectedPreset === preset.id ? "border-stone-900" : "border-stone-200 hover:border-stone-300"
                }`}
                title={preset.label}
              >
                <Image src={preset.url} alt={preset.label} fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}

        {selectedBackgroundType === "image" && (
          <div className="mt-2">
            <BackgroundUpload storeId={storeId} bannerUrl={bannerUrl} lang={lang} />
          </div>
        )}
      </div>

      <hr className="border-stone-200" />

      {/* Button shape */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "button_shape_label")}</span>
        <p className="text-xs text-stone-500">{t(lang, "button_shape_desc")}</p>
        <input type="hidden" name="button_shape" value={selectedButtonShape} />
        <div className="flex flex-wrap gap-3">
          {STORE_BUTTON_SHAPES.map((shape) => {
            const radiusPreview = shape === "pill" ? "9999px" : shape === "square" ? "0" : "6px";
            const shapeLabel = shape === "rounded"
              ? t(lang, "btn_shape_rounded")
              : shape === "pill"
                ? t(lang, "btn_shape_pill")
                : t(lang, "btn_shape_square");
            return (
              <button
                key={shape}
                type="button"
                onClick={() => setSelectedButtonShape(shape)}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  selectedButtonShape === shape
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <span
                  className="inline-block h-6 w-14 bg-stone-400 text-xs"
                  style={{ borderRadius: radiusPreview }}
                />
                {shapeLabel}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-stone-200" />

      {/* Product card style */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t(lang, "card_style_label")}</span>
        <p className="text-xs text-stone-500">{t(lang, "card_style_desc")}</p>
        <input type="hidden" name="product_card_style" value={selectedCardStyle} />
        <div className="flex flex-wrap gap-3">
          {STORE_CARD_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedCardStyle(style)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                selectedCardStyle === style
                  ? "border-stone-900 bg-stone-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              {style === "grid" ? t(lang, "card_style_grid") : t(lang, "card_style_list")}
            </button>
          ))}
        </div>
      </div>

      {selectedCardStyle === "grid" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t(lang, "products_per_row_label")}</span>
          <p className="text-xs text-stone-500">{t(lang, "products_per_row_desc")}</p>
          <input type="hidden" name="products_per_row" value={selectedPerRow} />
          <div className="flex gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedPerRow(n)}
                className={`h-9 w-12 rounded-md border text-sm font-medium transition-colors ${
                  selectedPerRow === n
                    ? "border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCardStyle === "list" && (
        <input type="hidden" name="products_per_row" value={selectedPerRow} />
      )}

      <hr className="border-stone-200" />

      {/* Announcement banner + product sort — grouped */}
      <div className="flex flex-col gap-6 rounded-lg border border-stone-200 p-4">

        {/* Announcement banner */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">{t(lang, "announcement_label")}</span>
          <p className="text-xs text-stone-500">{t(lang, "announcement_desc")}</p>
          <input type="hidden" name="announcement_active" value={String(announcementOn)} />
          <input type="hidden" name="announcement_texts" value={JSON.stringify(announcements)} />
          <input type="hidden" name="announcement_color" value={announcementBgColor} />

          {/* Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={announcementOn}
              onClick={() => setAnnouncementOn((v: boolean) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                announcementOn ? "bg-teal-600" : "bg-stone-300"
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                announcementOn ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
            <span className="text-sm text-stone-600">{t(lang, "announcement_active_label")}</span>
          </div>

          {/* Bar color */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-600">{t(lang, "announcement_color_label")}</span>
            <input
              type="color"
              value={announcementBgColor}
              onChange={(e) => setAnnouncementBgColor(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-md border border-stone-300"
            />
            <span className="text-xs text-stone-500">{announcementBgColor}</span>
            {/* Live preview strip */}
            <span
              className="flex-1 rounded-md px-3 py-1 text-xs font-medium truncate"
              style={{
                backgroundColor: announcementBgColor,
                color: "#ffffff",
                textShadow: "0 0 4px rgba(0,0,0,0.4)",
              }}
            >
              {announcements[0] || "Preview"}
            </span>
          </div>

          {/* Announcement items */}
          <div className="flex flex-col gap-2">
            {announcements.map((text, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={text}
                    maxLength={120}
                    placeholder={t(lang, "announcement_item_placeholder")}
                    onChange={(e) => {
                      const next = [...announcements];
                      next[i] = e.target.value;
                      setAnnouncements(next);
                    }}
                    className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setAnnouncements(announcements.filter((_, j) => j !== i))}
                    className="rounded-md border border-stone-200 px-2 py-2 text-xs text-stone-500 hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    {t(lang, "announcement_remove_btn")}
                  </button>
                </div>
                <p className={`text-xs text-right ${text.length > 110 ? "text-amber-600" : "text-stone-400"}`}>
                  {text.length}/120
                </p>
              </div>
            ))}

            {announcements.length < 5 ? (
              <button
                type="button"
                onClick={() => setAnnouncements([...announcements, ""])}
                className="self-start rounded-md border border-dashed border-stone-300 px-3 py-2 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors"
              >
                + {t(lang, "announcement_add_btn")}
              </button>
            ) : (
              <p className="text-xs text-stone-500">{t(lang, "announcement_max_reached")}</p>
            )}
          </div>
        </div>

        <hr className="border-stone-200" />

        {/* Product sort default */}
        <div className="flex flex-col gap-2">
          <label htmlFor="product_sort_default" className="text-sm font-medium">{t(lang, "product_sort_label")}</label>
          <p className="text-xs text-stone-500">{t(lang, "product_sort_desc")}</p>
          <select
            id="product_sort_default"
            name="product_sort_default"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as StoreSortOption)}
            className="max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
          >
            {STORE_SORT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(lang, `sort_${opt}` as Parameters<typeof t>[1])}
              </option>
            ))}
          </select>
        </div>

      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
      >
        {pending ? t(lang, "saving_btn") : t(lang, "save_btn")}
      </button>
    </form>
  );
}


