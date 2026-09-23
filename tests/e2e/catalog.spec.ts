import { test, expect } from "@playwright/test";
import { sql } from "@/lib/db";

test.describe("Catalogue de bons plans tennis", () => {
  test("affiche le catalogue avec des cartes d'offres actives", async ({ page }) => {
    await page.goto("/");

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    await expect(cards).not.toHaveCount(0);
  });

  test("filtre par catégorie via les pills et met à jour l'URL", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Chaussures" }).click();
    await expect(page).toHaveURL(/category=chaussures/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("recherche par mot-clé filtre les résultats et met à jour l'URL", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox").fill("Babolat");
    await page.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/q=Babolat/, { timeout: 5000 });

    const titles = await page.locator("article h2").allTextContents();
    expect(titles.length).toBeGreaterThan(0);
    for (const title of titles) {
      expect(title.toLowerCase()).toContain("babolat");
    }
  });

  test("la recherche ne filtre pas en direct : elle propose des suggestions cliquables", async ({
    page,
  }) => {
    await page.goto("/");

    const searchbox = page.getByRole("searchbox");
    await searchbox.fill("Pure Aero");

    // Pas de navigation tant qu'on n'a pas validé (ni Entrée, ni clic loupe/suggestion).
    await expect(page).not.toHaveURL(/q=/);

    const categoryOption = page.getByRole("button", { name: /Raquettes/i }).first();
    await expect(categoryOption).toBeVisible({ timeout: 10000 });
    await categoryOption.click();

    const suggestion = page.getByRole("button", { name: /Pure Aero/i }).first();
    await expect(suggestion).toBeVisible({ timeout: 10000 });
    await suggestion.click();

    await expect(page).toHaveURL(/q=/, { timeout: 5000 });
    await expect(page).toHaveURL(/category=raquettes/, { timeout: 5000 });
  });

  test("le tri par réduction change l'ordre des offres", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("combobox").selectOption({ label: "Plus forte réduction" });
    await expect(page).toHaveURL(/sort=discount/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("redirige une offre active vers son URL d'affiliation et log le clic", async ({
    request,
  }) => {
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

    const response = await request.get(`/go/${deal.id}`, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toBe(deal.affiliate_url);

    const [{ total: countAfter }] = await sql.query(
      `SELECT COUNT(*)::int AS total FROM click_events WHERE deal_id = $1`,
      [deal.id]
    );
    expect(countAfter).toBe(countBefore + 1);

    const [lastEvent] = await sql.query(
      `SELECT id FROM click_events WHERE deal_id = $1 ORDER BY clicked_at DESC LIMIT 1`,
      [deal.id]
    );
    await sql.query(`DELETE FROM click_events WHERE id = $1`, [lastEvent.id]);
  });

  test("affiche la bannière de notification pour une offre expirée", async ({ page }) => {
    await page.goto("/?notification=deal-expired");
    await expect(page.getByText(/expirer/i)).toBeVisible();
  });

  test("une recherche groupant plusieurs marchands mène à la page détail avec les autres offres", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    await page.getByRole("searchbox").fill("Pure Aero");
    await page.getByRole("searchbox").press("Enter");
    await expect(page).toHaveURL(/q=Pure\+Aero/, { timeout: 5000 });

    const groupedCard = page.locator("article").filter({ hasText: "offres" }).first();
    await expect(groupedCard).toBeVisible();

    await groupedCard.locator("a").click();
    await expect(page).toHaveURL(/\/deal\//);

    await expect(page.getByRole("heading", { name: "Autres offres pour cet article" })).toBeVisible();
    const offerLinks = page.locator("li a", { hasText: "Voir l'offre" });
    await expect(offerLinks.first()).toBeVisible();

    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      offerLinks.first().click(),
    ]);
    await popup.waitForLoadState();
    expect(popup.url()).not.toContain("localhost");
    await popup.close();
  });

  test("la page détail d'un deal expiré redirige vers le catalogue avec la bonne notification", async ({
    page,
  }) => {
    const [deal] = await sql.query(
      `SELECT id FROM deals
       WHERE status != 'active' OR is_active = false OR expires_at <= NOW()
       LIMIT 1`
    );
    expect(deal).toBeDefined();

    await page.goto(`/deal/${deal.id}`);
    await expect(page).toHaveURL(/notification=deal-expired/);
    await expect(page.getByText(/expirer/i)).toBeVisible();
  });
});
