# Dalio-Adjusted Portfolio Dashboard

Interactive portfolio dashboard built around Ray Dalio's All-Weather principles. Tracks a real portfolio with live market data, deployment triggers, and rebalancing rules.

**Live site:** Deployed via GitHub Pages

## Features

- **Doughnut chart & sleeve breakdown** — Visual allocation with Dalio target range comparison
- **Live market prices** — Current prices for all 12 holdings fetched from Yahoo Finance with 3-strategy CORS fallback
- **SPY drawdown monitor** — Auto-refreshing live SPY status with deployment trigger signals
- **SPY drawdown calculator** — Manual price entry for calculating drawdown percentages
- **Deployment ladder** — Three-tier SGOV deployment strategy at -10%, -15%, -25% SPY drawdowns
- **Portfolio rationale** — Expandable deep-dives into each position's Dalio alignment
- **Rebalancing rules** — Quarterly rebalance, drift thresholds, permanent floors
- **localStorage caching** — SPY and price data cached for reliability; stale data shown when fetches fail

## How to Update Your Portfolio

All portfolio data lives in **one place**: the top of `script.js`.

### 1. Update holdings

Edit the `HOLDINGS` array — just change the `dollar` values:

```javascript
const HOLDINGS = [
  { ticker: 'VTI',  sleeve: 'Broad Market',  dollar: 808.55 },
  { ticker: 'SGOV', sleeve: 'Dry Powder',     dollar: 607.12 },
  // ... update dollar amounts, add/remove positions
];
```

### 2. Update the date

```javascript
const PORTFOLIO_DATE = 'February 24, 2026';
```

### 3. That's it

Everything else computes automatically:
- Portfolio total and position count
- Allocation percentages for each holding
- Sleeve-level percentages (Equities, Real Assets, Dry Powder, Crypto)
- All HTML text (header, footer, chart labels, summary stats, callouts)
- Rationale section titles and percentage references

## Architecture

```
index.html    — Page structure (static shell, populated by JS)
script.js     — All data, logic, and DOM rendering
styles.css    — Dark theme with CSS custom properties
.github/      — GitHub Actions workflow for Jekyll deployment
```

### Data flow

1. `HOLDINGS` array (dollar values) is the single source of truth
2. `PORTFOLIO_TOTAL`, `PORTFOLIO_COUNT`, and `pct` fields are computed on load
3. `SLEEVES` percentages are computed from their member holdings
4. `syncDynamicValues()` updates all hardcoded HTML text from computed values
5. `initLivePrices()` fetches current market prices asynchronously
6. `initSpyLive()` fetches SPY drawdown data with localStorage fallback

### CORS fallback chain

Yahoo Finance blocks browser CORS requests intermittently. All fetches use a 3-strategy chain:

1. Direct fetch to `query2.finance.yahoo.com`
2. `allorigins.win` server-side proxy
3. `corsproxy.io` proxy

If all three fail, cached data from localStorage is shown with a "cached" indicator.

## Local Development

Open `index.html` in a browser. No build step required.

For live reload during development:
```bash
npx serve .
```

## Tech Stack

- Vanilla JavaScript (no framework)
- [Chart.js 4.4](https://www.chartjs.org/) for the doughnut chart
- CSS custom properties for theming
- GitHub Pages for hosting
