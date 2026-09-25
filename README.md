# MultiBank Web UI Automation

## Overview

This repository is the Task 1 submission for the MultiBank QA Automation coding challenge (Web UI Automation Framework).

The framework is deliberately small: five page objects, separated test data, and tests whose titles describe product behaviour in plain language.

## At a glance

- **Project:** Playwright web UI automation framework for the MultiBank public website.
- **Application under test:** [mb.io/en-AE](https://mb.io/en-AE/)
- **Coverage:** navigation & layout, the Spot market, content & links, and negative/edge-case scenarios.
- **Browsers:** Chromium, Firefox and WebKit.
- **Task 2:** the mobile fintech testing strategy is documented separately in [docs/task-2-fintech-testing-strategy.md](docs/task-2-fintech-testing-strategy.md).

## Target URL and scope

The assignment references trade.multibank.io. During implementation, that public trading URL redirected to a login flow. The public MultiBank website at mb.io/en-AE, the alternative target provided with the assignment, offered the accessible, no-login flows the assignment requires.

This framework therefore focuses on the public MultiBank website. It does not log in, create an account, or enter any personal or financial information.

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
├── tests/                      One spec file per assignment area
│   ├── navigation.spec.js
│   ├── trading.spec.js
│   ├── content-and-links.spec.js
│   └── edge-cases.spec.js
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
| `npm run test:chromium` | All tests in Chromium only (the development loop) |
| `npm run test:firefox` | All tests in Firefox only |
| `npm run test:webkit` | All tests in WebKit only |
| `npm run report` | Opens the HTML report of the last run |

A single spec file or test can be run with the Playwright CLI:

```bash
npx playwright test tests/trading.spec.js --project=chromium
npx playwright test -g "mobile layout" --project=chromium
```

## Browser Support

The same tests run in three Playwright projects. Each uses Playwright's desktop device settings, which send a normal browser user agent, with a 1440×900 viewport.

| Project | Device settings |
|---|---|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `webkit` | Desktop Safari |

Expectations and timeouts are identical in every browser; there are no browser-specific workarounds. The one intentional difference: the broken-link check only compares HTTP status codes, which do not depend on the browser, so it runs once in Chromium and is reported as skipped in Firefox and WebKit.

Tests that need another screen size set it themselves: three desktop sizes for the navigation layout test and 390×844 for the mobile layout test.

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
| | spot market should show a retry message when market data times out | Timeout simulated with network interception; message shown, no trading pairs, page still usable |

The assignment asks for at least two edge cases. Four are included because each covers a different real-world failure: a bad or outdated URL, a small screen, a broken link, and a market data service that does not respond.

## Framework Design

- **Page objects** in `pages/` hold the UI locators and page interactions. They contain no assertions.
- **Tests** in `tests/` contain the behavioural assertions. Test titles describe the product behaviour being verified.
- **`SiteLayout`** represents the structure every page shares (header, top navigation, mobile menu, page heading and footer), so no separate components layer is needed.
- **Test data** in `test-data/` holds values that several tests reuse, or product data that can change, such as menu items, market categories and marketing copy. Values used by a single test stay in that test.
- **No BasePage, helper, utility or fixture layer.** Each page's `open()` is a single line and tests create their page objects explicitly, so the current scope does not justify that abstraction.
- **Data-driven tests** are generated from the test data: menu items, desktop viewports, market categories, primary pages, app download expectations and Why MultiBank sections.
- **Independent tests.** Every test starts from its own page in a fresh browser context, shares no mutable state and can run in any order. `fullyParallel` is enabled, and network interception is only ever set on the test's own page.
- **No fixed sleeps.** Waiting relies on Playwright's auto-waiting locators and assertions, events and network synchronisation.

## Key Design Decisions

**Base URL.** `https://mb.io/en-AE/` is configured with a trailing slash, and pages are opened with relative paths such as `page.goto('explore')`, so the locale stays in every URL.

**Locators.** Locators use roles and accessible names wherever the site provides them. The Spot market table has no column headers and the coin symbol and name are unlabelled text, so those cells are located by position. These structural locators are kept inside `ExplorePage` with a comment explaining why.

**Dynamic market data.** The Spot market reloads its category data about every five seconds, and the rankings can change between reloads. For the category test, the framework captures the application's own market data response (the `market/widget` request) and serves that same response for the page's later reloads during the test. The table can then be compared deterministically with the data the application received. Only this one request is held steady; the rest of the page, including prices, loads live. Exact market values are never asserted: the tests check the relationship between the displayed trading pairs and the response, plus the formats of the displayed values.

**Store links.** The automated store-resolution check uses the homepage "Download the app" smart link. The OTC Desk App Store and Google Play badges share an Adjust smart link, and the iPhone flow passes through an Adjust app-link page. HTTP-only validation of that badge flow would depend on third-party page content, so the homepage smart link is used for the deterministic redirect assertion. The test requests the link with an iPhone and an Android user agent and checks only the first redirect: the App Store listing for iPhone, and an Android app intent for `com.multibank.app` with the Google Play listing as its fallback. No store page is opened.

**Page loading.** Pages are opened with `waitUntil: 'domcontentloaded'`. The browser's full `load` event waits for many third-party marketing scripts and can take many seconds, while every test step already waits for the element it needs.

**Bounded waits for real application behaviour.** Two waits are longer than Playwright's default 5 seconds, and each is explained in the code. The Spot market table and the market data error message each get 15 seconds: during development the table took 7 to 8 seconds to fill, and the page retries a failed request three more times, about 7 seconds, before showing its message. The broken-link check gives each link 10 seconds and records a slow or unreachable link as a failure with its URL.

**Network checks strengthen the UI tests.** Network access is used only where it gives stronger evidence than the UI alone: the market data response, the smart-link redirect, link status codes and the simulated timeout. There is no separate API test framework.

## Assumptions and Limitations

**Assumptions**

- "About Us → Why MultiBank" is represented by the site's Why MultiBank page, reached through "Company" in the top navigation (`/company`, heading "Why MultiBank Group?").
- Store resolution is validated through the deterministic homepage smart-link redirect, as described under Key Design Decisions. The OTC Desk badges are not part of the automated check.

**Limitations**

- The suite runs against the live production website. Marketing copy, market data and third-party services can change or respond slowly, and such changes show up as test failures.
- The site chooses the locale region from the visitor's location, for example `/en-AE/` in the UAE. URL assertions check the end of the path, so they do not depend on the locale prefix.
- The broken-link check covers first-party links in the home page header and footer only. Third-party destinations, such as the Hacken security audit, which blocks automated requests, are outside MultiBank's control and are excluded.

## Test Reporting

- **List reporter:** one line per test in the terminal, prefixed with the browser it ran in.
- **HTML reporter:** a full report in `playwright-report/`, opened with `npm run report`. Each result is tagged with its browser.
- **Failure evidence:** when a test fails, a screenshot and a Playwright trace are kept in `test-results/` and attached to the HTML report. A trace can also be opened directly with `npx playwright show-trace <path-to-trace.zip>`. Passing tests produce no screenshots, traces or videos.
- The HTML report is generated locally and is not committed to Git; `playwright-report/` and `test-results/` are listed in `.gitignore`.
