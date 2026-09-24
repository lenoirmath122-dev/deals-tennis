"use client";

import { useRouter } from "next/navigation";
import { buildCatalogHref } from "@/lib/catalog-url";
import { SORT_OPTIONS, type CatalogSort } from "@/lib/filters";

export function SortDropdown({
  value,
  category,
  q,
}: {
  value: CatalogSort;
  category: string;
  q: string;
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) =>
        router.push(buildCatalogHref({ category, q, sort: event.target.value as CatalogSort }))
      }
      aria-label="Trier les offres"
      className="rounded-md border border-card-border bg-white px-3 py-1.5 text-sm text-zinc-900"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
