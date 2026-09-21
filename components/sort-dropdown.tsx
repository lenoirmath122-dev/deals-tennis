"use client";

import { useRouter } from "next/navigation";
import { buildCatalogHref } from "@/lib/catalog-url";

export function SortDropdown({
  value,
  category,
  q,
}: {
  value: "newest" | "discount";
  category: string;
  q: string;
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) =>
        router.push(
          buildCatalogHref({ category, q, sort: event.target.value as "newest" | "discount" })
        )
      }
      aria-label="Trier les offres"
      className="rounded border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <option value="newest">Nouveautés</option>
      <option value="discount">Plus forte réduction</option>
    </select>
  );
}
