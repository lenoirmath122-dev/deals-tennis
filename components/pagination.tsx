import Link from "next/link";
import { buildCatalogHref } from "@/lib/catalog-url";
import type { CatalogSort } from "@/lib/filters";

function buildPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let previous: number | null = null;
  for (const page of sorted) {
    if (previous !== null && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
    previous = page;
  }
  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  category,
  gender,
  ageGroup,
  sort,
  q,
}: {
  currentPage: number;
  totalPages: number;
  category: string;
  gender: string;
  ageGroup: string;
  sort: CatalogSort;
  q: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 py-8">
      <Link
        href={buildCatalogHref({ category, gender, age_group: ageGroup, sort, q, page: currentPage - 1 })}
        aria-disabled={currentPage <= 1}
        className={`rounded-md px-3 py-1.5 text-sm ${
          currentPage <= 1
            ? "pointer-events-none text-zinc-300"
            : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        Précédent
      </Link>

      {pageNumbers.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-zinc-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildCatalogHref({ category, gender, age_group: ageGroup, sort, q, page })}
            aria-current={page === currentPage ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm ${
              page === currentPage
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildCatalogHref({ category, gender, age_group: ageGroup, sort, q, page: currentPage + 1 })}
        aria-disabled={currentPage >= totalPages}
        className={`rounded-md px-3 py-1.5 text-sm ${
          currentPage >= totalPages
            ? "pointer-events-none text-zinc-300"
            : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        Suivant
      </Link>
    </nav>
  );
}
