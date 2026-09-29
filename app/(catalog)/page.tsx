import type { Metadata } from "next";
import { getAccessorySubcategoriesWithDeals, getCatalogDeals } from "@/lib/deals";
import {
  isValidCategory,
  isValidSubcategory,
  isValidGender,
  isValidAgeGroup,
  isValidSort,
  sanitizeSearchQuery,
} from "@/lib/filters";
import { DealGrid } from "@/components/deal-grid";
import { Pagination } from "@/components/pagination";
import { CategoryFilter } from "@/components/category-filter";
import { GenderAgeFilter } from "@/components/gender-age-filter";
import { SubcategoryFilter } from "@/components/subcategory-filter";
import { SearchBar } from "@/components/search-bar";
import { SortDropdown } from "@/components/sort-dropdown";
import { NotificationBanner } from "@/components/notification-banner";
import { Hero } from "@/components/hero";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const rawCategory = typeof params.category === "string" ? params.category : "all";
  const category = isValidCategory(rawCategory) ? rawCategory : "all";
  const rawSubcategory = typeof params.subcategory === "string" ? params.subcategory : "all";
  const subcategory =
    category === "accessoires" && isValidSubcategory(rawSubcategory) ? rawSubcategory : "all";
  const rawGender = typeof params.gender === "string" ? params.gender : "all";
  const gender = isValidGender(rawGender) ? rawGender : "all";
  const rawAgeGroup = typeof params.age_group === "string" ? params.age_group : "all";
  const ageGroup = isValidAgeGroup(rawAgeGroup) ? rawAgeGroup : "all";
  const rawSort = typeof params.sort === "string" ? params.sort : "newest";
  const sort = isValidSort(rawSort) ? rawSort : "newest";
  const q = sanitizeSearchQuery(typeof params.q === "string" ? params.q : "");
  const page = Number(params.page) || 1;
  const notification = typeof params.notification === "string" ? params.notification : null;

  const [{ deals, pagination }, availableSubcategories] = await Promise.all([
    getCatalogDeals({
      category,
      subcategory,
      gender,
      age_group: ageGroup,
      sort,
      q,
      page,
    }),
    category === "accessoires"
      ? getAccessorySubcategoriesWithDeals()
      : Promise.resolve(new Set<string>()),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
      <Hero />

      <NotificationBanner
        type={notification}
        category={category}
        subcategory={subcategory}
        gender={gender}
        age_group={ageGroup}
        sort={sort}
        q={q}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-xs sm:flex-1">
          <SearchBar
            key={q}
            defaultValue={q}
            category={category}
            subcategory={subcategory}
            gender={gender}
            ageGroup={ageGroup}
            sort={sort}
          />
        </div>
        <SortDropdown
          value={sort}
          category={category}
          subcategory={subcategory}
          gender={gender}
          ageGroup={ageGroup}
          q={q}
        />
      </div>

      <div className="mb-4">
        <CategoryFilter active={category} gender={gender} ageGroup={ageGroup} sort={sort} q={q} />
      </div>

      {category === "accessoires" && (
        <div className="mb-4">
          <SubcategoryFilter
            category={category}
            subcategory={subcategory}
            available={availableSubcategories}
            gender={gender}
            ageGroup={ageGroup}
            sort={sort}
            q={q}
          />
        </div>
      )}

      <div className="mb-6">
        <GenderAgeFilter
          category={category}
          subcategory={subcategory}
          gender={gender}
          ageGroup={ageGroup}
          sort={sort}
          q={q}
        />
      </div>

      <DealGrid
        deals={deals}
        hasActiveFilters={
          category !== "all" ||
          subcategory !== "all" ||
          gender !== "all" ||
          ageGroup !== "all" ||
          q.length > 0
        }
      />
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        category={category}
        subcategory={subcategory}
        gender={gender}
        ageGroup={ageGroup}
        sort={sort}
        q={q}
      />
    </main>
  );
}
