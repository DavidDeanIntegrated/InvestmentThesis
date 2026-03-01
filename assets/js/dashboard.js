'use strict';

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO CONFIGURATION — Single Source of Truth
   ───────────────────────────────────────────────────────────────
   To update your portfolio:
   1. Update PORTFOLIO_DATE
   2. Update `shares` with exact share counts from Robinhood
   3. Update `dollar` with position values on that date (used as
      fallback when live prices are unavailable)
   Everything else computes automatically.
   When live prices arrive, values update in real-time.
═══════════════════════════════════════════════════════════════ */

const PORTFOLIO_DATE = 'February 26, 2026';

const SLEEVE_COLORS = {
  'Dry Powder':         '#22c55e',
  'Broad Market':       '#60a5fa',
  'Crypto':             '#a78bfa',
  'Gold':               '#f5c842',
  'Value':              '#93c5fd',
  'Quality Compounder': '#38bdf8',
  'International':      '#34d399',
  'High Conviction':    '#f87171',
  'Commodity':          '#fb923c',
};

// Yahoo Finance ticker mapping (only for tickers that differ)
const YAHOO_TICKERS = { 'BTC': 'BTC-USD' };

// shares = exact share count from Robinhood
// dollar = position value as of PORTFOLIO_DATE (fallback when live prices unavailable)
const HOLDINGS = [
  { ticker: 'BTC',  sleeve: 'Crypto',              shares: 0.00716019, dollar: 808.37 },
  { ticker: 'VTI',  sleeve: 'Broad Market',        shares: 2.385068,   dollar: 808.37 },
  { ticker: 'SGOV', sleeve: 'Dry Powder',           shares: 6.034963,   dollar: 607.24 },
  { ticker: 'GLD',  sleeve: 'Gold',                 shares: 0.833679,   dollar: 396.98 },
  { ticker: 'VTV',  sleeve: 'Value',                shares: 1.495409,   dollar: 310.01 },
  { ticker: 'VXUS', sleeve: 'International',        shares: 2.729559,   dollar: 229.28 },
  { ticker: 'NVDA', sleeve: 'Quality Compounder',   shares: 1.069294,   dollar: 197.93 },
  { ticker: 'TSM',  sleeve: 'Quality Compounder',   shares: 0.493206,   dollar: 185.54 },
  { ticker: 'MSFT', sleeve: 'Quality Compounder',   shares: 0.466907,   dollar: 185.49 },
  { ticker: 'BCI',  sleeve: 'Commodity',             shares: 7.057182,   dollar: 152.01 },
  { ticker: 'PLTR', sleeve: 'High Conviction',      shares: 1.041579,   dollar: 141.64 },
  { ticker: 'RKLB', sleeve: 'High Conviction',      shares: 1.700972,   dollar: 117.71 },
];

/* ═══════════════════════════════════════════════════════════════
   COMPUTED VALUES — derived automatically from HOLDINGS
   These are recalculated when live prices arrive.
═══════════════════════════════════════════════════════════════ */

let PORTFOLIO_TOTAL = HOLDINGS.reduce((sum, h) => sum + h.dollar, 0);
const PORTFOLIO_COUNT = HOLDINGS.length;

function recomputePortfolioMath() {
  PORTFOLIO_TOTAL = HOLDINGS.reduce((sum, h) => sum + h.dollar, 0);
  HOLDINGS.forEach(h => {
    h.pct = (h.dollar / PORTFOLIO_TOTAL) * 100;
  });
  SLEEVES.forEach(s => {
    const members = SLEEVE_GROUPS[s.name] || [];
    s.currentPct = HOLDINGS
      .filter(h => members.includes(h.sleeve))
      .reduce((sum, h) => sum + h.pct, 0);
  });
}

// Initial computation
HOLDINGS.forEach(h => {
  h.pct = (h.dollar / PORTFOLIO_TOTAL) * 100;
});

// Sleeve-level data with auto-computed percentages
const SLEEVE_GROUPS = {
  'Equities':                ['Broad Market', 'Value', 'Quality Compounder', 'International', 'High Conviction'],
  'Real Assets (GLD + BCI)': ['Gold', 'Commodity'],
  'Dry Powder (SGOV)':       ['Dry Powder'],
  'Crypto (BTC)':            ['Crypto'],
};

const SLEEVES = [
  { name: 'Equities',                targetLow: 55, targetHigh: 60, color: '#60a5fa', purpose: 'Growth exposure (broad + value + quality + selective conviction)' },
  { name: 'Real Assets (GLD + BCI)', targetLow: 14, targetHigh: 16, color: '#f5c842', purpose: 'Inflation & devaluation hedge ("buy stuff")' },
  { name: 'Dry Powder (SGOV)',       targetLow: 14, targetHigh: 17, color: '#22c55e', purpose: 'Tactical cash for dips' },
  { name: 'Crypto (BTC)',            targetLow: 8,  targetHigh: 12, color: '#a78bfa', purpose: 'Digital hard-money complement to gold (dilute over time)' },
];

// Compute each sleeve's current percentage from its member holdings
SLEEVES.forEach(s => {
  const members = SLEEVE_GROUPS[s.name] || [];
  s.currentPct = HOLDINGS
    .filter(h => members.includes(h.sleeve))
    .reduce((sum, h) => sum + h.pct, 0);
});

// Convenience lookups
function hPct(ticker) {
  const h = HOLDINGS.find(x => x.ticker === ticker);
  return h ? h.pct.toFixed(1) : '—';
}
function sPct(name) {
  const s = SLEEVES.find(x => x.name === name);
  return s ? s.currentPct.toFixed(1) : '—';
}

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */

const LADDER_RUNGS = [
  {
    trigger:      '–10% SPY',
    triggerClass: 'rung-10',
    action:       'Buy <strong>VTI</strong> (broad US core)',
    amount:       '$180',
    crisis:       false,
  },
  {
    trigger:      '–15% SPY',
    triggerClass: 'rung-15',
    action:       'Buy <strong>Quality Compounders</strong> — equal split: NVDA / MSFT / TSM',
    amount:       '$180',
    crisis:       false,
  },
  {
    trigger:      '–25%+ or VIX >40',
    triggerClass: 'rung-25',
    action:       '<strong>Aggressive deploy</strong> — VTI + VXUS + high-conviction names on sale (PLTR, RKLB)',
    amount:       '~$247',
    crisis:       true,
  },
];

const TACTICS = [
  { num: 1, text: '<strong>Check frequency:</strong> Once per week (Sunday evening) or any day SPY drops ≥2%.' },
  { num: 2, text: '<strong>Calculate trigger:</strong> SPY 3-month chart → highest close × 0.90 for the 10% trigger.' },
  { num: 3, text: '<strong>Execution:</strong> Spread buys over 1–3 trading days. Never deploy an entire tranche at once.' },
  { num: 4, text: '<strong>Dalio gut-check:</strong> Stronger "go" signal if BCI and GLD are flat or rising while stocks fall.' },
  { num: 5, text: '<strong>Permanent floor:</strong> Never let SGOV drop below <strong>$150</strong> (true emergency cash).' },
];

