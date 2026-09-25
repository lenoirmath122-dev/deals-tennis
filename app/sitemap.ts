import type { MetadataRoute } from "next";
import { getActiveDealsForSitemap } from "@/lib/deals";
import { SITE_URL } from "@/lib/site";

const LEGAL_PAGES_UPDATED_AT = new Date("2026-09-23");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const deals = await getActiveDealsForSitemap();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/affiliation`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cgu`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/confidentialite`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/mentions-legales`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const dealEntries: MetadataRoute.Sitemap = deals.map((deal) => ({
    url: `${SITE_URL}/deal/${deal.id}`,
    lastModified: new Date(deal.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...dealEntries];
}
