"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileSelectButton } from "@/components/FileSelectButton";

export function BackgroundUpload({
  storeId,
  bannerUrl,
}: {
  storeId: string;
  bannerUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const path = `${storeId}/background-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("store-banners")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("store-banners")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("stores")
        .update({ banner_url: publicUrl.publicUrl })
        .eq("id", storeId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.refresh();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-28 overflow-hidden rounded-md border border-stone-200 bg-stone-50">
          {bannerUrl ? (
            <Image src={bannerUrl} alt="Background" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-400">
              No image
            </div>
          )}
        </div>

        <div>
          <FileSelectButton
            inputRef={fileInputRef}
            fileName={fileName}
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <p className="mt-1 text-sm text-stone-500">Uploading...</p>}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
