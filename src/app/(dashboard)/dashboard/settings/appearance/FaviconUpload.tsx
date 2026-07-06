"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateFaviconUrl } from "../actions";
import { FileSelectButton } from "@/components/FileSelectButton";
import { t, type Lang } from "@/lib/i18n/translations";

export function FaviconUpload({
  storeId,
  faviconUrl,
  lang = "en",
}: {
  storeId: string;
  faviconUrl: string | null;
  lang?: Lang;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(faviconUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${storeId}/favicon-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("store-logos")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
      await updateFaviconUrl(data.publicUrl);
      setCurrentUrl(data.publicUrl);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    await updateFaviconUrl(null);
    setCurrentUrl(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{t(lang, "favicon_label")}</span>
      <p className="text-xs text-stone-500">{t(lang, "favicon_desc")}</p>

      <div className="flex items-center gap-4">
        <div className="relative h-10 w-10 overflow-hidden rounded border border-stone-200 bg-stone-50">
          {currentUrl ? (
            <Image src={currentUrl} alt="Favicon" fill className="object-contain" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-stone-400">
              ico
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <FileSelectButton
            inputRef={fileInputRef}
            fileName={fileName}
            accept="image/x-icon,image/png,image/svg+xml"
            lang={lang}
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-stone-500">{t(lang, "uploading_msg")}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {currentUrl && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="self-start text-xs text-red-500 underline hover:text-red-700"
            >
              {t(lang, "remove_btn")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
