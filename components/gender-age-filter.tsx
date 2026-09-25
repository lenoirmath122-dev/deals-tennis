import Link from "next/link";
import {
  GENDER_LABELS,
  GENDER_VALUES,
  AGE_GROUP_LABELS,
  AGE_GROUP_VALUES,
  type CatalogSort,
} from "@/lib/filters";
import { buildCatalogHref } from "@/lib/catalog-url";

function FilterPills({
  label,
  ariaLabel,
  values,
  labels,
  active,
  buildHref,
}: {
  label: string;
  ariaLabel: string;
  values: readonly string[];
  labels: Record<string, string>;
  active: string;
  buildHref: (value: string) => string;
}) {
  const options = ["all", ...values];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-zinc-500">{label}</span>
      <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-2">
        {options.map((value) => {
          const isActive = value === active;
          return (
            <Link
              key={value}
              href={buildHref(value)}
              role="tab"
              aria-selected={isActive}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {labels[value]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function GenderAgeFilter({
  category,
  gender,
  ageGroup,
  sort,
  q,
}: {
  category: string;
  gender: string;
  ageGroup: string;
  sort: CatalogSort;
  q: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
      <FilterPills
        label="Sexe"
        ariaLabel="Filtrer par sexe"
        values={GENDER_VALUES}
        labels={GENDER_LABELS}
        active={gender}
        buildHref={(value) => buildCatalogHref({ category, gender: value, age_group: ageGroup, sort, q })}
      />
      <FilterPills
        label="Âge"
        ariaLabel="Filtrer par âge"
        values={AGE_GROUP_VALUES}
        labels={AGE_GROUP_LABELS}
        active={ageGroup}
        buildHref={(value) => buildCatalogHref({ category, gender, age_group: value, sort, q })}
      />
    </div>
  );
}
