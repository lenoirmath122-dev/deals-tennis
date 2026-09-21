import { sql } from "@/lib/db";
import type { DeviceType } from "@/types/database";

export function resolveDeviceType(userAgentHeader: string | null): DeviceType {
  if (!userAgentHeader) return "unknown";
  const ua = userAgentHeader.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua)) return "mobile";
  return "desktop";
}

export function cleanReferrerUrl(refererHeader: string | null, origin: string): string | null {
  if (!refererHeader) return null;
  try {
    const url = new URL(refererHeader);
    if (url.origin !== origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export interface RecordClickEventParams {
  dealId: string;
  deviceType: DeviceType;
  referrerUrl: string | null;
}

export async function recordClickEvent({
  dealId,
  deviceType,
  referrerUrl,
}: RecordClickEventParams): Promise<void> {
  await sql.query(
    `INSERT INTO click_events (deal_id, device_type, referrer_url) VALUES ($1, $2, $3)`,
    [dealId, deviceType, referrerUrl]
  );
}
