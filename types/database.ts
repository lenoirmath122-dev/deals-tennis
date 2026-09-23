export type DealCategory =
  | "raquettes"
  | "cordages"
  | "chaussures"
  | "textile"
  | "accessoires";

export type DealStatus = "active" | "expired" | "invalid";

export type DeviceType = "mobile" | "desktop" | "tablet" | "unknown";

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_url: string;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  brand: string;
  category: DealCategory;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  merchant_id: string;
  affiliate_url: string;
  status: DealStatus;
  is_active: boolean;
  expires_at: string | null;
  product_id: string | null;
  /** Couleur extraite du titre (D-2026-09-23-06), attribut affiché mais hors identité produit. */
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand: string;
  model: string;
  category: DealCategory;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  deal_id: string;
  device_type: DeviceType;
  referrer_url: string | null;
  clicked_at: string;
}

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
  category: DealCategory;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  merchant: MerchantSummary;
  created_at: string;
  expires_at: string | null;
  /** Nombre d'offres actives pour le même article (product_id). Présent uniquement en mode recherche groupée. */
  offer_count?: number;
}

export interface DealDetail {
  deal: DealCardData;
  otherOffers: DealCardData[];
}

export interface CatalogPagination {
  current_page: number;
  total_pages: number;
  total_deals: number;
  has_previous: boolean;
  has_next: boolean;
  per_page: number;
}

export interface CatalogResponse {
  deals: DealCardData[];
  pagination: CatalogPagination;
}