// Portfolio rationale — percentages computed from HOLDINGS
const _btcGld = (HOLDINGS.find(h => h.ticker === 'BTC').pct + HOLDINGS.find(h => h.ticker === 'GLD').pct).toFixed(1);

const RATIONALE = [
  {
    ticker:     'GLD',
    pct:        hPct('GLD') + '%',
    tagBg:      'rgba(245,200,66,0.15)',
    tagColor:   '#f5c842',
    title:      `GLD — ${hPct('GLD')}%`,
    meta:       'Gold',
    metaColor:  '#f5c842',
    content:    `<p>Dalio's <em>"safest money"</em> in high-debt and devaluation cycles. At the World Governments Summit in February 2026, Dalio reiterated gold's role as the primary store of value when governments inflate away debt. J.P. Morgan projects $6,300/oz by year-end 2026; Goldman Sachs forecasts $5,400.</p>
<p>The structural case — $38 trillion in U.S. debt, sustained central bank buying, and accelerating de-dollarization — remains firmly intact. Gold at ${hPct('GLD')}% puts the portfolio inside the 10–15% Dalio target range.</p>`,
  },
  {
    ticker:     'BCI',
    pct:        hPct('BCI') + '%',
    tagBg:      'rgba(251,146,60,0.15)',
    tagColor:   '#fb923c',
    title:      `BCI — ${hPct('BCI')}%`,
    meta:       'Commodities',
    metaColor:  '#fb923c',
    content:    `<p>Tracks the Bloomberg Commodity Index Total Return (BCOM) — the broadest, most diversified commodity benchmark, with balanced exposure across energy, metals, agriculture, and livestock. The purest expression of Dalio's "buy any stuff that beats inflation." No K-1, 0.26% expense ratio.</p>
<p>The 2026 inflation case is building: Wellington projects conditions "ripe for an inflationary boom," Invesco expects commodity prices to push CPI higher, and PIMCO recommends "modest, diversified allocations across gold and broad commodities."</p>`,
  },
  {
    ticker:     'VXUS',
    pct:        hPct('VXUS') + '%',
    tagBg:      'rgba(52,211,153,0.15)',
    tagColor:   '#34d399',
    title:      `VXUS — ${hPct('VXUS')}%`,
    meta:       'International',
    metaColor:  '#34d399',
    content:    `<p>International diversification to guard against the wealth destruction seen in most countries pre-1945 — the precise survivorship bias Dalio warns about. Using only U.S. historical returns as representative is one of the most common and costly investing mistakes.</p>
<p>Vanguard projects 4.9%–6.9% average annual returns for non-U.S. equities over the next decade, compared to lower projections for domestic equities. VXUS provides broad, low-cost access to developed and emerging markets in a single ETF.</p>`,
  },
  {
    ticker:     'SGOV',
    pct:        hPct('SGOV') + '%',
    tagBg:      'rgba(34,197,94,0.15)',
    tagColor:   '#22c55e',
    title:      `SGOV — ${hPct('SGOV')}%`,
    meta:       'Dry Powder',
    metaColor:  '#22c55e',
    content:    `<p>High-quality 0–3 month T-bill ETF earning ~4.5–5% while waiting for better equity entry points. SGOV is <em>tactical</em> — not a permanent holding. Its role is to earn a safe yield and then deploy at scale when the four drivers (growth, inflation, risk premiums, discount rates) improve for stocks.</p>
<p>At ${hPct('SGOV')}%, it sits squarely in the 14–17% target range: enough to deploy meaningfully at 10%, 15%, and 25%+ drawdowns without holding so much cash that the real drag becomes a material headwind.</p>`,
  },
  {
    ticker:     'Equities',
    pct:        sPct('Equities') + '%',
    tagBg:      'rgba(96,165,250,0.15)',
    tagColor:   '#60a5fa',
    title:      `Equities — ${sPct('Equities')}%`,
    meta:       'Growth Engine',
    metaColor:  '#60a5fa',
    content:    `<p>Balanced growth engine composed of four sub-sleeves: <strong>VTI</strong> (broad US core, ${hPct('VTI')}%), <strong>VTV</strong> (value tilt, ${hPct('VTV')}%), <strong>NVDA / TSM / MSFT</strong> (quality compounders, ${(HOLDINGS.filter(h => ['NVDA','TSM','MSFT'].includes(h.ticker)).reduce((s,h) => s + h.pct, 0)).toFixed(1)}%), and <strong>PLTR / RKLB</strong> (high-conviction, ${(HOLDINGS.filter(h => ['PLTR','RKLB'].includes(h.ticker)).reduce((s,h) => s + h.pct, 0)).toFixed(1)}%). The structure avoids relying on any single theme.</p>
<p>The 55–60% equity target is deliberately growth-tilted versus Dalio's more conservative All Weather (30% stocks). This is appropriate for a longer time horizon where the portfolio can weather volatility in exchange for higher long-run compounding.</p>`,
  },
  {
    ticker:     'BTC',
    pct:        hPct('BTC') + '%',
    tagBg:      'rgba(167,139,250,0.15)',
    tagColor:   '#a78bfa',
    title:      `BTC — ${hPct('BTC')}%`,
    meta:       'Hard Money',
    metaColor:  '#a78bfa',
    content:    `<p>Modern hard-asset hedge. Combined with GLD (${hPct('GLD')}%), the portfolio carries ~${_btcGld}% in "real money" — above Dalio's ideal 10–15% combined target, but acceptable given the BTC position is held at cost and will dilute naturally as new contributions flow to other sleeves.</p>
<p>No forced rebalance is required. As the portfolio grows from $${Math.round(PORTFOLIO_TOTAL).toLocaleString()} toward $8K–$13K+, BTC's percentage weight compresses organically into the 8–12% target range without triggering a taxable event. The strategy is to let time do the rebalancing work here.</p>`,
  },
];

const RULES = [
  { icon: '💰', title: 'New Contributions First', body: '100% of every paycheck or bonus goes into SGOV until it reaches ≥15.7% of total portfolio value. Cleanest, most tax-efficient replenishment method — no selling, no capital gains.' },
  { icon: '📈', title: 'Opportunistic Refill', body: 'If SGOV falls below <strong>12%</strong> after a deployment <em>and</em> SPY has recovered +10% from your exact deployment price, sell 40% of the deployed tranche and return the proceeds to SGOV.' },
  { icon: '🛡', title: 'Permanent Floor', body: 'Never let SGOV drop below <strong>$150</strong>. This is true emergency cash. If it gets that low, pause all new equity buys until new contributions refill it.' },
  { icon: '🗓', title: 'Quarterly Full Rebalance', body: 'Last trading day of <strong>March, June, September, December</strong> — bring every sleeve within ±3% of target. Sell overperformers first; buy laggards.' },
  { icon: '⚡', title: 'Threshold Trigger', body: 'Rebalance <em>immediately</em> anytime any sleeve drifts <strong>>5% absolute</strong> from target (e.g. equities >62% or real assets <9%). Catches big moves without calendar rigidity.' },
  { icon: '🏆', title: 'Real-Assets Priority', body: 'Keep GLD + BCI locked tightly at <strong>14–16%</strong>. These are the core protection against the late-cycle devaluation Dalio warns about. Never let them drift below 14% for long.' },
  { icon: '₿', title: 'BTC Special Rule', body: 'Hold at current weight; let dilution happen naturally via new contributions to other sleeves. No forced rebalance unless the >5% drift trigger fires.' },
  { icon: '📖', title: 'Dalio\'s Bottom Line', body: '"Rebalancing is what turns a bunch of good uncorrelated bets into a truly balanced portfolio that can survive any season of the Big Cycle." It mechanically forces buy-low / sell-high.' },
];

