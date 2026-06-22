"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { FileSelectButton } from "@/components/FileSelectButton";
import { t, type Lang } from "@/lib/i18n/translations";

type StagedImage = { path: string; url: string };

export function NewProductImages({ storeId, productId, lang = "en" }: { storeId: string; productId: string; lang?: Lang }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<StagedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${storeId}/${productId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);

      setImages((prev) => [...prev, { path, url: publicUrl.publicUrl }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(image: StagedImage) {
    setError(null);
    const supabase = createClient();
    await supabase.storage.from("product-images").remove([image.path]);
    setImages((prev) => prev.filter((img) => img.path !== image.path));
  }

  function handleSetPrimary(image: StagedImage) {
    setImages((prev) => [image, ...prev.filter((img) => img.path !== image.path)]);
  }

  return (
    <div>
      <input type="hidden" name="product_id" value={productId} />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div key={image.path} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-stone-200">
                <Image src={image.url} alt="" fill className="object-cover" unoptimized />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-[var(--store-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {t(lang, "primary_badge")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image)}
                    className="text-stone-600 hover:text-stone-900"
                  >
                    {t(lang, "make_primary_btn")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(image)}
                  className="text-red-600 hover:text-red-800"
                >
                  {t(lang, "remove_btn")}
                </button>
              </div>
              <input type="hidden" name="image_url" value={image.url} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3">
        <FileSelectButton
          inputRef={fileInputRef}
          fileName={fileName}
          accept="image/*"
          lang={lang}
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && <p className="mt-1 text-sm text-stone-500">{t(lang, "uploading_msg")}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
