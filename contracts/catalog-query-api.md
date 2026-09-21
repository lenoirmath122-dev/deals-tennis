# Interface Contract: Catalog Query & Filtering

**Type**: Server-Side Data Layer (`lib/db.ts` / Next.js Server Components)
**Purpose**: Récupérer les offres actives paginées, filtrées et ordonnées depuis Neon PostgreSQL (FR-001, FR-002, FR-003, FR-004, FR-005, FR-009).

---

## 1. Paramètres de Requête (URL Search Params)

| Paramètre | Type | Valeur par défaut | Description & Valeurs permises |
|---|---|---|---|
| `category` | `string` | `"all"` | `'all'`, `'raquettes'`, `'cordages'`, `'chaussures'`, `'textile'`, `'accessoires'` |
| `sort` | `string` | `"newest"` | `'newest'` (date d'ajout décroissante), `'discount'` (% de réduction décroissant) |
| `q` | `string` | `""` | Terme de recherche textuelle libre (filtrage sur titre et marque) |
| `page` | `integer` | `1` | Numéro de la page demandée (>= 1) |

---

## 2. Format de Réponse / Type TypeScript

```typescript
export interface MerchantSummary {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface DealCardData {
  id: string;
  title: string;
  brand: string;
  category: 'raquettes' | 'cordages' | 'chaussures' | 'textile' | 'accessoires';
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  merchant: MerchantSummary;
  created_at: string;
  expires_at: string | null;
}

export interface CatalogResponse {
  deals: DealCardData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_deals: number;
    has_previous: boolean;
    has_next: boolean;
    per_page: number; // 24
  };
}
```

---

## 3. Logique d'Interrogation SQL / Neon Serverless Driver

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const PER_PAGE = 24;

export async function getCatalogDeals(params: {
  category?: string;
  sort?: 'newest' | 'discount';
  q?: string;
  page?: number;
}): Promise<CatalogResponse> {
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * PER_PAGE;

  // Conditions de base : offres actives et non expirées
  const conditions = [
    `d.status = 'active'`,
    `d.is_active = true`,
    `(d.expires_at IS NULL OR d.expires_at > NOW())`
  ];
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Filtre optionnel par catégorie
  if (params.category && params.category !== 'all') {
    conditions.push(`d.category = $${paramIndex++}`);
    queryParams.push(params.category);
  }

  // Recherche optionnelle par mot-clé (titre ou marque)
  if (params.q && params.q.trim().length > 0) {
    conditions.push(`(d.title ILIKE $${paramIndex} OR d.brand ILIKE $${paramIndex})`);
    paramIndex++;
    queryParams.push(`%${params.q.trim()}%`);
  }

  const whereClause = conditions.join(' AND ');
  const orderByClause = params.sort === 'discount' 
    ? 'd.discount_percentage DESC, d.created_at DESC' 
    : 'd.created_at DESC';

  // 1. Comptage total pour la pagination
  const countQuery = `SELECT COUNT(*)::int AS total FROM deals d WHERE ${whereClause}`;
  const countResult = await sql(countQuery, queryParams);
  const total = countResult[0]?.total || 0;

  // 2. Récupération des cartes de bons plans avec informations marchand
  const dataQuery = `
    SELECT 
      d.id,
      d.title,
      d.brand,
      d.category,
      d.image_url,
      d.original_price::float AS original_price,
      d.discounted_price::float AS discounted_price,
      d.discount_percentage,
      d.created_at,
      d.expires_at,
      json_build_object(
        'id', m.id,
        'name', m.name,
        'slug', m.slug,
        'logo_url', m.logo_url
      ) AS merchant
    FROM deals d
    JOIN merchants m ON d.merchant_id = m.id
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT ${PER_PAGE} OFFSET ${offset}
  `;

  const rows = await sql(dataQuery, queryParams);

  return {
    deals: rows as DealCardData[],
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / PER_PAGE),
      total_deals: total,
      has_previous: page > 1,
      has_next: page * PER_PAGE < total,
      per_page: PER_PAGE,
    }
  };
}
```
