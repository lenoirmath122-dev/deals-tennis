import type { DealCardData } from "@/types/database";
import { formatDiscountBadge, formatFreshnessLabel, formatPrice } from "@/lib/format";

export function DealCard({ deal }: { deal: DealCardData }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
      <a
        href={`/go/${deal.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deal.image_url}
            alt={deal.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
            {formatDiscountBadge(deal.discount_percentage)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {deal.brand}
          </p>
          <h2 className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {deal.title}
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {formatPrice(deal.discounted_price)}
            </span>
            <span className="text-sm text-zinc-500 line-through dark:text-zinc-400">
              {formatPrice(deal.original_price)}
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{deal.merchant.name}</span>
            <span>{formatFreshnessLabel(deal.created_at, deal.expires_at)}</span>
          </div>
        </div>
      </a>
    </article>
  );
}
