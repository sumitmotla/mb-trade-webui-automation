# Test Plan

This plan covers the Playwright UI tests for the public MultiBank website (Task 1). The full list of tests is in the [README](../README.md#test-coverage). How I would test the mobile trading app from Task 2 is covered separately in the [Task 2 document](task-2-fintech-testing-strategy.md).

## Objective

Check that a visitor who is not logged in can use the main public parts of mb.io: find their way around the site, see correct information in the Spot market, reach the right content and app download links, and get sensible behaviour when something goes wrong.

## Scope

The automated tests cover four areas:

- **Navigation & layout:** the top menu, where each menu item leads, opening the six main pages directly by URL, and how the menu behaves at common desktop screen sizes.
- **Trading / Spot market:** the Hot, Gainers and Losers categories on the Explore page, which trading pairs each category shows, and the details shown for each pair.
- **Content & links:** the home page hero, the Explore page promotions, the app store links and the Why MultiBank page.
- **Negative and edge cases:** an unknown URL, the mobile layout, broken header and footer links, and market data that doesn't arrive.

## Out of scope

- Logging in, creating an account, or entering any personal or financial information.
- Anything behind a login: orders, deposits, withdrawals and balances, including the trading app at trade.mb.io.
- What external sites show, such as the $MBG token site and the app stores. The tests only check that our links lead there.
- The OTC Desk store badges. Store links are checked through the home page "Download the app" link instead (see the README).
- Other languages and regions. The tests use the English UAE site (`/en-AE/`).
- Performance, load, security and accessibility testing. Problems noticed in these areas are listed in the [release readiness checklist](release-readiness.md#known-issues-and-risks).

## Test approach

The tests use Playwright Test with JavaScript. Page objects in `pages/` know how to find things on each page, and the spec files in `tests/` hold the checks, one file per area.

The suite uses these kinds of checks:

- **Visible content:** headings, menu items, buttons and links appear in the right order with the right text.
- **Navigation:** clicking a menu item, or opening a page by its URL, lands on the right page.
- **Layout:** element positions are compared, for example to confirm the menu fits on one row.
- **Data consistency:** the Spot market table is compared with the market data the page received.
- **HTTP checks:** the first redirect of the app download link, and the status of every first-party header and footer link.
- **Simulated failure:** the market data request is made to time out, to check the message the visitor sees.

Tests don't depend on each other and can run in parallel. There are no fixed waits: each step waits for the element or response it needs.

## Browser and viewport coverage

Every test runs in Chromium, Firefox and WebKit, using Playwright's desktop settings for each browser and a 1440×900 window. In addition:

- The desktop layout test runs at 1280×720, 1366×768 and 1920×1080.
- The mobile layout test runs at 390×844. It changes the window size only; it doesn't emulate a particular phone.
- The broken-link test only checks HTTP status codes, which are the same in every browser, so it runs in Chromium only.

## Test environment

- The tests run against the live public site, https://mb.io/en-AE/, so they need internet access and see real content and data. No accounts or test users are needed.
- The suite has been developed on macOS with Node.js 24.21.0 and Playwright 1.63, using the npm scripts in the README.
- The site picks its locale region from the visitor's location: `/en-AE/` from the UAE, and possibly `/en/` elsewhere. URL checks only look at the end of the path, so they work with either.

## Test data

Values that more than one test uses, or that marketing may change, live in `test-data/`:

- `navigation.js`: the seven menu items, the paths, URLs and page headings of the six internal pages, and the desktop screen sizes.
- `spot-market.js`: the three market categories, the number of pairs the table shows (15) and the expected value formats.
- `content.js`: the Explore promotions, where the app download link should send iPhone and Android users, and the Why MultiBank headings and key text.

For longer page text, the tests check a short key sentence instead of a whole paragraph, so a small copy edit doesn't break them.

**Market data** changes on its own: the Explore page reloads its category lists about every five seconds, and the ranking can change between reloads. The category test keeps the first market data response the page receives and gives the page that same response when it reloads, so the table is compared with data that stays still. Prices and the rest of the page stay live, and the other trading tests only check that values look right (a price like `$1,234.56`), not what they are.

## Entry and exit criteria

**Before a test run**

- mb.io can be reached from the machine running the tests.
- Dependencies and browsers are installed (`npm ci` and `npx playwright install`).

**The run is complete when**

- All tests pass in Chromium, and then in one full run across Chromium, Firefox and WebKit.
- Every failure has been looked into: a site problem is written down with its evidence, and a test problem is fixed.
- No test is flaky. A test that only passes when run again counts as a problem, not a pass.
- The README and these documents still match what the tests do.

## Known limitations

- The tests depend on the live website. Changes to marketing copy, market data or third-party services show up as failures, and some of those will be content changes rather than bugs.
- Expected page content was taken from the UAE site (`/en-AE/`).
- Only first-party links in the home page header and footer are checked for broken links. Other companies' sites, such as the Hacken audit page, are outside MultiBank's control and are left out.
- The two assumptions behind the tests (the Why MultiBank page and the home page app link) are listed in the README.
