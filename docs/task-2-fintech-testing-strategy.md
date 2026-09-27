# Task 2: Mobile Fintech Testing Strategy

**Scenario.** I've just joined a fintech startup as a QA engineer. The mobile trading app for iOS and Android goes live in two weeks. There is no test suite and no QA documentation, the team has been shipping fast, and real user money is involved.

**Assumptions.** The app lets users sign up and verify their identity, deposit money, buy and sell, and withdraw. There is a test environment with test accounts, and the team can add server-side switches if needed. If any of that isn't true, finding out is part of day one.

## 1. Where do you start?

With understanding, not test cases. In the first day or two I would:

- **Talk to the product owner and the lead developers.** What's in the release? What changed recently? What worries them? Which bugs are already known?
- **Get access to everything.** Test builds for both platforms, the test environment, test accounts with test money, admin tools, logs and crash reports.
- **Use the app myself** on one iPhone and one Android phone. A quick tour of the main flows tells me more about the real state of the app than any document.
- **Follow the money.** Deposit, balance, buy or sell, balance again, withdraw. For each step I want to know where the money is recorded, what can fail, and what the user sees when it does.
- **Write a short risk list** and agree with the team what must work before release. Two weeks isn't enough to test everything, so we need to agree early on what "ready" means.

I'd also agree how we rate bugs. In a trading app, anything that can show a wrong balance or move money wrongly is a blocker, even if it's rare.

## 2. How would you approach testing this app?

Risk first. The flows that touch money or account access get tested in depth; everything else gets lighter coverage.

**Core flows:** login and 2FA, deposits, balances, buying and selling (including fees and order types), withdrawals, transaction history, and sign-up with identity checks. For each one I test the normal path, then the things that go wrong:

- not enough balance, minimum and maximum amounts, amounts with many decimal places
- tapping "Buy" twice, or losing the network right after tapping it
- the price changing between the quote and the confirmation
- the app going to the background, or the session expiring, in the middle of a transaction

**Backend, not just the screen.** A screen can show the right number while the data behind it is wrong. For money flows I'd check the API responses and the transaction records too: one tap creates one order, a retried request doesn't charge twice, and balances add up after every deposit, trade and withdrawal.

**Data accuracy.** Prices, percentages, fees and totals must be correct and rounded properly. While building the mb.io web tests in this repository, I found the MultiBank website showing prices under one cent as $0.00, and every price as $0.00 when I made the price feed fail. Those are the kinds of display problems I'd check for in the app.

**Devices and networks.** A small device list based on the expected users: a recent and an older iPhone, a few popular Android phones including a cheaper one, and different screen sizes. Then slow and unstable connections, airplane mode, and switching between Wi-Fi and mobile data. Emulators are fine early on, but the final checks happen on real devices, using the actual store build rather than a debug build.

**Security basics.** Session timeout, logout, 2FA, biometric login, whether one user can see another user's data by changing an ID in a request, and whether sensitive data ends up in logs or screenshots. With real money at stake, I'd also push for a proper security review by a specialist. QA catches the obvious problems but doesn't replace that.

**Automation.** In two weeks I'd start small: API tests for the money flows first, because they're fast and stable, then a short UI smoke test on both platforms. Most of the confidence for this first release will come from focused manual and exploratory testing. Automation grows sprint by sprint after launch.

## 3. What does QA look like inside a sprint, from ticket creation through to regression?

- **Refinement.** I read tickets before they enter the sprint. Are the acceptance criteria clear and testable? What are the edge cases? What test data do we need? A question here costs minutes; the same question after the code is written costs days.
- **Planning.** Testing time is part of the estimate, not something squeezed in at the end.
- **During development.** I prepare test ideas and test data while the feature is being built, and talk to the developer about edge cases early. Developers own the unit tests; I look at how the feature behaves as a whole.
- **Testing the story.** When the build is ready, I test the acceptance criteria, then explore around them on iOS and Android. Every bug gets clear steps, the device and OS version, and a screenshot or video.
- **Definition of done.** Tested on both platforms, critical bugs fixed, and useful automated checks added.
- **Regression.** Automated checks run on every build. Before each release I run the regression suite, plus a manual pass over what changed and over the money flows. Every failure is either fixed or knowingly accepted.
- **After release.** I watch crash reports and support tickets. Every bug that reached users gets a regression test, so it can't come back the same way.

## 4. What does your ideal regression suite look like?

Small, fast and trusted. A suite nobody trusts is worse than no suite, because people stop reading its results.

- **Mostly API tests.** Balances, fees, order limits and transaction states are business rules, and the API is the best place to test them. These tests are quick and don't break when the screens change.
- **A few mobile end-to-end tests** for the journeys that matter most: log in, deposit, buy, sell, withdraw and check the history. They run on real iOS and Android devices, for example in a device cloud.
- **Two levels.** A smoke run of a few minutes on every build, and the full suite before each release.
- **Its own test data.** Tests create the accounts and balances they need, so a run doesn't depend on what someone changed by hand yesterday.
- **Stable market data.** Prices move all the time, so tests shouldn't depend on live values. In the mb.io web tests in this repository, the category test holds the page's own market data response still while it compares, so the next data reload can't upset the result. The same idea could be used in the app's tests.
- **No flaky tests.** A flaky test gets fixed or removed straight away, not rerun until it passes.
- **Useful failures.** Every failure comes with a screenshot, log or trace, so anyone can tell a real bug from a test problem.
- **A short manual checklist** for what automation does badly: how screens look, gestures, OS permission pop-ups and the final store build.

## 5. What would keep you up at night about this app specifically and releasing to the public?

- **Money going wrong.** A double tap or a network retry that creates two orders or two withdrawals. Rounding errors that add up over thousands of trades. A balance that doesn't match the records. Users don't forgive these.
- **Wrong or stale prices.** If the app shows an old price, or $0.00 when a feed fails, people trade on bad information. While building the mb.io web tests, I saw the MultiBank website show $0.00 for every coin when I made the price feed fail, and category rankings that lagged behind the displayed prices. That's why this area would get extra attention.
- **Account security.** Account takeover, weak session handling, or one user seeing someone else's data.
- **Launch-day load.** We probably can't test real launch traffic in two weeks, and a busy market day will push the system harder than any test.
- **Slow fixes.** A mobile fix has to go through app store review, which can take days. I'd want a way to switch off a broken feature from the server, a staged rollout, and a clear rollback plan.
- **Not knowing something broke.** Before launch we need crash reporting, alerts for failed transactions, and a daily check that balances and transaction records agree.
- **Regional rules.** Trading apps are regulated, and availability differs by country; the real mb.io app, for example, wasn't available in the US App Store when I checked. Identity checks and country restrictions must work before real users arrive.

If time runs short, I'd rather launch fewer features that are properly tested than everything half-tested, and I'd raise that trade-off early, not in the last week.
