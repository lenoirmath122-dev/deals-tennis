import type { DealCardData } from "@/types/database";
import { DealCard } from "@/components/deal-card";

export function DealGrid({ deals }: { deals: DealCardData[] }) {
  if (deals.length === 0) {
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
