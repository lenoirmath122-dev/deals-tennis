import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cleanReferrerUrl, recordClickEvent, resolveDeviceType } from "@/lib/tracking";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redirectWithNoStore(url: string | URL, status: 307) {
  const response = NextResponse.redirect(url, status);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;

  if (!UUID_REGEX.test(dealId)) {
    return redirectWithNoStore(new URL("/?notification=deal-not-found", request.url), 307);
  }

  const rows = await sql.query(
    `SELECT affiliate_url, status, is_active, expires_at FROM deals WHERE id = $1`,
    [dealId]
  );

  if (rows.length === 0) {
    return redirectWithNoStore(new URL("/?notification=deal-not-found", request.url), 307);
  }

  const deal = rows[0] as {
    affiliate_url: string;
    status: string;
    is_active: boolean;
    expires_at: string | null;
  };

  const isValid =
    deal.status === "active" &&
    deal.is_active === true &&
    (deal.expires_at === null || new Date(deal.expires_at) > new Date());

  if (!isValid) {
    return redirectWithNoStore(new URL("/?notification=deal-expired", request.url), 307);
  }

  const deviceType = resolveDeviceType(request.headers.get("user-agent"));
  const referrerUrl = cleanReferrerUrl(request.headers.get("referer"), request.nextUrl.origin);

  await recordClickEvent({ dealId, deviceType, referrerUrl });

  return redirectWithNoStore(deal.affiliate_url, 307);
}
