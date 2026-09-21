export const DEAL_CATEGORIES = [
  "raquettes",
  "cordages",
  "chaussures",
  "textile",
  "accessoires",
] as const;

export type CatalogCategoryFilter = (typeof DEAL_CATEGORIES)[number] | "all";

export function isValidCategory(value: string | undefined | null): value is CatalogCategoryFilter {
  if (!value) return false;
  return value === "all" || (DEAL_CATEGORIES as readonly string[]).includes(value);
}

export function sanitizeSearchQuery(value: string | undefined | null): string {
  return value?.trim() ?? "";
}
