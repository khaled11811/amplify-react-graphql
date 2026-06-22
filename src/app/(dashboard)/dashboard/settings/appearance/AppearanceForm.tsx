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
  type StoreBackgroundType,
  type StoreFont,
} from "@/lib/theme";
import { useActionToast } from "@/lib/toast/useActionToast";
import { t, type Lang } from "@/lib/i18n/translations";
import { updateStoreAppearance } from "../actions";
import { BackgroundUpload } from "./BackgroundUpload";

export function AppearanceForm({
  storeId,
  description,
  theme,
  headerColor,
  font,
  backgroundType,
  backgroundValue,
  bannerUrl,
  storeLang,
  lang,
}: {
  storeId: string;
  description: string | null;
  theme: string;
  headerColor: string;
  font: StoreFont;
  backgroundType: StoreBackgroundType;
  backgroundValue: string | null;
  bannerUrl: string | null;
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
