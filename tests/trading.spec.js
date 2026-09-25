const { test, expect } = require('@playwright/test');
const { ExplorePage } = require('../pages/explore-page');
const { marketCategories, displayedTradingPairLimit, tradingPairFormats } = require('../test-data/spot-market');

// The Spot market table fills in over several seconds: in our runs all 15
// trading pairs appeared after 7 to 8 seconds, which is longer than
// Playwright's default 5-second wait.
const tableLoadTimeout = 15_000;

test('spot market should display trading pairs under Hot, Gainers and Losers categories', async ({ page }) => {
  const explorePage = new ExplorePage(page);
  const expectedCategoryLabels = marketCategories.map((marketCategory) => marketCategory.label);

  await explorePage.open();

  await expect(explorePage.spotMarketHeading).toBeVisible();
  await expect(explorePage.categoryButtons).toHaveText(expectedCategoryLabels);
  await expect(explorePage.tradingPairRows).toHaveCount(displayedTradingPairLimit, { timeout: tableLoadTimeout });
});

test.describe('each spot market category should display the expected trading pairs', () => {
  for (const marketCategory of marketCategories) {
    test(`${marketCategory.label} should display the trading pairs from the market data response`, async ({ page }) => {
      const explorePage = new ExplorePage(page);

      const marketCategoriesResponse = await explorePage.openWithSteadyMarketCategories();
      expect(marketCategoriesResponse.ok(), 'market data request should succeed').toBe(true);

      const marketCategoriesFromApi = await marketCategoriesResponse.json();
      const categoryFromApi = marketCategoriesFromApi.find((category) => category.id === marketCategory.id);
      expect(categoryFromApi, `market data should include the "${marketCategory.id}" category`).toBeDefined();
      expect(categoryFromApi.items.length, `"${marketCategory.id}" category should list trading pairs`).toBeGreaterThan(0);

      const expectedTradingPairs = categoryFromApi.items.slice(0, displayedTradingPairLimit);

      await explorePage.categoryButton(marketCategory.label).click();

      await expect(explorePage.tradingPairSymbols).toHaveText(expectedTradingPairs, { timeout: tableLoadTimeout });
    });
  }
});

test('each trading pair should display its symbol, name, price, 24-hour change and price chart', async ({ page }) => {
  const explorePage = new ExplorePage(page);

  await explorePage.open();
  await expect(explorePage.tradingPairRows).toHaveCount(displayedTradingPairLimit, { timeout: tableLoadTimeout });

  for (const tradingPairRow of await explorePage.tradingPairRows.all()) {
    const tradingPair = explorePage.tradingPairFields(tradingPairRow);

    await expect.soft(tradingPair.symbol).toHaveText(tradingPairFormats.symbol);
    await expect.soft(tradingPair.name).not.toBeEmpty();
    await expect.soft(tradingPair.price).toHaveText(tradingPairFormats.price);
    await expect.soft(tradingPair.change).toHaveText(tradingPairFormats.change);
    await expect.soft(tradingPair.changeDirectionIcon).toBeVisible();
    await expect.soft(tradingPair.priceChart).toBeVisible();
    await expect.soft(tradingPair.coinLink).toHaveAttribute('href', tradingPairFormats.coinPageLink);
  }
});
