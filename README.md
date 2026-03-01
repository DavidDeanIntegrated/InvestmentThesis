# Investment Thesis Library

A professional research library for investment theses grounded in Ray Dalio's All Weather principles. Multi-page static site with a portfolio dashboard, individual thesis pages, client-side search/filtering, and dark mode support.

**Live site:** Deployed via GitHub Pages

## Features

- **Investment theses** — Individual pages for each portfolio position with long-form analysis, floating table of contents, and prev/next navigation
- **Thesis search & filtering** — Client-side search by ticker, sector, or keyword; clickable tag chips and sector filters
- **Portfolio dashboard** — Interactive dashboard with Chart.js doughnut chart, live market prices from Yahoo Finance, SPY drawdown monitor, deployment ladder, and rebalancing rules
- **Dark mode toggle** — Light/dark theme with localStorage persistence and system preference detection
- **Responsive design** — Optimized for desktop, tablet, and mobile
- **Static site** — Built with Jekyll, deployed on GitHub Pages with zero plugins

## Tech Stack

- **Jekyll** — Static site generator (layouts, includes, collections)
- **Vanilla JavaScript** — No frameworks; Chart.js 4.4 for the doughnut chart
- **CSS Custom Properties** — Dual-theme (light/dark) with responsive design
- **Google Fonts** — Inter (sans), JetBrains Mono (mono), Lora (serif headings)
- **GitHub Pages** — Automatic deployment via GitHub Actions

## Project Structure

```
├── _config.yml              # Jekyll configuration
├── _layouts/                # Page layouts (default, thesis, page)
├── _includes/               # Shared components (nav, footer, head, thesis-card)
├── _theses/                 # Thesis markdown files (Jekyll collection)
├── _data/                   # Navigation data
├── assets/
│   ├── css/                 # Stylesheets (main, dashboard, thesis)
│   └── js/                  # Scripts (dashboard, dark-mode, search, TOC, nav)
├── index.html               # Home page
├── dashboard/index.html     # Portfolio dashboard
├── theses/index.html        # Thesis listing with search/filter
├── about.md                 # About page
└── .github/workflows/       # GitHub Actions deployment
```

## Adding a New Thesis

1. Create a new markdown file in `_theses/`:

```markdown
---
title: "Ticker (SYMBOL) — Thesis Title"
ticker: SYMBOL
sector: Sector Name
date: 2026-03-01
tags: [tag1, tag2, tag3]
summary: "One-sentence summary for card display."
sleeve: Sleeve Name
allocation_pct: 5.0
status: active
---

## Section Heading

Your long-form thesis content here...
```

2. Push to `main` — the site rebuilds automatically.

## Updating Portfolio Data

Edit the `HOLDINGS` array at the top of `assets/js/dashboard.js`:

```javascript
const PORTFOLIO_DATE = 'March 1, 2026';

const HOLDINGS = [
  { ticker: 'VTI', sleeve: 'Broad Market', shares: 2.385, dollar: 810.00 },
  // ... update values
];
```

Everything else (percentages, chart, stats, rationale) recomputes automatically.

## Local Development

### Option 1: Jekyll (recommended)

```bash
# Install Jekyll (one-time)
gem install jekyll bundler

# Serve locally with live reload
jekyll serve
```

Visit `http://localhost:4000/InvestmentThesis/`

### Option 2: Simple HTTP server

```bash
npx serve .
```

Note: Without Jekyll, Liquid templates won't render. Use Jekyll for full functionality.

## Deployment

The site deploys automatically via GitHub Actions on every push to `main`. The workflow at `.github/workflows/jekyll-gh-pages.yml` runs Jekyll build and deploys to GitHub Pages.

No manual deployment steps required.

## License

For informational purposes only. Not financial advice.
