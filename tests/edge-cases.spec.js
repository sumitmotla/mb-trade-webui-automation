const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');
const { ExplorePage } = require('../pages/explore-page');
const { NotFoundPage } = require('../pages/not-found-page');
const { SiteLayout } = require('../pages/site-layout');
const { navigationItems } = require('../test-data/navigation');

const expectedNavigationLabels = navigationItems.map((navigationItem) => navigationItem.label);

// Sites owned by MultiBank. Links to other companies' sites (such as the Hacken
// security audit, which blocks automated requests) are outside our control.
const firstPartyHosts = ['mb.io', 'trade.mb.io', 'token.multibankgroup.com'];

test('unknown page address should display the Page Not Found page and a way back home', async ({ page }) => {
  const notFoundPage = new NotFoundPage(page);
  const homePage = new HomePage(page);

  const pageResponse = await notFoundPage.open('this-page-does-not-exist');

  expect(pageResponse.status()).toBe(404);
  await expect(page).toHaveURL(/\/this-page-does-not-exist$/);
  await expect(notFoundPage.heading).toBeVisible();
  await expect(notFoundPage.explanation).toBeVisible();

  await notFoundPage.backToHomepageLink.click();

  await expect(homePage.heroHeading).toBeVisible();
  await expect(page).not.toHaveURL(/this-page-does-not-exist/);
});

test('mobile layout should replace the top navigation with a menu containing all expected items', async ({ page }) => {
  const homePage = new HomePage(page);
  const siteLayout = new SiteLayout(page);

  // A common modern phone screen size.
  await page.setViewportSize({ width: 390, height: 844 });
  await homePage.open();

  await expect(siteLayout.mainNavigation).toBeHidden();
  await expect(siteLayout.mobileMenuButton).toBeVisible();
  expect(await siteLayout.hasHorizontalScroll(), 'page should not scroll sideways').toBe(false);

  await siteLayout.mobileMenuButton.click();
  await expect(siteLayout.mobileMenuLinks).toHaveText(expectedNavigationLabels);

  await siteLayout.closeMobileMenuButton.click();
  await expect(siteLayout.mobileMenu).toBeHidden();
});

test('header and footer first-party links should not be broken', async ({ page, request, browserName }) => {
  test.skip(browserName !== 'chromium', 'Link status codes do not depend on the browser, so they are checked once.');

  const homePage = new HomePage(page);
  const siteLayout = new SiteLayout(page);

  await homePage.open();
  const linkUrls = await siteLayout.getHeaderAndFooterLinkUrls();
  const firstPartyLinkUrls = linkUrls.filter((linkUrl) => firstPartyHosts.includes(new URL(linkUrl).host));
  expect(firstPartyLinkUrls.length, 'header and footer should contain first-party links').toBeGreaterThan(0);

  // Each link gets up to 10 seconds. A link that times out or cannot be reached
  // is recorded with its URL, and the check carries on with the remaining links.
  const linkRequestTimeout = 10_000;

  for (const linkUrl of firstPartyLinkUrls) {
    try {
      const linkResponse = await request.get(linkUrl, { timeout: linkRequestTimeout });
      expect.soft(linkResponse.status(), `${linkUrl} should not be broken`).toBeLessThan(400);
    } catch (requestError) {
      expect.soft(requestError, `${linkUrl} should respond without a timeout or network error`).toBeUndefined();
    }
  }
});

test('spot market should show a retry message when market data times out', async ({ page }) => {
  const explorePage = new ExplorePage(page);
  const siteLayout = new SiteLayout(page);

  await page.route(explorePage.marketCategoriesUrl, (route) => route.abort('timedout'));
  await explorePage.open();

  // The page retries the failed request three more times before giving up,
  // which took about 7 seconds in our runs.
  await expect(explorePage.marketDataErrorMessage).toBeVisible({ timeout: 15_000 });
  await expect(explorePage.tradingPairRows).toHaveCount(0);
  await expect(explorePage.spotMarketHeading).toBeVisible();
  await expect(siteLayout.mainNavigation).toBeVisible();
});
