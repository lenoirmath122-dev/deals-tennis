import type { DealCardData } from "@/types/database";
import { formatDiscountBadge, formatFreshnessLabel, formatPrice } from "@/lib/format";
import { DealImage } from "@/components/deal-image";

export function DealCard({ deal }: { deal: DealCardData }) {
  const hasMultipleOffers = (deal.offer_count ?? 1) > 1;
  const href = hasMultipleOffers ? `/deal/${deal.id}` : `/go/${deal.id}`;
  const linkProps = hasMultipleOffers
    ? {}
    : { target: "_blank" as const, rel: "noopener noreferrer" };

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-card-border bg-white">
      <a href={href} {...linkProps} className="flex flex-1 flex-col">
        <div className="relative aspect-square bg-zinc-100">
          <DealImage src={deal.image_url} alt={deal.title} category={deal.category} />
          <span className="absolute left-2 top-2 rounded bg-discount px-2 py-1 text-xs font-semibold text-discount-foreground">
            {formatDiscountBadge(deal.discount_percentage)}
          </span>
          {hasMultipleOffers && (
            <span className="absolute right-2 top-2 rounded bg-zinc-900/80 px-2 py-1 text-xs font-semibold text-white">
              {deal.offer_count} offres
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{deal.brand}</p>
          <h2 className="line-clamp-2 text-sm font-medium text-zinc-900">{deal.title}</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-semibold text-accent">
              {formatPrice(deal.discounted_price)}
            </span>
            <span className="text-sm text-zinc-500 line-through">
              {formatPrice(deal.original_price)}
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-500">
            <span>{deal.merchant.name}</span>
            <span>{formatFreshnessLabel(deal.created_at, deal.expires_at)}</span>
          </div>
        </div>
      </a>
    </article>
  );
}
