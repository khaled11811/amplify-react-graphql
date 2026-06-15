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

  return (
    <div className="mt-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100">
        <Image
          src={active.image_url}
          alt={productName}
          fill
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                index === activeIndex ? "border-stone-900" : "border-stone-200"
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
