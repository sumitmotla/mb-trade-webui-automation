# Release Readiness Checklist

Use this before calling the tested part of mb.io ready. It covers the Task 1 web automation; release thinking for the Task 2 mobile app is in the [Task 2 document](task-2-fintech-testing-strategy.md). Tick a box only when it is true for the current code and the latest run. If a box can't be ticked, add a note and make a decision on it.

## Functional checks

- [ ] Navigation & layout tests pass: menu items, destinations, direct page access and desktop layout.
- [ ] Trading tests pass: Spot market categories, category contents and trading pair details.
- [ ] Content & links tests pass: home page hero, Explore promotions, app store links and the Why MultiBank page.
- [ ] Negative and edge-case tests pass: Page Not Found, mobile menu, broken links and the market data timeout.

## Browser coverage

- [ ] One full run in Chromium, Firefox and WebKit with `npm test`.
- [ ] Results checked for each browser, not just the overall total.
- [ ] The broken-link test is the only skipped test, and only in Firefox and WebKit.
- [ ] No browser-specific timeouts or workarounds were added to make a browser pass.

## Test quality

- [ ] No flaky tests: nothing passed only after a retry.
- [ ] No `test.only` and no fixed waits (`waitForTimeout`) in the tests.
- [ ] Tests pass when run on their own as well as in the full parallel run.
- [ ] Every failure seen in the final runs has a known cause.

## Test evidence

- [ ] The HTML report from the final three-browser run has been kept. The report folder is not committed to Git, so it needs to be saved separately.
- [ ] Screenshots and traces of any failures have been reviewed.
- [ ] Each failure is recorded with its cause: site problem, test problem or environment.

## Known issues and risks

- [ ] The live-site limitations in the README are understood and accepted.
- [ ] The [risk matrix](risk-matrix.md) has been reviewed.
- [ ] Each issue below has a decision: fix before release, or accept and track.

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
| The Spot market first shows 12 of its 15 pairs; the rest appear after the next data reload, about five seconds later. | Spot market | Low |
| Page Not Found has an empty page title and its menu links drop the region, and the same JavaScript error appears on every page. | Whole site | Low |

## Final decision

- [ ] **Ready:** every box above is ticked.
- [ ] **Ready with known issues:** the open items and the reason for accepting them are noted below.
- [ ] **Not ready:** the blocking items are noted below.

Notes:
