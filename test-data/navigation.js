// The top navigation items, in the order they appear in the header.
// The six internal items are also the site's primary public pages.
// Paths are relative to the baseURL, so opening them keeps the locale.
// URL patterns check the end of the path, so they hold whether the site
// serves a page under /en-AE/ or under another locale such as /en/.
const navigationItems = [
  {
    label: 'Explore',
    path: 'explore',
    expectedUrl: /\/explore$/,
    expectedPageHeading: 'Markets at your fingertips',
  },
  {
    label: 'Features',
    path: 'features',
    expectedUrl: /\/features$/,
    expectedPageHeading: 'The power of crypto is yours',
  },
  {
    label: 'OTC Desk',
    path: 'features/otc-desk',
    expectedUrl: /\/features\/otc-desk$/,
    expectedPageHeading: 'Large trades. Zero slippage. Full discretion.',
  },
  {
    label: 'Company',
    path: 'company',
    expectedUrl: /\/company$/,
    expectedPageHeading: 'Why MultiBank Group?',
  },
  {
    label: 'Support',
    path: 'support',
    expectedUrl: /\/support$/,
    expectedPageHeading: "Got questions? We're always here!",
  },
  {
    label: 'Blog',
    path: 'blog',
    expectedUrl: /\/blog$/,
    expectedPageHeading: 'Blog and news',
  },
  {
    label: '$MBG',
    // External token website. The link points to token.multibankgroup.com,
    // which currently redirects to token.mb.io, so either host is accepted.
    expectedUrl: /^https:\/\/token\.(multibankgroup\.com|mb\.io)\//,
    opensInNewTab: true,
  },
];

// Common desktop screen sizes, all above the 1024px width where the site
// replaces the top navigation with a mobile menu button.
const desktopViewports = [
  { name: 'small laptop', width: 1280, height: 720 },
  { name: 'common laptop', width: 1366, height: 768 },
  { name: 'full HD desktop', width: 1920, height: 1080 },
];

module.exports = { navigationItems, desktopViewports };
