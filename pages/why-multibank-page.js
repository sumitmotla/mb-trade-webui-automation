// The Why MultiBank page, reached through "Company" in the top navigation.
class WhyMultiBankPage {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.goto('company', { waitUntil: 'domcontentloaded' });
  }

  sectionHeading(heading) {
    return this.page.getByRole('heading', { name: heading, exact: true });
  }

  sectionText(text) {
    return this.page.getByText(text);
  }
}

module.exports = { WhyMultiBankPage };