// Sub-sleeve target data (computed from HOLDINGS)
const _qcPct = HOLDINGS.filter(h => ['NVDA','TSM','MSFT'].includes(h.ticker)).reduce((s,h) => s + h.pct, 0);
const _hcPct = HOLDINGS.filter(h => ['PLTR','RKLB'].includes(h.ticker)).reduce((s,h) => s + h.pct, 0);

const REBAL_GUIDE = {
  goal: 'Keep the entire <strong>equities sleeve at 55\u201360%</strong> of total portfolio value while maintaining internal balance across sub-sleeves. This prevents any single stock or style from creating a big bias to one of the four drivers (growth, inflation, risk premiums, discount rates) \u2014 exactly as Dalio requires for true diversification.',

  whenToRebalance: [
    '<strong>Quarterly</strong> (last trading day of Mar / Jun / Sep / Dec), OR',
    'Anytime any sleeve (including total equities) <strong>drifts >5%</strong> from target, OR',
    '<strong>Immediately after any SGOV deployment</strong> (to bring total equities back inside 55\u201360%).',
  ],

  rebalanceTypes: [
    '<strong>Portfolio-level</strong> (total equities <strong>outside</strong> 55\u201360%): Money must leave or enter the equities sleeve.',
    '<strong>Internal only</strong> (total equities <strong>inside</strong> 55\u201360% but sub-sleeves imbalanced): Shift money <strong>within</strong> equities only.',
  ],

  subSleeveTargets: [
    { name: 'VTI (Broad US core)',                    targetRange: '20\u201322%', current: hPct('VTI') + '%',  priority: 'Buy first' },
    { name: 'VTV (Value)',                            targetRange: '7\u20139%',   current: hPct('VTV') + '%',  priority: 'Buy if under' },
    { name: 'VXUS (International)',                   targetRange: '6.0%',        current: hPct('VXUS') + '%', priority: 'Hold / Buy if under' },
    { name: 'Quality Compounders (NVDA+TSM+MSFT)',    targetRange: '14\u201316%', current: _qcPct.toFixed(1) + '%', priority: 'Sell if >17%, Buy if <13%' },
    { name: 'High Conviction (PLTR+RKLB)',            targetRange: '\u22646.5%',  current: _hcPct.toFixed(1) + '%', priority: 'Sell first if over' },
  ],

  sellRules: [
    '<strong>First:</strong> Trim high-conviction names (PLTR then RKLB) \u2014 most volatile, highest valuation risk in late-cycle.',
    '<strong>Second:</strong> Trim quality compounders equally (NVDA / TSM / MSFT) if group >17%.',
    '<strong>Third:</strong> Trim VTI or VTV only as last resort (most diversified).',
    'Never sell more than needed. Use fractional shares.',
  ],

  buyRulesPortfolio: [
    'Buy <strong>non-equities</strong> first: SGOV (if under target), then BCI/GLD (if under 14\u201316%).',
  ],

  buyRulesInternal: [
    '<strong>First:</strong> Add to <strong>VTI</strong> (broad anchor).',
    '<strong>Second:</strong> Add to <strong>VXUS</strong> if below 6%.',
    '<strong>Third:</strong> Add to <strong>VTV</strong> if below 7%.',
    '<strong>Fourth:</strong> Add to quality compounders (equal split NVDA/TSM/MSFT) only on meaningful dips or if group <13%.',
    '<strong>Never</strong> buy PLTR or RKLB during rebalancing \u2014 they are \u201chold-and-dilute\u201d names.',
  ],

  specialSituations: [
    '<strong>After SGOV deployment:</strong> Wait 7\u20138 weeks before full equities rebalance unless >5% drift occurs sooner.',
    '<strong>If BTC or real assets move hard:</strong> Rebalance equities first before touching other sleeves.',
    '<strong>Portfolio < $5,000:</strong> Limit to 1\u20132 trades per rebalance.',
  ],

  pltrRklb: {
    intro: 'Almost never during rebalancing. Only with <strong>new contributions</strong> (paycheck money) if:',
    conditions: [
      'They drop \u226520% from your average cost basis,',
      'Your original thesis is still fully intact, AND',
      'Their combined weight is well below 6.5%.',
    ],
    cap: 'Even then, cap any single add at 0.5\u20131% of portfolio. These are high-conviction speculative names \u2014 Dalio would treat them as small, asymmetric bets, not core holdings to add to mechanically.',
  },

  examples: [
    {
      title: 'Portfolio-level equities overweight',
      setup: 'Portfolio = $4,200, equities = 63% ($2,646). Target ~57% ($2,394). Need to sell ~$252 of equities.',
      sell:  'Sell: $120 PLTR + $80 RKLB + $52 NVDA.',
      buy:   'Buy: $252 into <strong>SGOV</strong> (or split to GLD/BCI if real assets are more underweight).',
      result:'Total equities back to ~57%, cash/real assets restored.',
    },
    {
      title: 'Internal rebalance only (total equities OK)',
      setup: 'Portfolio = $4,000, total equities = 57% (on target), but high-conviction = 8% ($320).',
      sell:  'Sell: $50 PLTR + $30 RKLB.',
      buy:   'Buy: $80 into <strong>VTI</strong>.',
      result:'Total equities unchanged at 57%, internal balance fixed.',
    },
    {
      title: 'Portfolio-level equities underweight (after a big dip deployment)',
      setup: 'Portfolio = $3,900, equities fell to 52% after you deployed SGOV.',
      sell:  'Sell nothing from equities.',
      buy:   'Buy $120 into <strong>VTI</strong> first, then $60 split to VXUS/quality compounders (using remaining SGOV or other overweights).',
      result:'Equities back inside 55\u201360%.',
    },
  ],

  closing: 'This guide forces true <strong>buy-low / sell-high</strong> across the whole portfolio while keeping internal discipline \u2014 exactly the mechanical engine Dalio uses to keep any portfolio All Weather and cycle-resilient.',
};

const PRIORITY = [
  { rank: 1, ticker: 'SGOV',         desc: 'Until back at <strong>15.7% target</strong>' },
  { rank: 2, ticker: 'VTI / VXUS',   desc: 'Maintain core equity balance' },
  { rank: 3, ticker: 'GLD',          desc: 'Continue building toward <strong>12–15%</strong> over time' },
  { rank: 4, ticker: 'BCI',          desc: 'Maintain at <strong>~4%</strong> with occasional top-ups' },
  { rank: 5, ticker: 'NVDA/TSM/MSFT',desc: 'Opportunistic adds on dips only' },
];

const REFS = [
  { num: 1, text: "Here's How Much of Your Portfolio Ray Dalio Says You Should Have in Gold", url: 'https://www.investopedia.com/how-much-of-your-portfolio-ray-dalio-says-you-should-have-in-gold-11825571' },
  { num: 2, text: 'Ray Dalio All Weather Portfolio Review, ETFs, & Leverage (2026)', url: 'https://www.optimizedportfolio.com/all-weather-portfolio/' },
  { num: 3, text: 'All Weather Portfolio by Ray Dalio: backtest and critical analysis (1999–2025)', url: 'https://www.dividendes.ch/2026/02/all-weather-portfolio-by-ray-dalio-backtest-and-critical-analysis-1999-2025/' },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtWhole(n) {
  return Math.round(n).toLocaleString('en-US');
}

function sleeveTagClass(sleeve) {
  const map = {
    'Dry Powder':         'tag-dry',
    'Broad Market':       'tag-equities',
    'Crypto':             'tag-crypto',
    'Gold':               'tag-gold',
    'Value':              'tag-value',
    'Quality Compounder': 'tag-equities',
    'International':      'tag-intl',
    'High Conviction':    'tag-highconv',
    'Commodity':          'tag-commodity',
  };
  return map[sleeve] || 'tag-equities';
}

/* ═══════════════════════════════════════════════════════════════
   LOCALSTORAGE CACHE
═══════════════════════════════════════════════════════════════ */

const CACHE_PREFIX = 'dalioPortfolio_';

function getCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { data: parsed.data, timestamp: parsed.timestamp, age: Date.now() - parsed.timestamp };
  } catch { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* localStorage full or disabled */ }
}

