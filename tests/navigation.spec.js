const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');
const { SiteLayout } = require('../pages/site-layout');
const { navigationItems, desktopViewports } = require('../test-data/navigation');

const expectedNavigationLabels = navigationItems.map((navigationItem) => navigationItem.label);
const sameTabNavigationItems = navigationItems.filter((navigationItem) => !navigationItem.opensInNewTab);
const tokenWebsiteNavigationItem = navigationItems.find((navigationItem) => navigationItem.opensInNewTab);

test('home page should display all expected top navigation items', async ({ page }) => {
  const homePage = new HomePage(page);
  const siteLayout = new SiteLayout(page);

  await homePage.open();

  await expect(siteLayout.mainNavigationLinks).toHaveText(expectedNavigationLabels);
  for (const label of expectedNavigationLabels) {
    await expect(siteLayout.navigationLink(label)).toBeVisible();
  }
});

test.describe('each top navigation item should open the correct destination', () => {
  for (const navigationItem of sameTabNavigationItems) {
    test(`${navigationItem.label} should open the ${navigationItem.label} page`, async ({ page }) => {
      const homePage = new HomePage(page);
      const siteLayout = new SiteLayout(page);

      await homePage.open();
      await siteLayout.navigationLink(navigationItem.label).click();

      await expect(page).toHaveURL(navigationItem.expectedUrl);
      await expect(siteLayout.pageHeading).toHaveText(navigationItem.expectedPageHeading);
    });
  }

  test(`${tokenWebsiteNavigationItem.label} should open the token website in a new tab`, async ({ page }) => {
    const homePage = new HomePage(page);
    const siteLayout = new SiteLayout(page);

    await homePage.open();
    const newTabPromise = page.waitForEvent('popup');
    await siteLayout.navigationLink(tokenWebsiteNavigationItem.label).click();
    const tokenWebsiteTab = await newTabPromise;

    await expect(tokenWebsiteTab).toHaveURL(tokenWebsiteNavigationItem.expectedUrl);
    await tokenWebsiteTab.close();
  });
});

test.describe('top navigation should fit on one row and behave correctly at standard desktop viewports', () => {
  for (const viewport of desktopViewports) {
    test(`${viewport.width}x${viewport.height} (${viewport.name})`, async ({ page }) => {
      const homePage = new HomePage(page);
      const siteLayout = new SiteLayout(page);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await homePage.open();

      for (const label of expectedNavigationLabels) {
        await expect(siteLayout.navigationLink(label)).toBeVisible();
      }

      const navigationItemPositions = await siteLayout.getNavigationItemPositions();
      const firstItem = navigationItemPositions[0];
      for (let index = 1; index < navigationItemPositions.length; index++) {
        const previousItem = navigationItemPositions[index - 1];
        const currentItem = navigationItemPositions[index];

        expect(currentItem.top, `${currentItem.label} should be on the same row as ${firstItem.label}`).toBe(firstItem.top);
        expect(currentItem.left, `${currentItem.label} should not overlap ${previousItem.label}`).toBeGreaterThanOrEqual(previousItem.right);
      }

      await expect(siteLayout.mobileMenuButton).toBeHidden();
      expect(await siteLayout.hasHorizontalScroll(), 'page should not scroll sideways').toBe(false);

      // The header is sticky, so the navigation stays available after scrolling down.
      await siteLayout.footer.scrollIntoViewIfNeeded();
      await expect(siteLayout.header).toBeInViewport();
    });
  }
});

// Bookmarks, shared links and search results open a page directly, which the
// server renders from scratch. Clicking a menu item takes a different path, so
// a page can work from the menu and still fail when opened directly.
test.describe('each primary public page should be accessible directly by its URL', () => {
  for (const primaryPage of sameTabNavigationItems) {
    test(`${primaryPage.label} page should be accessible directly by its URL`, async ({ page }) => {
      const siteLayout = new SiteLayout(page);

      const pageResponse = await page.goto(primaryPage.path, { waitUntil: 'domcontentloaded' });

      expect(pageResponse.status()).toBe(200);
      await expect(page).toHaveURL(primaryPage.expectedUrl);
      await expect(siteLayout.pageHeading).toHaveText(primaryPage.expectedPageHeading);
    });
  }
});
