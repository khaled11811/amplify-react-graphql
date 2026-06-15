"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FileSelectButton } from "@/components/FileSelectButton";
import type { ProductImage } from "@/types/database.types";

export function ProductImages({
  productId,
  storeId,
  images,
}: {
  productId: string;
  storeId: string;
  images: ProductImage[];
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
      const path = `${storeId}/${productId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      const maxSortOrder = images.reduce((max, img) => Math.max(max, img.sort_order), -1);

      const { error: insertError } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: publicUrl.publicUrl,
        sort_order: maxSortOrder + 1,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.refresh();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(image: ProductImage) {
    setError(null);
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    const path = image.image_url.split("/product-images/")[1];
    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }

    router.refresh();
  }

  async function handleSetPrimary(image: ProductImage) {
    if (image.sort_order === 0) return;
    setError(null);
    const supabase = createClient();

    const current = images.find((img) => img.sort_order === 0);

    await supabase.from("product_images").update({ sort_order: -1 }).eq("id", image.id);
    if (current) {
      await supabase
        .from("product_images")
        .update({ sort_order: image.sort_order })
        .eq("id", current.id);
    }
    await supabase.from("product_images").update({ sort_order: 0 }).eq("id", image.id);

    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => (
            <div key={image.id} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-stone-200">
                <Image
                  src={image.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                {image.sort_order === 0 && (
                  <span className="absolute left-1 top-1 rounded-full bg-[var(--store-primary)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                {image.sort_order !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image)}
                    className="text-stone-600 hover:text-stone-900"
                  >
                    Make primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-3">
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
  );
}
