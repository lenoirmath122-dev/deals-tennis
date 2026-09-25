"use client";

import { useRouter } from "next/navigation";
import { buildCatalogHref, type CatalogQueryState } from "@/lib/catalog-url";

const MESSAGES: Record<string, string> = {
  "deal-expired": "Ce bon plan vient d'expirer et n'est plus disponible.",
  "deal-not-found": "Ce bon plan est introuvable, il a peut-être été retiré.",
};

export function NotificationBanner({
  type,
  category,
  gender,
  age_group,
  sort,
  q,
  page,
}: {
  type: string | null;
} & CatalogQueryState) {
  const router = useRouter();

  if (!type || !(type in MESSAGES)) {
    return null;
  }

  function handleDismiss() {
    router.replace(buildCatalogHref({ category, gender, age_group, sort, q, page }));
  }

  return (
    <div
      role="status"
      className="mb-4 flex items-start justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
    >
      <span>{MESSAGES[type]}</span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fermer la notification"
        className="shrink-0 text-amber-700 hover:text-amber-900"
      >
        ✕
      </button>
    </div>
  );
}
