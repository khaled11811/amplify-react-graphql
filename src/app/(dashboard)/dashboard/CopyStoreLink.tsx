"use client";

import { useEffect, useState } from "react";

export function CopyStoreLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/store/${slug}`;
  const [url, setUrl] = useState(path);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied; user can still select and copy the link text manually.
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="text-stone-600">Your store link:</span>
      <a
        href={path}
        target="_blank"
        className="flex-1 truncate font-medium text-amber-800 hover:underline"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-md bg-amber-800 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