function formatCacheAge(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC HTML SYNC — Update all hardcoded values from config
═══════════════════════════════════════════════════════════════ */

function syncDynamicValues() {
  const total = '$' + fmtWhole(PORTFOLIO_TOTAL);

  // Page title
  document.title = 'Dalio-Adjusted Portfolio \u00b7 ' + total;

  // Header subtitle
  const sub = document.querySelector('.header-sub');
  if (sub) sub.textContent = 'Ray Dalio principles applied to your real ' + total + ' holdings \u00b7 ' + PORTFOLIO_DATE;

  // Stat pills (Total Value, Positions, Real Assets, Dry Powder)
  const stats = document.querySelectorAll('.stat-pill .stat-value');
  if (stats.length >= 4) {
    stats[0].textContent = total;
    stats[1].textContent = PORTFOLIO_COUNT;
    const ra = SLEEVES.find(s => s.name.includes('Real Assets'));
    if (ra) stats[2].textContent = ra.currentPct.toFixed(1) + '%';
    const dp = SLEEVES.find(s => s.name.includes('Dry Powder'));
    if (dp) stats[3].textContent = dp.currentPct.toFixed(1) + '%';
  }

  // Chart header & center label
  const chartTotal = document.querySelector('.chart-total');
  if (chartTotal) chartTotal.textContent = total + ' \u00b7 ' + PORTFOLIO_COUNT + ' positions';
  const centerVal = document.querySelector('.chart-center-value');
  if (centerVal) centerVal.textContent = total;

  // Executive summary paragraph
  const summaryP = document.querySelector('.summary-card > p');
  if (summaryP) {
    summaryP.innerHTML = 'This portfolio holds ' + PORTFOLIO_COUNT + ' positions totaling <strong>' + total + '</strong>, structured entirely around Ray Dalio\u2019s principles from <em>\u201cInvesting in Light of the Big Cycle.\u201d</em> It emphasizes <strong>balanced diversification</strong> across the four key drivers (growth, inflation, risk premiums, discount rates) to survive late-cycle environments of currency devaluation and financial-asset destruction.';
  }

  // Callout spans (equities, real assets, dry powder, crypto)
  const calloutSpans = document.querySelectorAll('.key-callouts .callout > div > span');
  if (calloutSpans.length >= 4) {
    const eq = SLEEVES.find(s => s.name === 'Equities');
    const ra2 = SLEEVES.find(s => s.name.includes('Real Assets'));
    const dp2 = SLEEVES.find(s => s.name.includes('Dry Powder'));
    const cr = SLEEVES.find(s => s.name.includes('Crypto'));
    if (eq) calloutSpans[0].textContent = '~' + Math.round(eq.currentPct) + '% equities \u2014 broad market, value, quality compounders, selective conviction';
    if (ra2) calloutSpans[1].textContent = ra2.currentPct.toFixed(1) + '% (GLD + BCI) \u2014 inflation & devaluation hedge; \u201cbuy stuff\u201d';
    if (dp2) calloutSpans[2].textContent = dp2.currentPct.toFixed(1) + '% SGOV \u2014 earning ~4.5\u20135% yield while waiting for dip entry points';
    if (cr) calloutSpans[3].textContent = cr.currentPct.toFixed(1) + '% BTC \u2014 will dilute naturally toward 8\u201312% target as portfolio grows';
  }

  // Holdings section badge
  const holdingsBadge = document.querySelector('#holdingsSection .section-badge');
  if (holdingsBadge) holdingsBadge.textContent = PORTFOLIO_DATE;

  // Table footer total
  const tfootTotal = document.getElementById('tableTotalValue');
  if (tfootTotal) tfootTotal.innerHTML = '<strong>' + total + '</strong>';

  // Dry powder badge
  const dryBadge = document.querySelector('.section-badge.blue');
  const sgov = HOLDINGS.find(h => h.ticker === 'SGOV');
  if (dryBadge && sgov) dryBadge.textContent = '$' + fmtWhole(sgov.dollar) + ' dry powder';

  // Footer
  const footerP = document.querySelector('.footer-inner > p:first-child');
  if (footerP) footerP.textContent = 'Dalio-Adjusted Portfolio \u00b7 Last Updated ' + PORTFOLIO_DATE + ' \u00b7 Total Value ' + total;
}

/* ═══════════════════════════════════════════════════════════════
   CHART
═══════════════════════════════════════════════════════════════ */

let chartInstance = null;

function initChart() {
  const labels  = HOLDINGS.map(h => h.ticker);
  const data    = HOLDINGS.map(h => h.pct);
  const dollars = HOLDINGS.map(h => h.dollar);
  const colors  = HOLDINGS.map(h => SLEEVE_COLORS[h.sleeve] ?? '#6b7280');

  chartInstance = new Chart(document.getElementById('currentChart'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#0f1726',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '68%',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2540',
          borderColor: '#2e3d5c',
          borderWidth: 1,
          padding: 12,
          titleFont: { family: "'JetBrains Mono', monospace", size: 13, weight: '700' },
          bodyFont:  { family: "'Inter', system-ui, sans-serif", size: 12 },
          titleColor: '#e8edf5',
          bodyColor:  '#8a9bb8',
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const i = item.dataIndex;
              return ' $' + fmt(dollars[i]) + '  (' + data[i].toFixed(1) + '%)';
            },
          },
        },
      },
      animation: { duration: 600, easing: 'easeInOutQuart' },
    },
  });

  // Build two-column legend
  const legendEl = document.getElementById('currentLegend');
  HOLDINGS.forEach((h, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = '<div class="legend-left"><div class="legend-dot" style="background:' + colors[i] + '"></div><span class="legend-ticker">' + h.ticker + '</span></div><span class="legend-dollar">$' + fmt(h.dollar) + '</span><span class="legend-pct">' + h.pct.toFixed(1) + '%</span>';
    legendEl.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════════
   SLEEVE BARS WITH TARGET RANGES
═══════════════════════════════════════════════════════════════ */

function initSleeveBars() {
  const container = document.getElementById('sleeveBars');
  const MAX = 65;

  SLEEVES.forEach(s => {
    const inTarget = s.currentPct >= s.targetLow && s.currentPct <= s.targetHigh;
    const curW     = (s.currentPct  / MAX * 100).toFixed(1);
    const lowW     = (s.targetLow   / MAX * 100).toFixed(1);
    const rangeW   = ((s.targetHigh - s.targetLow) / MAX * 100).toFixed(1);
    const statusIcon  = inTarget ? '\u2713' : '\u2197';
    const statusClass = inTarget ? 'in-target' : 'over-target';

    const row = document.createElement('div');
    row.className = 'sleeve-row';
    row.innerHTML = '<div class="sleeve-row-header"><span class="sleeve-name">' + s.name + '</span><div class="sleeve-meta"><span class="sleeve-target-label">Target: ' + s.targetLow + '\u2013' + s.targetHigh + '%</span><span class="sleeve-status ' + statusClass + '">' + statusIcon + '</span></div></div><div class="sleeve-bar-track"><div class="sleeve-range-band" style="left:' + lowW + '%;width:' + rangeW + '%;background:' + s.color + '"></div><div class="sleeve-bar-current" style="width:' + curW + '%;background:' + s.color + '"><span class="sleeve-bar-label">' + s.currentPct.toFixed(1) + '%</span></div></div><div class="sleeve-purpose">' + s.purpose + '</div>';
    container.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════════
   HOLDINGS TABLE
═══════════════════════════════════════════════════════════════ */

function initHoldingsTable() {
  const tbody = document.getElementById('holdingsTbody');

  HOLDINGS.forEach(h => {
    const tagClass = sleeveTagClass(h.sleeve);
    const tr = document.createElement('tr');
    tr.setAttribute('data-ticker', h.ticker);
    tr.innerHTML = '<td><span class="ticker-cell">' + h.ticker + '</span></td>' +
      '<td><span class="sleeve-tag ' + tagClass + '">' + h.sleeve + '</span></td>' +
      '<td class="dollar-cell">$' + fmt(h.dollar) + '</td>' +
      '<td class="pct-cell">' + h.pct.toFixed(1) + '%</td>' +
      '<td class="price-cell">\u2014</td>' +
      '<td class="change-cell">\u2014</td>';
    tbody.appendChild(tr);
  });
}

/* ═══════════════════════════════════════════════════════════════
   LIVE MARKET PRICES
═══════════════════════════════════════════════════════════════ */

async function fetchViaProxy(url) {
  // Strategy 1: allorigins.win /get endpoint (wraps response in JSON, adds CORS headers)
  try {
    const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
    if (res.ok) {
      const wrapper = await res.json();
      return JSON.parse(wrapper.contents);
    }
  } catch { /* next */ }

  // Strategy 2: corsproxy.org
  try {
    const res = await fetch('https://corsproxy.org/?' + encodeURIComponent(url));
    if (res.ok) return await res.json();
  } catch { /* next */ }

  // Strategy 3: api.codetabs.com proxy
  try {
    const res = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(url));
    if (res.ok) return await res.json();
  } catch { /* next */ }

  throw new Error('All proxy strategies failed for: ' + url);
}

// Reverse-map Yahoo symbols back to portfolio tickers
const YAHOO_REVERSE = {};
Object.entries(YAHOO_TICKERS).forEach(([k, v]) => { YAHOO_REVERSE[v] = k; });

async function fetchAllPricesBatch() {
  // Build a single comma-separated symbol list for Yahoo's spark endpoint
  const symbols = HOLDINGS.map(h => YAHOO_TICKERS[h.ticker] || h.ticker).join(',');
  const url = 'https://query2.finance.yahoo.com/v8/finance/spark?symbols=' + encodeURIComponent(symbols) + '&range=1d&interval=1d';

  const json = await fetchViaProxy(url);
  const results = {};

  // Spark returns { spark: { result: [ { symbol, response: [{ meta, ... }] } ] } }
  const items = (json.spark && json.spark.result) || [];
  for (const item of items) {
    const yahooSym = item.symbol;
    const resp = item.response && item.response[0];
    if (!resp || !resp.meta) continue;

    const meta = resp.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose || price;
    const ticker = YAHOO_REVERSE[yahooSym] || yahooSym;

    results[ticker] = {
      price,
      prevClose,
      change: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    };
  }

  return Object.keys(results).length > 0 ? results : null;
}

async function fetchSinglePrice(ticker) {
  const yahooTicker = YAHOO_TICKERS[ticker] || ticker;
  const url = 'https://query2.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(yahooTicker) + '?range=1d&interval=1d';
  const json = await fetchViaProxy(url);
  const result = json.chart && json.chart.result && json.chart.result[0];
  if (!result || !result.meta) return null;
  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose || meta.previousClose || price;
  return {
    price,
    prevClose,
    change: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
  };
}

async function fetchAllPrices() {
  // Try batch first — if it fails entirely, fall back to individual fetches
  let results;
  try {
    results = await fetchAllPricesBatch() || {};
  } catch {
    results = {};
  }

  // Find tickers missing from the batch response
  const missing = HOLDINGS.filter(h => !results[h.ticker]).map(h => h.ticker);

  if (missing.length > 0) {
    // Fetch missing tickers individually (in parallel, max 4 at a time to avoid overload)
    const chunks = [];
    for (let i = 0; i < missing.length; i += 4) {
      chunks.push(missing.slice(i, i + 4));
    }
    for (const chunk of chunks) {
      const fetches = chunk.map(async ticker => {
        try {
          const data = await fetchSinglePrice(ticker);
          if (data) results[ticker] = data;
        } catch { /* skip — proxy failed for this ticker */ }
      });
      await Promise.all(fetches);
    }
  }

  return Object.keys(results).length > 0 ? results : null;
}

function updateTableWithPrices(prices) {
  if (!prices) return;

  HOLDINGS.forEach(h => {
    const data = prices[h.ticker];
    if (!data) return;

    const row = document.querySelector('tr[data-ticker="' + h.ticker + '"]');
    if (!row) return;

    const priceCell = row.querySelector('.price-cell');
    const changeCell = row.querySelector('.change-cell');

    if (priceCell) {
      priceCell.textContent = '$' + fmt(data.price);
    }
    if (changeCell) {
      const sign = data.change >= 0 ? '+' : '';
      changeCell.textContent = sign + data.change.toFixed(2) + '%';
      changeCell.className = 'change-cell ' + (data.change >= 0 ? 'positive' : 'negative');
    }
  });
}

function showPriceStatus(state, detail) {
  const el = document.getElementById('tablePriceStatus');
  if (!el) return;

  if (state === 'loading') {
    el.innerHTML = '<span class="price-status loading"><span class="price-status-dot"></span>Loading prices\u2026</span>';
  } else if (state === 'live') {
    el.innerHTML = '<span class="price-status live"><span class="price-status-dot"></span>Live \u00b7 ' + (detail || 'just now') + '</span>';
  } else if (state === 'cached') {
    el.innerHTML = '<span class="price-status cached"><span class="price-status-dot"></span>Cached \u00b7 ' + (detail || '') + '</span>';
  } else if (state === 'error') {
    el.innerHTML = '<span class="price-status error"><span class="price-status-dot"></span>Unavailable</span>';
  }
}

/* ═══════════════════════════════════════════════════════════════
   RECALCULATE PORTFOLIO FROM LIVE PRICES
   When live prices arrive, recompute dollar values from
   shares × price, then refresh all UI elements.
═══════════════════════════════════════════════════════════════ */

function recalculatePortfolio(prices) {
  if (!prices) return;

  let anyUpdated = false;

  // Update dollar values: shares × live price
  HOLDINGS.forEach(h => {
    const data = prices[h.ticker];
    if (data && data.price && h.shares) {
      h.dollar = h.shares * data.price;
      anyUpdated = true;
    }
  });

  if (!anyUpdated) return;

  // Recompute all percentages and totals
  recomputePortfolioMath();

  // Update all HTML text (header, footer, stats, callouts, etc.)
  syncDynamicValues();

  // Update holdings table values and percentages
  HOLDINGS.forEach(h => {
    const row = document.querySelector('tr[data-ticker="' + h.ticker + '"]');
    if (!row) return;
    const dollarCell = row.querySelector('.dollar-cell');
    const pctCell = row.querySelector('.pct-cell');
    if (dollarCell) dollarCell.textContent = '$' + fmt(h.dollar);
    if (pctCell) pctCell.textContent = h.pct.toFixed(1) + '%';
  });

  // Update table footer total
  const tfootTotal = document.getElementById('tableTotalValue');
  if (tfootTotal) tfootTotal.innerHTML = '<strong>$' + fmtWhole(PORTFOLIO_TOTAL) + '</strong>';

  // Update chart
  if (chartInstance) {
    chartInstance.data.datasets[0].data = HOLDINGS.map(h => h.pct);
    const dollars = HOLDINGS.map(h => h.dollar);
    const data = HOLDINGS.map(h => h.pct);
    chartInstance.options.plugins.tooltip.callbacks.label = (item) => {
      const i = item.dataIndex;
      return ' $' + fmt(dollars[i]) + '  (' + data[i].toFixed(1) + '%)';
    };
    chartInstance.update('none');
  }

  // Update chart center label
  const centerVal = document.querySelector('.chart-center-value');
  if (centerVal) centerVal.textContent = '$' + fmtWhole(PORTFOLIO_TOTAL);

  // Update legend
  const legendEl = document.getElementById('currentLegend');
  if (legendEl) {
    const legendItems = legendEl.querySelectorAll('.legend-item');
    legendItems.forEach((item, i) => {
      const dollarSpan = item.querySelector('.legend-dollar');
      const pctSpan = item.querySelector('.legend-pct');
      if (dollarSpan) dollarSpan.textContent = '$' + fmt(HOLDINGS[i].dollar);
      if (pctSpan) pctSpan.textContent = HOLDINGS[i].pct.toFixed(1) + '%';
    });
  }

  // Rebuild sleeve bars
  const sleeveBarsEl = document.getElementById('sleeveBars');
  if (sleeveBarsEl) {
    sleeveBarsEl.innerHTML = '';
    initSleeveBars();
  }
}

async function initLivePrices() {
  // Show cached data immediately if available
  const cached = getCache('prices');
  if (cached && cached.data) {
    recalculatePortfolio(cached.data);
    updateTableWithPrices(cached.data);
    showPriceStatus('cached', formatCacheAge(cached.age));
  } else {
    showPriceStatus('loading');
  }

  // Fetch fresh data
  try {
    const prices = await fetchAllPrices();
    if (prices) {
      setCache('prices', prices);
      recalculatePortfolio(prices);
      updateTableWithPrices(prices);
      showPriceStatus('live', 'just now');
    } else if (!cached) {
      showPriceStatus('error');
    }
  } catch {
    if (!cached) showPriceStatus('error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   DEPLOYMENT LADDER
═══════════════════════════════════════════════════════════════ */

function initLadder() {
  const container = document.getElementById('deploymentLadder');

  LADDER_RUNGS.forEach(rung => {
    const div = document.createElement('div');
    div.className = 'ladder-rung' + (rung.crisis ? ' rung-crisis' : '');
    div.innerHTML = '<span class="rung-trigger ' + rung.triggerClass + '">' + rung.trigger + '</span><span class="rung-action">' + rung.action + '</span><span class="rung-amount">' + rung.amount + '</span>';
    container.appendChild(div);
  });

  const tacticsEl = document.getElementById('tacticsList');
  TACTICS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tactic-card';
    card.innerHTML = '<div class="tactic-num">' + t.num + '</div><div class="tactic-text">' + t.text + '</div>';
    tacticsEl.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO RATIONALE ACCORDION
═══════════════════════════════════════════════════════════════ */

function initAccordion() {
  const container = document.getElementById('rationaleAccordion');

  RATIONALE.forEach((r, idx) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    if (idx === 0) item.classList.add('open');

    item.innerHTML = '<div class="accordion-header"><div class="accordion-title-row"><span class="accordion-tag" style="background:' + r.tagBg + ';color:' + r.tagColor + '">' + r.ticker + '</span><span class="accordion-title">' + r.title + '</span></div><div style="display:flex;align-items:center;gap:12px"><span class="accordion-meta" style="color:' + r.metaColor + '">' + r.meta + '</span><span class="accordion-chevron">\u25bc</span></div></div><div class="accordion-body"><div class="accordion-content">' + r.content + '</div></div>';

    const header = item.querySelector('.accordion-header');
    const body   = item.querySelector('.accordion-body');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      container.querySelectorAll('.accordion-item').forEach(ai => {
        ai.classList.remove('open');
        ai.querySelector('.accordion-body').style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });

    if (idx === 0) {
      setTimeout(() => { body.style.maxHeight = body.scrollHeight + 'px'; }, 50);
    }

    container.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════════
   RULES GRID
═══════════════════════════════════════════════════════════════ */

function initRules() {
  const container = document.getElementById('rulesGrid');
  RULES.forEach(r => {
    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = '<div class="rule-icon">' + r.icon + '</div><div class="rule-title">' + r.title + '</div><div class="rule-body">' + r.body + '</div>';
    container.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════════
   REBALANCING BUY / SELL GUIDE
═══════════════════════════════════════════════════════════════ */

function initRebalGuide() {
  const container = document.getElementById('rebalGuide');
  if (!container) return;

  const R = REBAL_GUIDE;

  // Helper: create a titled section card
  function makeSection(title, bodyHTML) {
    const div = document.createElement('div');
    div.className = 'rebal-section';
    div.innerHTML = (title ? '<div class="rebal-section-title">' + title + '</div>' : '') + '<div class="rebal-section-body">' + bodyHTML + '</div>';
    return div;
  }

  // Helper: ordered list from array of HTML strings
  function makeOL(items, cls) {
    return '<ol class="rebal-ol ' + (cls || '') + '">' + items.map(t => '<li>' + t + '</li>').join('') + '</ol>';
  }

  function makeUL(items) {
    return '<ul class="rebal-ul">' + items.map(t => '<li>' + t + '</li>').join('') + '</ul>';
  }

  // 1. Goal
  const goal = document.createElement('div');
  goal.className = 'rebal-intro summary-card';
  goal.innerHTML = '<p><strong>Goal:</strong> ' + R.goal + '</p>';
  container.appendChild(goal);

  // 2. When to Rebalance
  container.appendChild(makeSection('When to Rebalance Equities', makeUL(R.whenToRebalance)));

  // 3. Step-by-Step Process
  const stepsHTML = '<p class="rebal-step-intro">Takes 5\u201310 minutes on Robinhood:</p>';

  // Step 1: Calculate current total equities %
  const step1 = '<div class="rebal-step"><div class="rebal-step-num">1</div><div class="rebal-step-body"><strong>Calculate current total equities %</strong><p>Add up VTI + VTV + VXUS + NVDA + TSM + MSFT + PLTR + RKLB.<br>Target: <strong>55\u201360%</strong> of total portfolio.</p></div></div>';

  // Step 2: Determine type of rebalance
  const step2 = '<div class="rebal-step"><div class="rebal-step-num">2</div><div class="rebal-step-body"><strong>Determine the type of rebalance</strong>' + makeUL(R.rebalanceTypes) + '</div></div>';

  // Step 3: Sub-Sleeve Targets (table)
  let tableRows = '';
  R.subSleeveTargets.forEach(s => {
    tableRows += '<tr><td>' + s.name + '</td><td>' + s.targetRange + '</td><td>' + s.current + '</td><td>' + s.priority + '</td></tr>';
  });
  const step3 = '<div class="rebal-step"><div class="rebal-step-num">3</div><div class="rebal-step-body"><strong>Sub-Sleeve Targets</strong> (as % of total portfolio)<div class="rebal-table-wrap"><table class="rebal-table"><thead><tr><th>Sub-Sleeve</th><th>Target % of Total</th><th>Current (' + PORTFOLIO_DATE + ')</th><th>Action Priority</th></tr></thead><tbody>' + tableRows + '</tbody></table></div></div></div>';

  // Step 4: Sell Rules
  const step4 = '<div class="rebal-step"><div class="rebal-step-num">4</div><div class="rebal-step-body"><strong>Sell Rules</strong> (exact order)' + makeOL(R.sellRules, 'rebal-sell-list') + '</div></div>';

  // Step 5: Buy Rules (depends on rebalance type)
  const buyHTML = '<p class="rebal-buy-type-label"><strong>Portfolio-level</strong> (equities too high):</p>' +
    makeUL(R.buyRulesPortfolio) +
    '<p class="rebal-buy-type-label"><strong>Internal only</strong> (total equities OK):</p>' +
    makeOL(R.buyRulesInternal, 'rebal-buy-list');
  const step5 = '<div class="rebal-step"><div class="rebal-step-num">5</div><div class="rebal-step-body"><strong>Buy Rules</strong> (depends on rebalance type)' + buyHTML + '</div></div>';

  // Step 6: Special Situations
  const step6 = '<div class="rebal-step"><div class="rebal-step-num">6</div><div class="rebal-step-body"><strong>Special Situations</strong>' + makeUL(R.specialSituations) + '</div></div>';

  container.appendChild(makeSection('Step-by-Step Process', stepsHTML + step1 + step2 + step3 + step4 + step5 + step6));

  // 4. When would you ever buy more PLTR or RKLB?
  const pltr = R.pltrRklb;
  const pltrHTML = '<p>' + pltr.intro + '</p>' +
    makeUL(pltr.conditions) +
    '<p class="rebal-pltr-cap">' + pltr.cap + '</p>';
  container.appendChild(makeSection('When would you ever buy more PLTR or RKLB?', pltrHTML));

  // 5. Examples
  let examplesHTML = '';
  R.examples.forEach((ex, i) => {
    examplesHTML += '<div class="rebal-example"><div class="rebal-example-label">Example ' + (i + 1) + ': ' + ex.title + '</div>' +
      '<p>' + ex.setup + '</p>' +
      '<p class="rebal-example-sell">\u2192 ' + ex.sell + '</p>' +
      '<p class="rebal-example-buy">\u2192 ' + ex.buy + '</p>' +
      '<p class="rebal-example-result">\u2192 ' + ex.result + '</p></div>';
  });
  container.appendChild(makeSection('Examples', examplesHTML));

  // 6. Closing
  const closing = document.createElement('div');
  closing.className = 'rebal-closing summary-card';
  closing.innerHTML = '<p>' + R.closing + '</p>';
  container.appendChild(closing);
}

/* ═══════════════════════════════════════════════════════════════
   PRIORITY LIST
═══════════════════════════════════════════════════════════════ */

function initPriority() {
  const container = document.getElementById('priorityList');
  PRIORITY.forEach(p => {
    const div = document.createElement('div');
    div.className = 'priority-item';
    div.innerHTML = '<div class="priority-rank">' + p.rank + '</div><span class="priority-ticker">' + p.ticker + '</span><span class="priority-desc">' + p.desc + '</span>';
    container.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════════════
   REFERENCES
═══════════════════════════════════════════════════════════════ */

function initRefs() {
  const container = document.getElementById('refsList');
  REFS.forEach(r => {
    const div = document.createElement('div');
    div.className = 'ref-item';
    div.innerHTML = '<span class="ref-num">' + r.num + '.</span><a class="ref-link" href="' + r.url + '" target="_blank" rel="noopener noreferrer">' + r.text + '</a>';
    container.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════════════
   LIVE SPY STATUS MODULE (with localStorage caching)
═══════════════════════════════════════════════════════════════ */

function spyTriggerLabel(pct, high) {
  if (pct >= 0)       return { text: 'Above 3-mo high \u2014 No action needed', cls: 'green' };
  if (pct > -10)      return { text: 'No trigger yet \u00b7 \u201310% at $' + (high * 0.90).toFixed(2), cls: '' };
  if (pct > -15)      return { text: '\u201310% triggered \u00b7 Deploy $180 \u2192 VTI', cls: 'orange' };
  if (pct > -25)      return { text: '\u201315% triggered \u00b7 Deploy $180 \u2192 NVDA/MSFT/TSM', cls: 'red' };
  return               { text: '\u201325%+ triggered \u00b7 Deploy ~$247 \u2192 VTI + VXUS', cls: 'red' };
}

async function fetchSpyData() {
  const yahooUrl = 'https://query2.finance.yahoo.com/v8/finance/chart/SPY?range=3mo&interval=1d&includePrePost=false';

  const json   = await fetchViaProxy(yahooUrl);
  const result = json.chart.result[0];
  const closes = result.indicators.quote[0].close.filter(c => c != null);

  if (!closes.length) throw new Error('No price data returned');

  const current = result.meta.regularMarketPrice;
  const high3m  = Math.max(...closes);
  const pct     = ((current - high3m) / high3m) * 100;

  const data = { current, high3m, pct };
  setCache('spy', data);
  return data;
}

function initSpyLive() {
  const body       = document.getElementById('spyLiveBody');
  const refreshBtn = document.getElementById('spyRefreshBtn');

  if (!body || !refreshBtn) return;

  let intervalId = null;

  function showLoading() {
    body.innerHTML = '<div class="spy-live-loading"><div class="spy-live-spinner"></div><span>Fetching live data\u2026</span></div>';
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;
  }

  function showData(current, high3m, pct, source) {
    const sign   = pct >= 0 ? '+' : '';
    const label  = spyTriggerLabel(pct, high3m);
    const dClass = pct >= 0 ? 'above' : 'below';

    const now      = new Date();
    const timeStr  = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateStr  = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const sourceTag = source === 'cached' ? ' <span class="spy-cached-tag">cached</span>' : '';

    body.innerHTML = '<div class="spy-live-price">$' + current.toFixed(2) + '</div>' +
      '<div class="spy-live-sub">3-mo high: $' + high3m.toFixed(2) + '</div>' +
      '<div class="spy-live-drawdown ' + dClass + '">' + sign + pct.toFixed(2) + '%</div>' +
      '<div class="spy-live-action ' + label.cls + '">' + label.text + '</div>' +
      '<div class="spy-live-updated">Updated ' + timeStr + ' \u00b7 ' + dateStr + sourceTag + '</div>';
  }

  function showError() {
    body.innerHTML = '<div class="spy-live-error"><div class="spy-live-error-msg">Live data unavailable</div><div class="spy-live-error-sub">Yahoo Finance blocked the request (CORS). Use the calculator \u2192 to enter prices manually.</div></div>';
  }

  async function load() {
    showLoading();
    try {
      const { current, high3m, pct } = await fetchSpyData();
      showData(current, high3m, pct, 'live');
    } catch (err) {
      // Fall back to cached data
      const cached = getCache('spy');
      if (cached && cached.data) {
        showData(cached.data.current, cached.data.high3m, cached.data.pct, 'cached');
      } else {
        showError();
      }
      // CORS proxy failures are expected — silently fall back to cache
    } finally {
      refreshBtn.classList.remove('spinning');
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener('click', () => {
    if (intervalId) clearInterval(intervalId);
    load();
    intervalId = setInterval(load, 5 * 60 * 1000);
  });

  // Show cached data instantly, then fetch fresh
  const cached = getCache('spy');
  if (cached && cached.data) {
    showData(cached.data.current, cached.data.high3m, cached.data.pct, 'cached');
  }

  load();
  intervalId = setInterval(load, 5 * 60 * 1000);
}

/* ═══════════════════════════════════════════════════════════════
   SPY DRAWDOWN CALCULATOR
═══════════════════════════════════════════════════════════════ */

function initSpyCalc() {
  const highInput = document.getElementById('spyHigh');
  const curInput  = document.getElementById('spyCurrent');
  const pctEl     = document.getElementById('spyCalcPct');
  const msgEl     = document.getElementById('spyTriggerMsg');

  if (!highInput || !curInput || !pctEl || !msgEl) return;

  function calculate() {
    const highVal = highInput.value.trim();
    const curVal  = curInput.value.trim();

    if (!highVal || !curVal) {
      pctEl.textContent = '\u2014';
      pctEl.className   = 'spy-calc-pct';
      msgEl.textContent = 'Enter prices above';
      msgEl.className   = 'spy-trigger-msg';
      return;
    }

    const high = parseFloat(highVal);
    const cur  = parseFloat(curVal);

    if (isNaN(high) || isNaN(cur) || high <= 0 || cur <= 0) {
      pctEl.textContent = '\u2014';
      pctEl.className   = 'spy-calc-pct';
      msgEl.textContent = 'Enter valid prices';
      msgEl.className   = 'spy-trigger-msg';
      return;
    }

    const pct  = ((cur - high) / high) * 100;
    const sign = pct >= 0 ? '+' : '';
    pctEl.textContent = sign + pct.toFixed(2) + '%';

    if (pct >= 0) {
      pctEl.className = 'spy-calc-pct above';
      msgEl.innerHTML = 'Above 3-month high \u2014 <strong>No action needed</strong>';
      msgEl.className = 'spy-trigger-msg trigger-safe';
    } else if (pct > -10) {
      const needed = (high * 0.90).toFixed(2);
      pctEl.className = 'spy-calc-pct below';
      msgEl.innerHTML = '<strong>No trigger yet</strong> \u00b7 \u201310% at $' + needed;
      msgEl.className = 'spy-trigger-msg trigger-none';
    } else if (pct > -15) {
      pctEl.className = 'spy-calc-pct below';
      msgEl.innerHTML = '<strong>\u201310% triggered</strong> \u00b7 Deploy $180 \u2192 VTI';
      msgEl.className = 'spy-trigger-msg trigger-10';
    } else if (pct > -25) {
      pctEl.className = 'spy-calc-pct below';
      msgEl.innerHTML = '<strong>\u201315% triggered</strong> \u00b7 Deploy $180 \u2192 NVDA / MSFT / TSM';
      msgEl.className = 'spy-trigger-msg trigger-15';
    } else {
      pctEl.className = 'spy-calc-pct below';
      msgEl.innerHTML = '<strong>\u201325%+ triggered</strong> \u00b7 Deploy ~$247 \u2192 VTI + VXUS + conviction';
      msgEl.className = 'spy-trigger-msg trigger-25';
    }
  }

  highInput.addEventListener('input', calculate);
  curInput.addEventListener('input', calculate);
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  syncDynamicValues();
  initChart();
  initSleeveBars();
  initHoldingsTable();
  initAccordion();
  initLadder();
  initSpyLive();
  initSpyCalc();
  initRules();
  initRebalGuide();
  initPriority();
  initRefs();
  initLivePrices();
});
