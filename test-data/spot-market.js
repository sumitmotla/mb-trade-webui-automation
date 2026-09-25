// The categories of the Spot market section, in the order they appear.
// Each button label is paired with the category id used in the market data
// response that the Explore page loads (the market/widget request).
const marketCategories = [
  { label: 'Hot', id: 'hot' },
  { label: 'Gainers', id: 'gainers' },
  { label: 'Losers', id: 'losers' },
];

// The table shows the first 15 trading pairs of the selected category.
const displayedTradingPairLimit = 15;

// Live market values change all the time, so the tests check their format,
// never the values themselves.
const tradingPairFormats = {
  symbol: /^[A-Z0-9]+$/,
  price: /^\$\d{1,3}(,\d{3})*\.\d{2}$/,
  change: /^\d+\.\d{2}%$/,
  coinPageLink: /\/explore\/[A-Z0-9]+$/,
};

module.exports = { marketCategories, displayedTradingPairLimit, tradingPairFormats };
