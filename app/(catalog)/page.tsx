import { getCatalogDeals } from "@/lib/deals";
import { isValidCategory, sanitizeSearchQuery } from "@/lib/filters";
import { DealGrid } from "@/components/deal-grid";
import { Pagination } from "@/components/pagination";
import { CategoryFilter } from "@/components/category-filter";
import { SearchBar } from "@/components/search-bar";
import { SortDropdown } from "@/components/sort-dropdown";
import { NotificationBanner } from "@/components/notification-banner";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const rawCategory = typeof params.category === "string" ? params.category : "all";
  const category = isValidCategory(rawCategory) ? rawCategory : "all";
  const sort = params.sort === "discount" ? "discount" : "newest";
  const q = sanitizeSearchQuery(typeof params.q === "string" ? params.q : "");
  const page = Number(params.page) || 1;
  const notification = typeof params.notification === "string" ? params.notification : null;

  const { deals, pagination } = await getCatalogDeals({ category, sort, q, page });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Bons plans tennis</h1>

      <NotificationBanner type={notification} category={category} sort={sort} q={q} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchBar key={q} defaultValue={q} category={category} sort={sort} />
        </div>
        <SortDropdown value={sort} category={category} q={q} />
      </div>

      <div className="mb-6">
        <CategoryFilter active={category} sort={sort} q={q} />
      </div>

      <DealGrid deals={deals} hasActiveFilters={category !== "all" || q.length > 0} />
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        category={category}
        sort={sort}
        q={q}
      />
    </main>
  );
}
