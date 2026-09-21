"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCatalogHref } from "@/lib/catalog-url";

const DEBOUNCE_MS = 300;

export function SearchBar({
  defaultValue,
  category,
  sort,
}: {
  defaultValue: string;
  category: string;
  sort: "newest" | "discount";
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      router.push(buildCatalogHref({ category, sort, q: next }));
    }, DEBOUNCE_MS);
  }

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      placeholder="Rechercher un modèle ou une marque…"
      aria-label="Rechercher un bon plan par modèle ou marque"
      className="w-full rounded-md border border-card-border bg-white px-3 py-1.5 text-sm text-zinc-900"
    />
  );
}
