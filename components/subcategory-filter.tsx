import {
  OTHER_ACCESSORIES,
  SUBCATEGORY_LABELS,
  SUBCATEGORY_VALUES,
  type CatalogSort,
} from "@/lib/filters";
import { buildCatalogHref } from "@/lib/catalog-url";
import { FilterPills } from "@/components/gender-age-filter";

/**
 * Filtre secondaire des accessoires (GAP-2026-09-25-11 étape 6) : visible seulement
 * quand la catégorie « Accessoires » est sélectionnée. Ne propose que les sous-catégories
 * qui ont des offres visibles ; « Autres accessoires » couvre `subcategory IS NULL`.
 */
export function SubcategoryFilter({
  category,
  subcategory,
  available,
  gender,
  ageGroup,
  sort,
  q,
}: {
  category: string;
  subcategory: string;
  available: ReadonlySet<string>;
  gender: string;
  ageGroup: string;
  sort: CatalogSort;
  q: string;
}) {
  if (category !== "accessoires") {
    return null;
  }

  const values = [...SUBCATEGORY_VALUES, OTHER_ACCESSORIES].filter(
    (value) => available.has(value) || value === subcategory
  );

  return (
    <FilterPills
      label="Type"
      ariaLabel="Filtrer par type d'accessoire"
      values={values}
      labels={SUBCATEGORY_LABELS}
      active={subcategory}
      buildHref={(value) =>
        buildCatalogHref({ category, subcategory: value, gender, age_group: ageGroup, sort, q })
      }
    />
  );
}
