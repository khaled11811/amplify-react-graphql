"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type Lang } from "@/lib/i18n/translations";

export function LicenseDocUpload({
  storeId,
  field,
  currentUrl,
  label,
  required,
  lang,
}: {
  storeId: string;
  field: "trade_license_doc_url" | "vat_certificate_url";
  currentUrl: string | null;
  label: string;
  required?: boolean;
  lang: Lang;
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
      const path = `${storeId}/${field}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("store-documents")
        .upload(path, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("store-documents")
        .getPublicUrl(path);

      const update: Record<string, string> = { [field]: publicUrlData.publicUrl };
      const { error: updateError } = await supabase
        .from("stores")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(update as any)
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

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex flex-col gap-1" dir={dir}>
      <label className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ms-1 text-red-500">*</span>}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <label className={`cursor-pointer rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading
            ? (lang === "ar" ? "جارٍ الرفع…" : "Uploading…")
            : (lang === "ar" ? "رفع مستند" : "Upload document")}
        </label>

        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-600 hover:underline"
          >
            {lang === "ar" ? "عرض المستند الحالي ↗" : "View current document ↗"}
          </a>
        )}

        {!currentUrl && !uploading && (
          <span className="text-xs text-stone-400">
            {lang === "ar" ? "لم يتم الرفع بعد" : "Not uploaded yet"}
          </span>
        )}
      </div>

      {fileName && !uploading && (
        <p className="text-xs text-teal-700">✓ {fileName}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-stone-400">
        {lang === "ar" ? "PDF أو صورة (JPG، PNG)" : "PDF or image (JPG, PNG)"}
      </p>
    </div>
  );
}
