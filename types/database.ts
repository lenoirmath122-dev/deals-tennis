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
  created_at: string;
  updated_at: string;
}

export interface ClickEvent {
  id: string;
  deal_id: string;
  device_type: DeviceType;
  referrer_url: string | null;
  clicked_at: string;
}

export interface CatalogResponse {
  deals: Deal[];
  total: number;
  page: number;
  pageSize: number;
}
