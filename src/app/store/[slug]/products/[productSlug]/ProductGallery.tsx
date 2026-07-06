"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/database.types";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  function prev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="mt-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100">
        <Image
          key={active.id}
          src={active.image_url}
          alt={productName}
          fill
          className="object-cover animate-slide-in-fade"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border-2 transition ${
                index === activeIndex
                  ? "border-white shadow-md ring-1 ring-stone-300"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.image_url}
                alt={productName}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
