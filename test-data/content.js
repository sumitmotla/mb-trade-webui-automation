// The promotions at the top of the Explore page, in the order they appear.
// Marketing may rotate them, so they are kept here in one place.
const explorePromotions = [
  'Earn interest on your assets',
  'Get crypto with your card',
  'Deposits using card or wire transfer',
];

// App download links on the site point to an Adjust "smart link", which
// sends each device to the MultiBank app in its own app store.
const multiBankApp = {
  smartLinkPattern: /^https:\/\/mbio\.go\.link\//,
  appStoreListing: 'https://apps.apple.com/app/id1592119946',
  androidPackage: 'com.multibank.app',
  googlePlayListing: 'https://play.google.com/store/apps/details?id=com.multibank.app',
};

// Where the smart link should send each phone with its first redirect.
// deviceName is the Playwright device whose user agent is sent.
const appDownloadRedirects = [
  {
    phone: 'iPhone',
    deviceName: 'iPhone 13',
    store: 'the App Store',
    // Straight to the MultiBank app's App Store listing.
    expectedRedirectStart: multiBankApp.appStoreListing,
    expectedRedirectParts: [],
  },
  {
    phone: 'Android',
    deviceName: 'Pixel 7',
    store: 'Google Play',
    // An Android app intent: it opens the MultiBank app, or falls back to
    // the app's Google Play listing when the app is not installed.
    expectedRedirectStart: 'intent://',
    expectedRedirectParts: [
      `package=${multiBankApp.androidPackage}`,
      `S.browser_fallback_url=${multiBankApp.googlePlayListing}`,
    ],
  },
];

// The sections of the Why MultiBank page, each with its heading and a few
// stable key texts. Short sentences and labels are used instead of whole
// paragraphs, so small copy edits do not break the test.
const whyMultiBankSections = [
  {
    heading: 'Why MultiBank Group?',
    keyTexts: [
      'For nearly two decades, MultiBank has built a reputation',
      'Annual turnover',
      'Customers worldwide',
      'Offices globally',
    ],
  },
  {
    heading: 'A tradition of global leadership',
    keyTexts: ['Founded in 2005, MultiBank has grown into one of the largest financial groups worldwide'],
  },
  {
    heading: 'Innovation with purpose',
    keyTexts: ['We believe technology should simplify finance.'],
  },
  {
    heading: 'Integrity built into every decision',
    keyTexts: ['Trust is earned through consistent action.'],
  },
  {
    heading: 'The strength behind MultiBank Group',
    keyTexts: ['Regulation at our core', 'Proven track record', 'Secure & trusted'],
  },
  {
    heading: 'Community & Media',
    keyTexts: ['The latest news and discussions about MultiBank Group.'],
  },
];

module.exports = { explorePromotions, multiBankApp, appDownloadRedirects, whyMultiBankSections };
