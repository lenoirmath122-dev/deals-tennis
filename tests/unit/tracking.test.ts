import { describe, expect, it } from "vitest";
import { cleanReferrerUrl, resolveDeviceType } from "@/lib/tracking";

describe("resolveDeviceType", () => {
  it("returns 'unknown' when there is no User-Agent header", () => {
    expect(resolveDeviceType(null)).toBe("unknown");
  });

  it("returns 'mobile' for an iPhone User-Agent", () => {
    expect(
      resolveDeviceType(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
      )
    ).toBe("mobile");
  });

  it("returns 'mobile' for an Android phone User-Agent", () => {
    expect(
      resolveDeviceType(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36"
      )
    ).toBe("mobile");
  });

  it("returns 'tablet' for an iPad User-Agent", () => {
    expect(
      resolveDeviceType(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15"
      )
    ).toBe("tablet");
  });

  it("returns 'tablet' for an Android tablet User-Agent (no 'Mobile' token)", () => {
    expect(
      resolveDeviceType("Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36 Safari/537.36")
    ).toBe("tablet");
  });

  it("returns 'desktop' for a standard desktop User-Agent", () => {
    expect(
      resolveDeviceType(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
      )
    ).toBe("desktop");
  });
});

describe("cleanReferrerUrl", () => {
  const origin = "https://deals-tennis.example";

  it("returns null when there is no Referer header", () => {
    expect(cleanReferrerUrl(null, origin)).toBeNull();
  });

  it("keeps only the path and query for a same-origin referer", () => {
    expect(cleanReferrerUrl(`${origin}/?category=raquettes`, origin)).toBe(
      "/?category=raquettes"
    );
  });

  it("returns null for a cross-origin referer", () => {
    expect(cleanReferrerUrl("https://malicious.example/?x=1", origin)).toBeNull();
  });

  it("returns null for a malformed referer", () => {
    expect(cleanReferrerUrl("not-a-url", origin)).toBeNull();
  });
});
