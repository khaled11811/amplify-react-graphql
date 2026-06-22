"use client";

import { t, type Lang } from "@/lib/i18n/translations";

type FileSelectButtonProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string | null;
  disabled?: boolean;
  accept?: string;
  lang?: Lang;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FileSelectButton({ inputRef, fileName, disabled, accept, lang = "en", onChange }: FileSelectButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50"
      >
        {t(lang, "choose_file_btn")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
      <span className="truncate text-sm text-stone-600">{fileName ?? t(lang, "no_file_selected")}</span>
    </div>
  );
}
