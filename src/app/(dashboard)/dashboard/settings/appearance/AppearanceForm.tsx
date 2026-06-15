"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  DEFAULT_THEME_COLOR,
  STORE_BACKGROUND_TYPES,
  PRESET_BACKGROUNDS,
  STORE_FONTS,
  FONT_LABELS,
  type StoreBackgroundType,
  type StoreFont,
} from "@/lib/theme";
import { useActionToast } from "@/lib/toast/useActionToast";
import { updateStoreAppearance } from "../actions";
import { BackgroundUpload } from "./BackgroundUpload";

const BACKGROUND_TYPE_LABELS: Record<StoreBackgroundType, string> = {
  none: "None (white)",
  color: "Solid color",
  preset: "Preset image",
  image: "Upload image",
};

export function AppearanceForm({
  storeId,
  description,
  theme,
  headerColor,
  font,
  backgroundType,
  backgroundValue,
  bannerUrl,
}: {
  storeId: string;
  description: string | null;
  theme: string;
  headerColor: string;
  font: StoreFont;
  backgroundType: StoreBackgroundType;
  backgroundValue: string | null;
  bannerUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateStoreAppearance, undefined);
  useActionToast(state, "Appearance settings saved.");
  const [selectedTheme, setSelectedTheme] = useState(theme || DEFAULT_THEME_COLOR);
  const [selectedHeaderColor, setSelectedHeaderColor] = useState(headerColor || "#ffffff");
  const [selectedFont, setSelectedFont] = useState<StoreFont>(font);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState<StoreBackgroundType>(backgroundType);
  const [backgroundColor, setBackgroundColor] = useState(
    backgroundType === "color" && backgroundValue ? backgroundValue : "#fafaf9"
  );
  const [selectedPreset, setSelectedPreset] = useState(
    backgroundType === "preset" ? backgroundValue ?? PRESET_BACKGROUNDS[0].id : PRESET_BACKGROUNDS[0].id
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Store description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={description ?? ""}
          placeholder="Tell customers about your store..."
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        />
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Header bar color</span>
        <p className="text-xs text-stone-500">
          Sets the color of the top bar on your storefront. The shop name and cart text will
          automatically switch to black or white for readability. Default is white.
        </p>
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
        <span className="text-sm font-medium">Color theme</span>
        <p className="text-xs text-stone-500">
          Sets the accent color used for buttons, links, and highlights across your storefront.
        </p>
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
          Storefront font
        </label>
        <select
          id="font"
          name="font"
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value as StoreFont)}
          className="max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          {STORE_FONTS.map((option) => (
            <option key={option} value={option}>
              {FONT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-stone-200" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Storefront background</span>
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
                {BACKGROUND_TYPE_LABELS[option]}
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
            <BackgroundUpload storeId={storeId} bannerUrl={bannerUrl} />
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--store-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
