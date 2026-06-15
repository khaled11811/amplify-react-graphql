"use client";

type FileSelectButtonProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string | null;
  disabled?: boolean;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FileSelectButton({ inputRef, fileName, disabled, accept, onChange }: FileSelectButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50"
      >
        Choose file
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
      />
      <span className="truncate text-sm text-stone-600">{fileName ?? "No file selected"}</span>
    </div>
  );
}
