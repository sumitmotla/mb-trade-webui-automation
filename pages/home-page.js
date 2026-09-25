class HomePage {
  constructor(page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', { name: 'Crypto for everyone', exact: true });
    this.downloadAppLink = page.getByRole('link', { name: 'Download the app', exact: true });
    this.openAccountLink = page.getByRole('link', { name: 'Open an account', exact: true });
  }

  // An empty path opens the baseURL itself (https://mb.io/en-AE/).
  // The page's "load" event waits for a dozen third-party marketing scripts
  // and can take many seconds, so we only wait for the HTML to be ready.
  // Every test step then waits for the exact element it needs.
  async open() {
    await this.page.goto('', { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { HomePage };
