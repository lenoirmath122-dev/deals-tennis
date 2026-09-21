import Link from "next/link";
import type { DealCardData } from "@/types/database";
import { DealCard } from "@/components/deal-card";

export function DealGrid({
  deals,
  hasActiveFilters = false,
}: {
  deals: DealCardData[];
  hasActiveFilters?: boolean;
}) {
  if (deals.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">
            Aucun bon plan ne correspond à ce filtre ou à cette recherche pour le
            moment.
          </p>
          <Link
            href="/"
            className="rounded px-3 py-1.5 text-sm font-medium text-zinc-900 underline hover:no-underline dark:text-zinc-50"
          >
            Réinitialiser les filtres
          </Link>
        </div>
      );
    }
    return (
      <p className="py-16 text-center text-zinc-500 dark:text-zinc-400">
        Aucun bon plan actif pour le moment. Revenez bientôt pour découvrir de
        nouvelles offres !
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}
