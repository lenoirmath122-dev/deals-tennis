import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const merchants = [
  { name: "Tennis-Point", slug: "tennis-point", website_url: "https://www.tennis-point.fr" },
  { name: "Extreme Tennis", slug: "extreme-tennis", website_url: "https://www.extreme-tennis.fr" },
  { name: "All4Tennis", slug: "all4tennis", website_url: "https://www.all4tennis.fr" },
];

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

type SeedDeal = {
  title: string;
  brand: string;
  category: "raquettes" | "cordages" | "chaussures" | "textile" | "accessoires";
  image_url: string;
  original_price: number;
  discounted_price: number;
  merchant_slug: string;
  status: "active" | "expired";
  expires_at: string | null;
};

const deals: SeedDeal[] = [
  {
    title: "Babolat Pure Aero 2023 Non Cordée",
    brand: "Babolat",
    category: "raquettes",
    image_url: "https://images.example.com/deals/babolat-pure-aero.jpg",
    original_price: 259.95,
    discounted_price: 179.95,
    merchant_slug: "tennis-point",
    status: "active",
    expires_at: hoursFromNow(72),
  },
  {
    title: "Wilson Blade 98 v9",
    brand: "Wilson",
    category: "raquettes",
    image_url: "https://images.example.com/deals/wilson-blade-98.jpg",
    original_price: 279.0,
    discounted_price: 209.0,
    merchant_slug: "extreme-tennis",
    status: "expired",
    expires_at: hoursFromNow(-24),
  },
  {
    title: "Luxilon ALU Power 1.25mm (12m)",
    brand: "Luxilon",
    category: "cordages",
    image_url: "https://images.example.com/deals/luxilon-alu-power.jpg",
    original_price: 22.9,
    discounted_price: 14.9,
    merchant_slug: "all4tennis",
    status: "active",
    expires_at: null,
  },
  {
    title: "Babolat RPM Blast 1.30mm (12m)",
    brand: "Babolat",
    category: "cordages",
    image_url: "https://images.example.com/deals/babolat-rpm-blast.jpg",
    original_price: 19.9,
    discounted_price: 12.9,
    merchant_slug: "tennis-point",
    status: "expired",
    expires_at: hoursFromNow(-2),
  },
  {
    title: "Nike Zoom Vapor 11",
    brand: "Nike",
    category: "chaussures",
    image_url: "https://images.example.com/deals/nike-zoom-vapor-11.jpg",
    original_price: 149.99,
    discounted_price: 104.99,
    merchant_slug: "extreme-tennis",
    status: "active",
    expires_at: hoursFromNow(168),
  },
  {
    title: "Asics Gel-Resolution 9",
    brand: "Asics",
    category: "chaussures",
    image_url: "https://images.example.com/deals/asics-gel-resolution-9.jpg",
    original_price: 159.99,
    discounted_price: 119.99,
    merchant_slug: "all4tennis",
    status: "active",
    expires_at: null,
  },
  {
    title: "Nike Court Dri-FIT Polo",
    brand: "Nike",
    category: "textile",
    image_url: "https://images.example.com/deals/nike-court-dri-fit-polo.jpg",
    original_price: 59.99,
    discounted_price: 39.99,
    merchant_slug: "tennis-point",
    status: "active",
    expires_at: hoursFromNow(48),
  },
  {
    title: "Head Performance Jupe",
    brand: "Head",
    category: "textile",
    image_url: "https://images.example.com/deals/head-performance-jupe.jpg",
    original_price: 44.95,
    discounted_price: 29.95,
    merchant_slug: "extreme-tennis",
    status: "expired",
    expires_at: hoursFromNow(-96),
  },
  {
    title: "Wilson Tour Sac de tennis 9 raquettes",
    brand: "Wilson",
    category: "accessoires",
    image_url: "https://images.example.com/deals/wilson-tour-sac-9.jpg",
    original_price: 129.0,
    discounted_price: 89.0,
    merchant_slug: "all4tennis",
    status: "active",
    expires_at: hoursFromNow(120),
  },
  {
    title: "Babolat Antivibrateur x2",
    brand: "Babolat",
    category: "accessoires",
    image_url: "https://images.example.com/deals/babolat-antivibrateur.jpg",
    original_price: 9.9,
    discounted_price: 6.9,
    merchant_slug: "tennis-point",
    status: "active",
    expires_at: null,
  },
];

async function seed() {
  const merchantIds = new Map<string, string>();

  for (const merchant of merchants) {
    const [row] = await sql`
      INSERT INTO merchants (name, slug, website_url)
      VALUES (${merchant.name}, ${merchant.slug}, ${merchant.website_url})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    merchantIds.set(merchant.slug, row.id as string);
  }

  for (const deal of deals) {
    const merchantId = merchantIds.get(deal.merchant_slug);
    if (!merchantId) {
      throw new Error(`Unknown merchant slug: ${deal.merchant_slug}`);
    }

    const discountPercentage = Math.round(
      ((deal.original_price - deal.discounted_price) / deal.original_price) * 100
    );

    await sql`
      INSERT INTO deals (
        title, brand, category, image_url,
        original_price, discounted_price, discount_percentage,
        merchant_id, affiliate_url, status, is_active, expires_at
      ) VALUES (
        ${deal.title}, ${deal.brand}, ${deal.category}, ${deal.image_url},
        ${deal.original_price}, ${deal.discounted_price}, ${discountPercentage},
        ${merchantId}, ${`https://affiliate.example.com/track?deal=${encodeURIComponent(deal.title)}`},
        ${deal.status}, ${deal.status === "active"}, ${deal.expires_at}
      )
    `;
  }

  console.log(`Seeded ${merchants.length} merchants and ${deals.length} deals.`);
}

await seed();
