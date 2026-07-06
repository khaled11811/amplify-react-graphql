"use client";

import { useEffect, useState } from "react";

export function BackToTop({ dir }: { dir?: "ltr" | "rtl" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      style={{ [dir === "rtl" ? "left" : "right"]: "1.5rem" }}
      className="fixed bottom-24 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-stone-700/80 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-stone-900 hover:scale-110"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
