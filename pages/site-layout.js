// The parts of the page that every mb.io page shares: the header with the
// top navigation and the mobile menu, the page heading and the footer.
class SiteLayout {
  constructor(page) {
    this.page = page;
    this.header = page.getByRole('banner');
    this.mainNavigation = page.getByRole('navigation', { name: 'Main', exact: true });
    this.mainNavigationLinks = this.mainNavigation.getByRole('link');
    // Always in the page, but only shown below the 1024px desktop breakpoint.
    this.mobileMenuButton = page.getByRole('button', { name: 'Open menu', exact: true });
    this.closeMobileMenuButton = page.getByRole('button', { name: 'Close menu', exact: true });
    // The open mobile menu is the dialog that holds the Close menu button.
    this.mobileMenu = page.getByRole('dialog').filter({ has: this.closeMobileMenuButton });
    this.mobileMenuLinks = this.mobileMenu.getByRole('navigation').getByRole('link');
    // The h1 of whichever page is currently open.
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.footer = page.getByRole('contentinfo');
  }

  navigationLink(label) {
    return this.mainNavigation.getByRole('link', { name: label, exact: true });
  }

  // All positions are read in one go, so they always describe the same layout.
  // Reading links one by one is not safe: the menu briefly shows a fallback
  // font before its web font arrives, and the text widths change at that moment.
  // Positions are rounded to whole pixels: the links sit directly next to
  // each other, and browsers report sub-pixel values slightly differently.
  async getNavigationItemPositions() {
    return this.mainNavigationLinks.evaluateAll((navigationLinks) => {
      return navigationLinks.map((navigationLink) => {
        const linkBox = navigationLink.getBoundingClientRect();

        return {
          label: navigationLink.innerText,
          top: Math.round(linkBox.top),
          left: Math.round(linkBox.left),
          right: Math.round(linkBox.right),
        };
      });
    });
  }

  async hasHorizontalScroll() {
    return this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
  }

  // Every link in the header and footer as a full URL, listed once
  // (the logo, for example, appears in both).
  async getHeaderAndFooterLinkUrls() {
    await this.footer.waitFor();
    const headerLinkUrls = await this.header.getByRole('link').evaluateAll((links) => links.map((link) => link.href));
    const footerLinkUrls = await this.footer.getByRole('link').evaluateAll((links) => links.map((link) => link.href));

    const uniqueLinkUrls = new Set([...headerLinkUrls, ...footerLinkUrls]);
    return [...uniqueLinkUrls];
  }
}

module.exports = { SiteLayout };
