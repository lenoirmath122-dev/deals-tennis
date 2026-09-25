import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getDealDetail } from "@/lib/deals";
import { formatDiscountBadge, formatFreshnessLabel, formatPrice } from "@/lib/format";
import { DealImage } from "@/components/deal-image";
import { CATEGORY_LABELS } from "@/lib/filters";
import { SITE_URL } from "@/lib/site";
import type { DealCardData } from "@/types/database";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadDeal(dealId: string) {
  if (!UUID_REGEX.test(dealId)) {
    redirect("/?notification=deal-not-found");
  }

  const detail = await getDealDetail(dealId);
  if (detail === "not-found") {
    redirect("/?notification=deal-not-found");
  }
  if (detail === "expired") {
    redirect("/?notification=deal-expired");
  }

  return detail;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dealId: string }>;
}): Promise<Metadata> {
  const { dealId } = await params;
  if (!UUID_REGEX.test(dealId)) {
    return {};
  }
  const detail = await getDealDetail(dealId);
  if (typeof detail === "string") {
    return {};
  }
  return { title: detail.deal.title };
}

function buildProductJsonLd(deal: DealCardData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: deal.title,
    image: [deal.image_url],
    brand: {
      "@type": "Brand",
      name: deal.brand,
    },
    category: CATEGORY_LABELS[deal.category] ?? deal.category,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/deal/${deal.id}`,
      priceCurrency: "EUR",
      price: deal.discounted_price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: deal.merchant.name,
      },
      ...(deal.expires_at
        ? { priceValidUntil: deal.expires_at.slice(0, 10) }
        : {}),
    },
  };
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const { deal, otherOffers } = await loadDeal(dealId);
  const jsonLd = buildProductJsonLd(deal);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/" className="mb-6 text-sm text-zinc-500 hover:text-zinc-900">
        ← Retour au catalogue
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md border border-card-border bg-zinc-100 sm:w-72">
          <DealImage src={deal.image_url} alt={deal.title} category={deal.category} />
          <span className="absolute left-2 top-2 rounded bg-discount px-2 py-1 text-xs font-semibold text-discount-foreground">
            {formatDiscountBadge(deal.discount_percentage)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{deal.brand}</p>
          <h1 className="text-xl font-semibold text-zinc-900">{deal.title}</h1>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-accent">
              {formatPrice(deal.discounted_price)}
            </span>
            <span className="text-base text-zinc-500 line-through">
              {formatPrice(deal.original_price)}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            Chez {deal.merchant.name} · {formatFreshnessLabel(deal.created_at, deal.expires_at)}
          </p>
          <a
            href={`/go/${deal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Voir l&apos;offre chez {deal.merchant.name}
          </a>
        </div>
      </div>

      {otherOffers.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Autres offres pour cet article
          </h2>
          <ul className="flex flex-col divide-y divide-card-border rounded-md border border-card-border">
            {otherOffers.map((offer) => (
              <li
                key={offer.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">
                    {offer.merchant.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatFreshnessLabel(offer.created_at, offer.expires_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-accent">
                    {formatPrice(offer.discounted_price)}
                  </span>
                  <a
                    href={`/go/${offer.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-card-border px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    Voir l&apos;offre
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
