# Release Readiness Checklist

This checklist is for the parts of mb.io that the automated tests cover. Use it after a full test run to check that the tests passed in every browser, that the results can be trusted, and that known problems are written down. Tick a box only when it is true for the current code and the latest run. If a box can't be ticked, add a note that explains why.

## Functional checks

- [x] Navigation & layout tests pass: menu items, destinations, direct page access and desktop layout.
- [x] Trading tests pass: Spot market categories, category contents and trading pair details.
- [x] Content & links tests pass: home page hero, Explore promotions, app store links and the Why MultiBank page.
- [x] Negative and edge-case tests pass: Page Not Found, mobile menu, broken links and the market data timeout.

## Browser coverage

- [x] One full run in Chromium, Firefox and WebKit with `npm test`.
- [x] Results checked for each browser, not just the overall total.
- [x] The broken-link test is the only skipped test, and only in Firefox and WebKit.
- [x] No browser-specific timeouts or workarounds were added to make a browser pass.

## Test quality

- [x] No flaky tests: nothing passed only after a retry.
- [x] No `test.only` and no fixed waits (`waitForTimeout`) in the tests.
- [ ] Tests pass when run on their own as well as in the full parallel run. Not checked yet: apart from a few single tests run while fixing problems, the tests have only been run together.
- [x] Every failure seen in the final runs has a known cause.

## Test evidence

- [x] The HTML report from the final three-browser run has been kept. The report folder is not committed to Git, so the report is saved separately as [`docs/final-run-report.html`](final-run-report.html).
- [ ] Screenshots and traces of any failures have been reviewed. Not applicable to the final run, which had no failures.
- [x] Each failure is recorded with its cause: site problem, test problem or environment.

## Known issues and risks

- [x] The limitations in the README and the risks in the [risk matrix](risk-matrix.md) match the current tests.
- [ ] The known issues below have been reported to MultiBank.

These are observations from the live public website, made while exploring mb.io during development (24–25 September 2026). They are outside the automated tests. They have not been formally reported to MultiBank, so the site may have changed since.

| Issue | Where | My view |
|---|---|---|
| Coin pages such as `/explore/BTC` return HTTP 500 when opened directly, even though the page still displays. | Explore, coin pages | High |
| If the price feed fails, every coin shows $0.00 and 0.00% instead of an error. Seen by blocking the price request. | Spot market | High |
| If the market data service returns an empty category list, the whole Explore page crashes. Seen by returning an empty list. | Explore page | Medium |
| Rankings lag behind the displayed price change, so "Losers" can include coins that are going up. | Spot market | Medium |
| Prices under one cent are shown as $0.00. | Spot market | Medium |
| Both OTC Desk store badges use the same link. It stays a dead `#` link when tracking scripts are blocked, and on desktop it opens the trade login page. | OTC Desk | Medium |
| Plain `http://` requests to mb.io and trade.mb.io get no response, so an old `http://` link just hangs for a first-time visitor. Returning visitors are protected by the site's HSTS header. | Whole site | Medium |
| Accessibility gaps: no h1 on the home page, icon buttons without accessible names, category buttons that don't say which one is selected, and price direction shown only by colour and an arrow. | Several pages | Medium |
| The Spot market first shows 12 of its 15 pairs. The rest appear after the next data reload, about five seconds later. | Spot market | Low |
| The Page Not Found page has an empty page title, and its menu links go to `/en/` pages instead of `/en-AE/` pages. | Page Not Found | Low |
| Every page throws the same JavaScript error: "Cannot read properties of undefined (reading 'initialised')". | Whole site | Low |

## Final decision

- [ ] **Ready:** every box above is ticked.
- [x] **Ready with known issues:** the open items are noted below.
- [ ] **Not ready:** the blocking items are noted below.

Notes:

- The final run in Chromium, Firefox and WebKit had no failures and no flaky tests. The results are in [test execution](test-execution.md).
- Open items: the tests have not been run one by one, and the known issues above have not been reported to MultiBank.
- This checklist only covers the parts of mb.io that the automated tests check. It is not a release approval for the MultiBank website.
