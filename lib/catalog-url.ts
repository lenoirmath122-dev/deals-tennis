import type { CatalogSort } from "@/lib/filters";

export interface CatalogQueryState {
  category?: string;
  subcategory?: string;
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
  // La sous-catégorie n'existe que pour les accessoires : elle est abandonnée dès
  // qu'on change de catégorie (GAP-2026-09-25-11 étape 6).
  if (state.category === "accessoires" && state.subcategory && state.subcategory !== "all") {
    search.set("subcategory", state.subcategory);
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
