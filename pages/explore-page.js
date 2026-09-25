class ExplorePage {
  constructor(page) {
    this.page = page;

    // The request that returns the Hot, Gainers and Losers lists of trading pairs.
    this.marketCategoriesUrl = '**/api/io/v1/market/widget';

    this.spotMarketHeading = page.getByRole('heading', { name: 'Spot market', exact: true });

    // The category buttons sit in an unlabelled carousel region,
    // which is identified by the Hot button it contains.
    this.categoryBar = page.getByRole('region').filter({ has: page.getByRole('button', { name: 'Hot', exact: true }) });
    this.categoryButtons = this.categoryBar.getByRole('button');

    this.spotMarketTable = page.getByRole('table');
    // While loading, the table can show an empty placeholder row,
    // so only rows that contain a coin link count as trading pairs.
    this.tradingPairRows = this.spotMarketTable.getByRole('row').filter({ has: page.getByRole('link') });
    // The symbol is the first of two plain text spans inside each coin link.
    this.tradingPairSymbols = this.spotMarketTable.getByRole('link').locator('span:first-child');

    this.marketDataErrorMessage = page.getByText('Please try again', { exact: true });
  }

  async open() {
    await this.page.goto('explore', { waitUntil: 'domcontentloaded' });
  }

  // The page reloads the category lists about every 5 seconds, and the ranking
  // can change between reloads. To compare the table with the data behind it,
  // the first real response is kept and served again for every reload.
  // Returns that response so the test can check it.
  async openWithSteadyMarketCategories() {
    let firstMarketCategoriesResponse;

    await this.page.route(this.marketCategoriesUrl, async (route) => {
      if (!firstMarketCategoriesResponse) {
        firstMarketCategoriesResponse = await route.fetch();
      }
      await route.fulfill({ response: firstMarketCategoriesResponse });
    });

    const marketCategoriesResponsePromise = this.page.waitForResponse(this.marketCategoriesUrl);
    await this.open();
    return marketCategoriesResponsePromise;
  }

  promotion(title) {
    return this.page.getByText(title, { exact: true });
  }

  categoryButton(label) {
    return this.categoryBar.getByRole('button', { name: label, exact: true });
  }

  // The table has no column headers, so cells are found by their position:
  // coin, price, 24-hour change and price chart. The symbol and the name are
  // two plain text spans inside the coin link, with no role or label of their own.
  tradingPairFields(tradingPairRow) {
    const cells = tradingPairRow.getByRole('cell');
    const coinLink = cells.nth(0).getByRole('link');
    const changeCell = cells.nth(2);

    return {
      coinLink,
      symbol: coinLink.locator('span:first-child'),
      name: coinLink.locator('span:last-child'),
      price: cells.nth(1),
      change: changeCell,
      changeDirectionIcon: changeCell.getByRole('img'),
      priceChart: cells.nth(3).getByRole('img'),
    };
  }
}

module.exports = { ExplorePage };
