const { test, expect, devices } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');
const { ExplorePage } = require('../pages/explore-page');
const { WhyMultiBankPage } = require('../pages/why-multibank-page');
const { SiteLayout } = require('../pages/site-layout');
const { explorePromotions, multiBankApp, appDownloadRedirects, whyMultiBankSections } = require('../test-data/content');

test('home page hero banner should appear at the top of the page with the required actions', async ({ page }) => {
  const homePage = new HomePage(page);
  const siteLayout = new SiteLayout(page);

  await homePage.open();

  // Without scrolling, the hero and both of its actions are on the first screen.
  await expect(homePage.heroHeading).toBeInViewport();
  await expect(homePage.downloadAppLink).toBeInViewport();
  await expect(homePage.openAccountLink).toBeInViewport();

  const headerBox = await siteLayout.header.boundingBox();
  const heroHeadingBox = await homePage.heroHeading.boundingBox();
  const headerBottom = Math.round(headerBox.y + headerBox.height);
  expect(Math.round(heroHeadingBox.y), 'hero heading should start below the header').toBeGreaterThanOrEqual(headerBottom);

  await expect(homePage.downloadAppLink).toHaveAttribute('href', multiBankApp.smartLinkPattern);
  await expect(homePage.openAccountLink).toHaveAttribute('href', 'https://trade.mb.io/register');
});

test('Explore page promotional banners should appear between the page title and Spot market', async ({ page }) => {
  const explorePage = new ExplorePage(page);
  const siteLayout = new SiteLayout(page);

  await explorePage.open();
  await expect(siteLayout.pageHeading).toBeVisible();
  await expect(explorePage.spotMarketHeading).toBeVisible();

  const pageTitleBox = await siteLayout.pageHeading.boundingBox();
  const spotMarketHeadingBox = await explorePage.spotMarketHeading.boundingBox();
  const pageTitleBottom = pageTitleBox.y + pageTitleBox.height;

  for (const promotionTitle of explorePromotions) {
    const promotion = explorePage.promotion(promotionTitle);
    await expect(promotion).toBeVisible();

    const promotionBox = await promotion.boundingBox();
    expect(promotionBox.y, `"${promotionTitle}" should be below the page title`).toBeGreaterThan(pageTitleBottom);
    expect(promotionBox.y + promotionBox.height, `"${promotionTitle}" should be above Spot market`).toBeLessThan(spotMarketHeadingBox.y);
  }
});

test.describe('App Store and Google Play links should resolve to the correct app stores', () => {
  // The home page "Download the app" link is a smart link: the server redirects
  // each phone to its own app store. Only that first redirect is checked, so no
  // store page is ever opened (store pages differ by country).
  //
  // The OTC Desk App Store and Google Play badges are deliberately not used here.
  // Both badges share one Adjust smart link, and on iPhone it opens Adjust's app
  // link page, which moves on to the App Store inside the browser. That step
  // cannot be verified over HTTP without depending on Adjust's page content.
  for (const appDownloadRedirect of appDownloadRedirects) {
    test(`"Download the app" should send ${appDownloadRedirect.phone} users to ${appDownloadRedirect.store}`, async ({ page, request }) => {
      const homePage = new HomePage(page);

      await homePage.open();
      await expect(homePage.downloadAppLink).toHaveAttribute('href', multiBankApp.smartLinkPattern);
      const downloadAppLink = await homePage.downloadAppLink.getAttribute('href');

      const smartLinkResponse = await request.get(downloadAppLink, {
        headers: { 'User-Agent': devices[appDownloadRedirect.deviceName].userAgent },
        maxRedirects: 0,
      });

      const responseStatus = smartLinkResponse.status();
      expect(responseStatus >= 300 && responseStatus < 400, `expected a redirect, got HTTP ${responseStatus}`).toBe(true);
      const redirectLocation = smartLinkResponse.headers()['location'];
      expect(redirectLocation, 'the redirect should have a Location header').toBeTruthy();

      const redirectTarget = decodeURIComponent(redirectLocation);
      expect(
        redirectTarget.startsWith(appDownloadRedirect.expectedRedirectStart),
        `redirect should start with ${appDownloadRedirect.expectedRedirectStart}, but was ${redirectTarget}`,
      ).toBe(true);
      for (const expectedPart of appDownloadRedirect.expectedRedirectParts) {
        expect(redirectTarget).toContain(expectedPart);
      }
    });
  }
});

test('Why MultiBank page should display the expected headings and section content', async ({ page }) => {
  const whyMultiBankPage = new WhyMultiBankPage(page);

  await whyMultiBankPage.open();

  for (const section of whyMultiBankSections) {
    await test.step(`"${section.heading}" section`, async () => {
      await expect.soft(whyMultiBankPage.sectionHeading(section.heading)).toBeVisible();
      for (const keyText of section.keyTexts) {
        await expect.soft(whyMultiBankPage.sectionText(keyText)).toBeVisible();
      }
    });
  }
});
