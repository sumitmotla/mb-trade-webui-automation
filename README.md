# MultiBank Web UI Automation

## Overview

This repository contains automated UI tests for the public MultiBank website, [mb.io](https://mb.io/en-AE/). The tests are written in JavaScript with Playwright and run in Chromium, Firefox and WebKit. They cover navigation and page layout, the Spot market, important content and links, and negative and edge-case scenarios.

It was built for the MultiBank QA Automation challenge, which also included a separate mobile fintech testing scenario. The written answer to that scenario is in [docs/task-2-fintech-testing-strategy.md](docs/task-2-fintech-testing-strategy.md).

## Target URL and scope

The challenge named trade.multibank.io as the site to test. When these tests were written, that address redirected to a login page. The challenge gave the public MultiBank website, `https://mb.io/en`, as the fallback, so the tests use that site instead.

When `https://mb.io/en` is opened from the UAE, where these tests were written, the site redirects to `https://mb.io/en-AE`. For that reason, the tests use `https://mb.io/en-AE/` as their base URL.

The tests only use public pages. They do not log in, create an account, or enter any personal or financial information.

## Technology Stack

| Area | Choice |
|---|---|
| Test framework | Playwright Test 1.63 (`@playwright/test`) |
| Language | JavaScript (Node.js, CommonJS modules) |
| Browsers | Chromium, Firefox and WebKit, installed by Playwright |
| Reporting | Playwright's built-in list and HTML reporters |

## Project Structure

```
.
├── pages/                      Page objects: locators and page interactions
│   ├── site-layout.js          Header, top navigation, mobile menu, page heading, footer
│   ├── home-page.js            Home page hero and its actions
│   ├── explore-page.js         Explore page promotions and the Spot market
│   ├── why-multibank-page.js   Why MultiBank page (the "Company" menu item)
│   └── not-found-page.js       Page Not Found
├── test-data/                  Expected values shared by the tests
│   ├── navigation.js           Menu items, destinations, page headings, desktop viewports
│   ├── spot-market.js          Market categories, display limit, value formats
│   └── content.js              Explore promotions, app download expectations, Why MultiBank sections
├── tests/                      One spec file per test area
│   ├── navigation.spec.js
│   ├── trading.spec.js
│   ├── content-and-links.spec.js
│   └── edge-cases.spec.js
├── docs/                       QA documents
│   ├── test-plan.md
│   ├── test-execution.md
│   ├── risk-matrix.md
│   ├── release-readiness.md
│   └── task-2-fintech-testing-strategy.md
├── playwright.config.js        Base URL, browser projects, viewport and reporting
└── package.json                npm scripts and the Playwright dependency
```

## Prerequisites

- Node.js 24.21.0 (the version used for development) and npm
- Internet access to https://mb.io, because the tests run against the live website

## Installation

```bash
npm ci
npx playwright install
```

On Linux, use `npx playwright install --with-deps` to install the browsers' system libraries as well.

## Running Tests

Run the complete suite in Chromium, Firefox and WebKit:

```bash
npm test
```

| Command | What it runs |
|---|---|
| `npm test` | All tests in Chromium, Firefox and WebKit |
| `npm run test:chromium` | All tests in Chromium only (quickest for local runs) |
| `npm run test:firefox` | All tests in Firefox only |
| `npm run test:webkit` | All tests in WebKit only |
| `npm run report` | Opens the HTML report of the last run |

A single spec file or test can be run with the Playwright CLI:

```bash
npx playwright test tests/trading.spec.js --project=chromium
npx playwright test -g "mobile layout" --project=chromium
```

## Browser Support

The same tests run in Chromium, Firefox and WebKit, set up as three Playwright projects. Each project uses Playwright's desktop settings for its browser and a 1440×900 window. These settings send a normal browser user agent. Plain headless Chromium sends "HeadlessChrome" instead, which bot protection can treat differently.

| Project | Device settings |
|---|---|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `webkit` | Desktop Safari |

Every browser gets the same checks and the same time limits, and there are no browser-specific workarounds. The only difference is the broken-link check. It only compares HTTP status codes, which do not depend on the browser, so it runs once in Chromium and is reported as skipped in Firefox and WebKit.

Two tests set their own screen size. The navigation layout test uses three desktop sizes, and the mobile layout test uses 390×844.

## Test Coverage

| Area | Test | Notes |
|---|---|---|
| Navigation & Layout | home page should display all expected top navigation items | Exact list and order of the 7 menu items, all visible |
| | each top navigation item should open the correct destination | One case per item: 6 pages by URL and page heading, and $MBG in a new tab |
| | top navigation should fit on one row and behave correctly at standard desktop viewports | 1280×720, 1366×768 and 1920×1080: one row, no overlap, no mobile menu button, no sideways scrolling, header stays visible while scrolling |
| | each primary public page should be accessible directly by its URL | The 6 pages opened directly: HTTP 200 and the expected heading |
| Trading | spot market should display trading pairs under Hot, Gainers and Losers categories | Categories in order and a full table of 15 trading pairs |
| | each spot market category should display the expected trading pairs | One case per category, compared with the market data response the page received |
| | each trading pair should display its symbol, name, price, 24-hour change and price chart | Value formats and presence, never live values |
| Content & Links | home page hero banner should appear at the top of the page with the required actions | Hero and both actions on the first screen, below the header |
| | Explore page promotional banners should appear between the page title and Spot market | Each promotion positioned between the two headings |
| | App Store and Google Play links should resolve to the correct app stores | iPhone and Android cases, checked through HTTP redirects |
| | Why MultiBank page should display the expected headings and section content | Every section heading with its key text |
| Negative / Edge | unknown page address should display the Page Not Found page and a way back home | HTTP 404, the not-found page and a working link back home |
| | mobile layout should replace the top navigation with a menu containing all expected items | 390×844: menu button, no sideways scrolling, same 7 items, menu closes |
| | header and footer first-party links should not be broken | Every first-party link in the home page header and footer returns a status below 400 |
| | spot market should show a retry message when market data times out | Timeout simulated with network interception. Message shown, no trading pairs, page still usable |

## Framework Design

- **Page objects** in `pages/` find the elements on each page and perform page actions, such as opening the page. They do not contain any checks.
- **Tests** in `tests/` contain all the checks. Each test title describes, in plain language, what the site should do.
- **`SiteLayout`** in `pages/site-layout.js` holds the parts that every page shares: the header, top navigation, mobile menu, page heading and footer. There are only a few shared page elements, so they are kept in this one file instead of adding a separate component layer.
- **Test data** in `test-data/` holds values that several tests use, and product content that may change, such as menu items, market categories and marketing text. A value that only one test uses stays in that test.
- **There is no base page class, helper, utility or fixture layer.** Each page's `open()` method is a single line, and each test creates the page objects it uses, so there is no repeated setup code to share.
- **Several tests are generated from lists in the test data.** For example, there is one test for each menu item, each desktop screen size, each market category and each phone type. The Why MultiBank test checks each section of the page in a separate step, so the report shows which section failed.
- **Tests are independent.** Each test opens its own page in a new browser context and does not depend on any other test, so the tests can run in parallel and in any order (`fullyParallel` is turned on). When a test intercepts network requests, it only does so on its own page, so other tests are not affected.
- **There are no fixed sleeps.** Each step waits for the element, event or network response it needs, using Playwright's built-in waiting.

## Key Design Decisions

**Base URL.** `https://mb.io/en-AE/` is configured with a trailing slash, and pages are opened with relative paths such as `page.goto('explore')`, so the locale stays in every URL.

**Locators.** Locators use roles and accessible names wherever the site provides them. The Spot market table has no column headers, and the coin symbol and name are unlabelled text, so those cells are found by their position. These position-based locators are kept in `ExplorePage`, with a comment explaining why.

**Market data.** Market prices change all the time, so the tests do not check exact prices. The Spot market also reloads its category lists about every five seconds, and the ranking can change between reloads. To compare the table with the data behind it, the category test keeps the first market data response the page receives (the `market/widget` request) and returns that same response each time the page reloads the lists. The data then stays the same for the whole test. Only this one request is held. Prices and the rest of the page still load live. The other trading tests check the format of each value, such as a price like `$1,234.56`, but not the value itself.

**App store links.** The home page "Download the app" link is a smart link from Adjust, a third-party link service, which sends each phone to its own app store. Two tests request this link, one with an iPhone user agent and one with an Android user agent, and check where the first redirect points. For iPhone, it should be the MultiBank app's App Store page. For Android, it should be an `intent://` link that opens the app `com.multibank.app`, with the app's Google Play page as the fallback. No store page is opened, because store pages differ by country. The App Store and Google Play badges on the OTC Desk page are not used for this check. Both badges share a different smart link, and on iPhone that link first opens an Adjust web page before moving on to the App Store. Checking that extra step over HTTP would make the test depend on the content of Adjust's page.

**Page loading.** Pages are opened with `waitUntil: 'domcontentloaded'`. The browser's full `load` event waits for many third-party marketing scripts and can take many seconds, while every test step already waits for the element it needs.

**Longer waits.** Three waits are longer than Playwright's default of 5 seconds. Each one is explained in the code:

- The Spot market table gets up to 15 seconds to fill. During development, all 15 trading pairs took 7 to 8 seconds to appear.
- The market data error message gets up to 15 seconds. After a failed request, the page tries three more times, which takes about 7 seconds, before it shows the message.
- The mobile menu gets up to 10 seconds to open. Its button can appear before the site's JavaScript is ready, and a tap at that moment does nothing. The test taps again until the menu opens, instead of waiting a fixed time.

Separately, the broken-link check limits each link request to 10 seconds. A slow or unreachable link is recorded as a failure with its URL, and the check carries on with the other links.

**Service workers.** The site installs a service worker from a third-party marketing tool. A few seconds after the page loads, this worker starts handling the page's network requests. Playwright's request interception can't always see requests that go through a service worker. In WebKit, some market data requests got past it, so the tests that intercept that request became unreliable. For this reason, service workers are blocked in the test configuration, in the same way for all three browsers. None of the tested features use this worker.

## Assumptions and Limitations

**Assumptions**

- The site's company information is on the Why MultiBank page, which is reached through "Company" in the top navigation (`/company`, heading "Why MultiBank Group?"). The Why MultiBank tests use this page.

**Limitations**

- The suite runs against the live production website. Marketing copy, market data and third-party services can change or respond slowly, and such changes show up as test failures.
- The site chooses the region in the URL from the visitor's location. Visitors outside the UAE may be sent to `/en/` instead of `/en-AE/`. URL checks only look at the end of the path, so they pass either way. The expected page content was taken from the UAE version, so the first run from another country should be checked carefully.
- The broken-link check covers first-party links in the home page header and footer only. Third-party destinations, such as the Hacken security audit, which blocks automated requests, are outside MultiBank's control and are excluded.

## Test Reporting

- **List reporter:** one line per test in the terminal, prefixed with the browser it ran in.
- **HTML reporter:** a full report in `playwright-report/`, opened with `npm run report`. Each result is tagged with its browser.
- **Failure evidence:** when a test fails, a screenshot and a Playwright trace are kept in `test-results/` and attached to the HTML report. A trace can also be opened directly with `npx playwright show-trace <path-to-trace.zip>`. Passing tests produce no screenshots, traces or videos.
- The HTML report is generated locally in playwright-report/. A copy of the final run is saved as docs/final-run-report.html. The `playwright-report/` and `test-results/` folders are listed in `.gitignore`.

## QA Documentation

- [Test plan](docs/test-plan.md): scope, approach and exit criteria for the automated tests
- [Test execution](docs/test-execution.md): final test results and cross-browser execution history
- [Risk matrix](docs/risk-matrix.md): what could make a test fail for the wrong reason or let a real problem slip through, and how that is handled
- [Release readiness checklist](docs/release-readiness.md): what to check after a full test run, and issues found while exploring the site
