class NotFoundPage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Page not found', exact: true });
    this.explanation = page.getByText("Sorry we can't find the page you're looking for.");
    this.backToHomepageLink = page.getByRole('link', { name: 'Back to Homepage', exact: true });
  }

  // Returns the response so the test can check the HTTP status code.
  async open(path) {
    return this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { NotFoundPage };
