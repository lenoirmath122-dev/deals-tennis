export const DEAL_CATEGORIES = [
  "raquettes",
  "cordages",
  "chaussures",
  "textile",
  "accessoires",
] as const;

export type CatalogCategoryFilter = (typeof DEAL_CATEGORIES)[number] | "all";

export type CatalogSort = "newest" | "discount" | "price_asc" | "price_desc";

export const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "newest", label: "Nouveautés" },
  { value: "discount", label: "Plus forte réduction" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

export function isValidSort(value: string | undefined | null): value is CatalogSort {
  if (!value) return false;
  return SORT_OPTIONS.some((option) => option.value === value);
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "Toutes",
  raquettes: "Raquettes",
  cordages: "Cordages",
  chaussures: "Chaussures",
  textile: "Textile",
  accessoires: "Accessoires",
};

export function isValidCategory(value: string | undefined | null): value is CatalogCategoryFilter {
  if (!value) return false;
  return value === "all" || (DEAL_CATEGORIES as readonly string[]).includes(value);
}

export const GENDER_VALUES = ["homme", "femme", "mixte"] as const;

export type CatalogGenderFilter = (typeof GENDER_VALUES)[number] | "all";

export const GENDER_LABELS: Record<CatalogGenderFilter, string> = {
  all: "Tous",
  homme: "Homme",
  femme: "Femme",
  mixte: "Mixte",
};

export function isValidGender(value: string | undefined | null): value is CatalogGenderFilter {
  if (!value) return false;
  return value === "all" || (GENDER_VALUES as readonly string[]).includes(value);
}

export const AGE_GROUP_VALUES = ["adulte", "enfant"] as const;

export type CatalogAgeGroupFilter = (typeof AGE_GROUP_VALUES)[number] | "all";

export const AGE_GROUP_LABELS: Record<CatalogAgeGroupFilter, string> = {
  all: "Tous",
  adulte: "Adulte",
  enfant: "Enfant",
};

export function isValidAgeGroup(value: string | undefined | null): value is CatalogAgeGroupFilter {
  if (!value) return false;
  return value === "all" || (AGE_GROUP_VALUES as readonly string[]).includes(value);
}

export function sanitizeSearchQuery(value: string | undefined | null): string {
  return value?.trim() ?? "";
}
