"use client";

import { useState } from "react";
import type { DealCategory } from "@/types/database";

const CATEGORY_PLACEHOLDERS: Record<DealCategory, string> = {
  raquettes: "/placeholders/raquettes.svg",
  cordages: "/placeholders/cordages.svg",
  chaussures: "/placeholders/chaussures.svg",
  textile: "/placeholders/textile.svg",
  accessoires: "/placeholders/accessoires.svg",
};

export function DealImage({
  src,
  alt,
  category,
}: {
  src: string;
  alt: string;
  category: DealCategory;
}) {
  const fallback = CATEGORY_PLACEHOLDERS[category] ?? "/placeholders/default.svg";
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}
