// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// A common laptop screen size, comfortably above the 1024px width where
// mb.io switches from the full top navigation to the mobile menu.
const desktopViewport = { width: 1440, height: 900 };

module.exports = defineConfig({
  testDir: './tests',

  // Every test opens its own page and does not depend on another test,
  // so tests can run in parallel. This also exposes any hidden dependency.
  fullyParallel: true,

  reporter: [
    // One line per test in the terminal, prefixed with the browser it ran in.
    ['list'],
    // Full HTML report in playwright-report/, opened with `npm run report`.
    // 'never' keeps a failed run from blocking the terminal with a report server.
    ['html', { open: 'never' }],
  ],

  use: {
    // Keep the trailing slash: tests open pages with relative paths such as
    // page.goto('explore'), which resolves to https://mb.io/en-AE/explore.
    baseURL: 'https://mb.io/en-AE/',

    // The site's marketing SDK (MoEngage) installs a service worker that takes over
    // the page's network requests a few seconds after load. page.route() cannot always
    // see requests that go through a service worker (WebKit lets them through), which
    // breaks the tests that simulate or hold market data. No tested feature uses it.
    serviceWorkers: 'block',

    // Failure evidence only; passing tests produce no artifacts.
    // Raw screenshots and traces are written to test-results/.
    screenshot: 'only-on-failure',

    // A trace is recorded for every test but kept only when the test fails,
    // so any failure can be replayed step by step with the trace viewer.
    trace: 'retain-on-failure',
  },

  // The same tests run in all three browser engines.
  // Desktop presets send a normal browser user agent; plain headless Chromium
  // identifies itself as "HeadlessChrome", which bot protection can treat differently.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: desktopViewport },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: desktopViewport },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: desktopViewport },
    },
  ],
});
