import Link from "next/link";
import { CATEGORY_LABELS, DEAL_CATEGORIES, type CatalogSort } from "@/lib/filters";
import { buildCatalogHref } from "@/lib/catalog-url";

export function CategoryFilter({
  active,
  sort,
  q,
}: {
  active: string;
  sort: CatalogSort;
  q: string;
}) {
  const categories: string[] = ["all", ...DEAL_CATEGORIES];

  return (
    <div
      role="tablist"
      aria-label="Filtrer par catégorie"
      className="flex gap-2 overflow-x-auto pb-1"
    >
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <Link
            key={category}
            href={buildCatalogHref({ category, sort, q })}
            role="tab"
            aria-selected={isActive}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </Link>
        );
      })}
    </div>
  );
}
