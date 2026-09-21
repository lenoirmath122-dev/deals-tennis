import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/go/[dealId]/route";
import { sql } from "@/lib/db";

const NOT_FOUND_UUID = "00000000-0000-0000-0000-000000000000";

function makeRequest(dealId: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000/go/${dealId}`, { headers });
}

describe("GET /go/[dealId] contract", () => {
  it("redirects an active deal to its affiliate_url and logs a click event", async () => {
    const [deal] = await sql.query(
      `SELECT id, affiliate_url FROM deals
       WHERE status = 'active' AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`
    );
    expect(deal).toBeDefined();

    const [{ total: countBefore }] = await sql.query(
      `SELECT COUNT(*)::int AS total FROM click_events WHERE deal_id = $1`,
      [deal.id]
    );

    const response = await GET(
      makeRequest(deal.id, {
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
        referer: "http://localhost:3000/?category=raquettes",
      }),
      { params: Promise.resolve({ dealId: deal.id }) }
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(deal.affiliate_url);
    expect(response.headers.get("cache-control")).toContain("no-store");

    const [{ total: countAfter }] = await sql.query(
      `SELECT COUNT(*)::int AS total FROM click_events WHERE deal_id = $1`,
      [deal.id]
    );
    expect(countAfter).toBe(countBefore + 1);

    const [lastEvent] = await sql.query(
      `SELECT id, device_type, referrer_url FROM click_events WHERE deal_id = $1 ORDER BY clicked_at DESC LIMIT 1`,
      [deal.id]
    );
    expect(lastEvent.device_type).toBe("mobile");
    expect(lastEvent.referrer_url).toBe("/?category=raquettes");

    // Nettoyage : ce test crée une ligne réelle dans click_events à chaque exécution.
    await sql.query(`DELETE FROM click_events WHERE id = $1`, [lastEvent.id]);
  });

  it("redirects an expired or inactive deal to the deal-expired notification without logging a click", async () => {
    const [deal] = await sql.query(
      `SELECT id FROM deals
       WHERE status != 'active' OR is_active = false OR expires_at <= NOW()
       LIMIT 1`
    );
    expect(deal).toBeDefined();

    const [{ total: countBefore }] = await sql.query(
      `SELECT COUNT(*)::int AS total FROM click_events WHERE deal_id = $1`,
      [deal.id]
    );

    const response = await GET(makeRequest(deal.id), {
      params: Promise.resolve({ dealId: deal.id }),
    });

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/");
    expect(new URL(response.headers.get("location")!).searchParams.get("notification")).toBe(
      "deal-expired"
    );
    expect(response.headers.get("cache-control")).toContain("no-store");

    const [{ total: countAfter }] = await sql.query(
      `SELECT COUNT(*)::int AS total FROM click_events WHERE deal_id = $1`,
      [deal.id]
    );
    expect(countAfter).toBe(countBefore);
  });

  it("redirects an unknown deal id to the deal-not-found notification", async () => {
    const response = await GET(makeRequest(NOT_FOUND_UUID), {
      params: Promise.resolve({ dealId: NOT_FOUND_UUID }),
    });

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).searchParams.get("notification")).toBe(
      "deal-not-found"
    );
  });
});
