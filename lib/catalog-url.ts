import type { CatalogSort } from "@/lib/filters";

export interface CatalogQueryState {
  category?: string;
  gender?: string;
  age_group?: string;
  sort?: CatalogSort;
  q?: string;
  page?: number;
}

export function buildCatalogHref(state: CatalogQueryState): string {
  const search = new URLSearchParams();

  if (state.category && state.category !== "all") {
    search.set("category", state.category);
  }
  if (state.gender && state.gender !== "all") {
    search.set("gender", state.gender);
  }
  if (state.age_group && state.age_group !== "all") {
    search.set("age_group", state.age_group);
  }
  if (state.sort && state.sort !== "newest") {
    search.set("sort", state.sort);
  }
  if (state.q && state.q.trim().length > 0) {
    search.set("q", state.q.trim());
  }
  if (state.page && state.page > 1) {
    search.set("page", String(state.page));
  }

  const query = search.toString();
  return query ? `/?${query}` : "/";
}
