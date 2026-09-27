# Test Execution

This page records the final test run and the runs that led to it. The tests themselves are described in the [README](../README.md) and the [test plan](test-plan.md).

## Final Execution Result

This is the final, clean run of the full suite in all three browsers.

- **Command:** `npm test`
- **Date:** 27 September 2026
- **Result:** 91 passed, 0 failed, 0 flaky, 2 skipped (93 tests in total)

| Browser | Passed | Failed | Skipped |
|---|---:|---:|---:|
| Chromium | 31 | 0 | 0 |
| Firefox | 30 | 0 | 1 |
| WebKit | 30 | 0 | 1 |

The two skips are intentional. The first-party broken-link check only compares HTTP status codes, which don't depend on the browser, so it runs in Chromium only and shows as skipped in Firefox and WebKit.

## Execution History

The suite needed two fixes before the final run. Both problems appeared only in the three-browser runs, one in WebKit and one in Firefox.

| Run | What happened |
|---|---|
| 1. Chromium baseline | All tests passed in Chromium. |
| 2. First three-browser run | Chromium and Firefox passed. In WebKit, the market data timeout test failed. A third-party service worker on the site was handling the market data request, and Playwright's request interception in WebKit could not see it, so the simulated timeout never happened. The fix was to block service workers in the Playwright configuration, for all three browsers. The WebKit market data tests then passed. |
| 3. Second three-browser run | The only failure was the mobile layout test in Firefox. The menu button was visible before the site's JavaScript was ready, so the test's tap did nothing. The fix was to make the test tap the button again until the menu opens, for up to 10 seconds. The test then passed in Firefox. |
| 4. Final three-browser run | 91 passed, 0 failed, 0 flaky and 2 intentional skips. |

## Environment

- Playwright Test 1.63
- Node.js 24.21.0
- Browsers: Chromium, Firefox and WebKit, installed by Playwright
- Operating system: macOS
- Application under test: the live public MultiBank website, `https://mb.io/en-AE/`
- Internet access is required

## Evidence

Playwright's HTML report shows the result of every test in every browser. When a test fails, the report also keeps a screenshot and a trace that can be replayed step by step. The final run had no failures, so it produced no screenshots or traces.

The report is generated in `playwright-report/` and opened with `npm run report`. That folder is in `.gitignore`, so the report from the final run is saved in the repository as [`docs/final-run-report.html`](final-run-report.html). GitHub does not render this HTML report as an interactive page, so open the saved file locally in a browser.
