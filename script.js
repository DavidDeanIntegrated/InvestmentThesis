'use strict';

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */

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

const HOLDINGS = [
  { ticker: 'VTI',  sleeve: 'Broad Market',       dollar: 808.55, pct: 21.3 },
  { ticker: 'SGOV', sleeve: 'Dry Powder',          dollar: 607.12, pct: 16.0 },
  { ticker: 'BTC',  sleeve: 'Crypto',              dollar: 458.95, pct: 12.1 },
  { ticker: 'GLD',  sleeve: 'Gold',                dollar: 392.89, pct: 10.4 },
  { ticker: 'VTV',  sleeve: 'Value',               dollar: 308.73, pct:  8.2 },
  { ticker: 'VXUS', sleeve: 'International',       dollar: 227.92, pct:  6.0 },
  { ticker: 'NVDA', sleeve: 'Quality Compounder',  dollar: 205.97, pct:  5.4 },
  { ticker: 'TSM',  sleeve: 'Quality Compounder',  dollar: 190.03, pct:  5.0 },
  { ticker: 'MSFT', sleeve: 'Quality Compounder',  dollar: 181.23, pct:  4.8 },
  { ticker: 'BCI',  sleeve: 'Commodity',           dollar: 151.76, pct:  4.0 },
  { ticker: 'PLTR', sleeve: 'High Conviction',     dollar: 133.93, pct:  3.5 },
  { ticker: 'RKLB', sleeve: 'High Conviction',     dollar: 118.90, pct:  3.1 },
];

// Sleeve-level data with Dalio target ranges
const SLEEVES = [
  {
    name:        'Equities',
    currentPct:  57.3,
    targetLow:   55,
    targetHigh:  60,
    color:       '#60a5fa',
    purpose:     'Growth exposure (broad + value + quality + selective conviction)',
  },
  {
    name:        'Real Assets (GLD + BCI)',
    currentPct:  14.4,
    targetLow:   14,
    targetHigh:  16,
    color:       '#f5c842',
    purpose:     'Inflation & devaluation hedge ("buy stuff")',
  },
  {
    name:        'Dry Powder (SGOV)',
    currentPct:  16.0,
    targetLow:   14,
    targetHigh:  17,
    color:       '#22c55e',
    purpose:     'Tactical cash for dips',
  },
  {
    name:        'Crypto (BTC)',
    currentPct:  12.1,
    targetLow:   8,
    targetHigh:  12,
    color:       '#a78bfa',
    purpose:     'Digital hard-money complement to gold (dilute over time)',
  },
];

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
  {
    num:  1,
    text: '<strong>Check frequency:</strong> Once per week (Sunday evening) or any day SPY drops ≥2%.',
  },
  {
    num:  2,
    text: '<strong>Calculate trigger:</strong> SPY 3-month chart → highest close × 0.90 for the 10% trigger.',
  },
  {
    num:  3,
    text: '<strong>Execution:</strong> Spread buys over 1–3 trading days. Never deploy an entire tranche at once.',
  },
  {
    num:  4,
    text: '<strong>Dalio gut-check:</strong> Stronger "go" signal if BCI and GLD are flat or rising while stocks fall.',
  },
  {
    num:  5,
    text: '<strong>Permanent floor:</strong> Never let SGOV drop below <strong>$150</strong> (true emergency cash).',
  },
];

// Portfolio rationale — each sleeve's role in the Dalio framework
const RATIONALE = [
  {
    ticker:     'GLD',
    pct:        '10.4%',
    tagBg:      'rgba(245,200,66,0.15)',
    tagColor:   '#f5c842',
    title:      'GLD — 10.4%',
    meta:       'Gold',
    metaColor:  '#f5c842',
    content:    `<p>Dalio's <em>"safest money"</em> in high-debt and devaluation cycles. At the World Governments Summit in February 2026, Dalio reiterated gold's role as the primary store of value when governments inflate away debt. J.P. Morgan projects $6,300/oz by year-end 2026; Goldman Sachs forecasts $5,400.</p>
<p>The structural case — $38 trillion in U.S. debt, sustained central bank buying, and accelerating de-dollarization — remains firmly intact. Gold at 10.4% puts the portfolio inside the 10–15% Dalio target range.</p>`,
  },
  {
    ticker:     'BCI',
    pct:        '4.0%',
    tagBg:      'rgba(251,146,60,0.15)',
    tagColor:   '#fb923c',
    title:      'BCI — 4.0%',
    meta:       'Commodities',
    metaColor:  '#fb923c',
    content:    `<p>Tracks the Bloomberg Commodity Index Total Return (BCOM) — the broadest, most diversified commodity benchmark, with balanced exposure across energy, metals, agriculture, and livestock. The purest expression of Dalio's "buy any stuff that beats inflation." No K-1, 0.26% expense ratio.</p>
<p>The 2026 inflation case is building: Wellington projects conditions "ripe for an inflationary boom," Invesco expects commodity prices to push CPI higher, and PIMCO recommends "modest, diversified allocations across gold and broad commodities."</p>`,
  },
  {
    ticker:     'VXUS',
    pct:        '6.0%',
    tagBg:      'rgba(52,211,153,0.15)',
    tagColor:   '#34d399',
    title:      'VXUS — 6.0%',
    meta:       'International',
    metaColor:  '#34d399',
    content:    `<p>International diversification to guard against the wealth destruction seen in most countries pre-1945 — the precise survivorship bias Dalio warns about. Using only U.S. historical returns as representative is one of the most common and costly investing mistakes.</p>
<p>Vanguard projects 4.9%–6.9% average annual returns for non-U.S. equities over the next decade, compared to lower projections for domestic equities. VXUS provides broad, low-cost access to developed and emerging markets in a single ETF.</p>`,
  },
  {
    ticker:     'SGOV',
    pct:        '16.0%',
    tagBg:      'rgba(34,197,94,0.15)',
    tagColor:   '#22c55e',
    title:      'SGOV — 16.0%',
    meta:       'Dry Powder',
    metaColor:  '#22c55e',
    content:    `<p>High-quality 0–3 month T-bill ETF earning ~4.5–5% while waiting for better equity entry points. SGOV is <em>tactical</em> — not a permanent holding. Its role is to earn a safe yield and then deploy at scale when the four drivers (growth, inflation, risk premiums, discount rates) improve for stocks.</p>
<p>At 16%, it sits squarely in the 14–17% target range: enough to deploy meaningfully at 10%, 15%, and 25%+ drawdowns without holding so much cash that the real drag becomes a material headwind.</p>`,
  },
  {
    ticker:     'Equities',
    pct:        '57.3%',
    tagBg:      'rgba(96,165,250,0.15)',
    tagColor:   '#60a5fa',
    title:      'Equities — 57.3%',
    meta:       'Growth Engine',
    metaColor:  '#60a5fa',
    content:    `<p>Balanced growth engine composed of four sub-sleeves: <strong>VTI</strong> (broad US core, 21.3%), <strong>VTV</strong> (value tilt, 8.2%), <strong>NVDA / TSM / MSFT</strong> (quality compounders, 15.2%), and <strong>PLTR / RKLB</strong> (high-conviction, 6.6%). The structure avoids relying on any single theme.</p>
<p>The 55–60% equity target is deliberately growth-tilted versus Dalio's more conservative All Weather (30% stocks). This is appropriate for a longer time horizon where the portfolio can weather volatility in exchange for higher long-run compounding.</p>`,
  },
  {
    ticker:     'BTC',
    pct:        '12.1%',
    tagBg:      'rgba(167,139,250,0.15)',
    tagColor:   '#a78bfa',
    title:      'BTC — 12.1%',
    meta:       'Hard Money',
    metaColor:  '#a78bfa',
    content:    `<p>Modern hard-asset hedge. Combined with GLD (10.4%), the portfolio carries ~22.5% in "real money" — above Dalio's ideal 10–15% combined target, but acceptable given the BTC position is held at cost and will dilute naturally as new contributions flow to other sleeves.</p>
<p>No forced rebalance is required. As the portfolio grows from $3,786 toward $8K–$13K+, BTC's percentage weight compresses organically into the 8–12% target range without triggering a taxable event. The strategy is to let time do the rebalancing work here.</p>`,
  },
];

const RULES = [
  {
    icon:  '💰',
    title: 'New Contributions First',
    body:  '100% of every paycheck or bonus goes into SGOV until it reaches ≥15.7% of total portfolio value. Cleanest, most tax-efficient replenishment method — no selling, no capital gains.',
  },
  {
    icon:  '📈',
    title: 'Opportunistic Refill',
    body:  'If SGOV falls below <strong>12%</strong> after a deployment <em>and</em> SPY has recovered +10% from your exact deployment price, sell 40% of the deployed tranche and return the proceeds to SGOV.',
  },
  {
    icon:  '🛡',
    title: 'Permanent Floor',
    body:  'Never let SGOV drop below <strong>$150</strong>. This is true emergency cash. If it gets that low, pause all new equity buys until new contributions refill it.',
  },
  {
    icon:  '🗓',
    title: 'Quarterly Full Rebalance',
    body:  'Last trading day of <strong>March, June, September, December</strong> — bring every sleeve within ±3% of target. Sell overperformers first; buy laggards.',
  },
  {
    icon:  '⚡',
    title: 'Threshold Trigger',
    body:  'Rebalance <em>immediately</em> anytime any sleeve drifts <strong>>5% absolute</strong> from target (e.g. equities >62% or real assets <9%). Catches big moves without calendar rigidity.',
  },
  {
    icon:  '🏆',
    title: 'Real-Assets Priority',
    body:  'Keep GLD + BCI locked tightly at <strong>14–16%</strong>. These are the core protection against the late-cycle devaluation Dalio warns about. Never let them drift below 14% for long.',
  },
  {
    icon:  '₿',
    title: 'BTC Special Rule',
    body:  'Hold at current weight; let dilution happen naturally via new contributions to other sleeves. No forced rebalance unless the >5% drift trigger fires.',
  },
  {
    icon:  '📖',
    title: 'Dalio\'s Bottom Line',
    body:  '"Rebalancing is what turns a bunch of good uncorrelated bets into a truly balanced portfolio that can survive any season of the Big Cycle." It mechanically forces buy-low / sell-high.',
  },
];

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
   CHART
═══════════════════════════════════════════════════════════════ */

function initChart() {
  const labels  = HOLDINGS.map(h => h.ticker);
  const data    = HOLDINGS.map(h => h.pct);
  const dollars = HOLDINGS.map(h => h.dollar);
  const colors  = HOLDINGS.map(h => SLEEVE_COLORS[h.sleeve] ?? '#6b7280');

  new Chart(document.getElementById('currentChart'), {
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
              return ` $${fmt(dollars[i])}  (${data[i].toFixed(1)}%)`;
            },
          },
        },
      },
      animation: { duration: 600, easing: 'easeInOutQuart' },
    },
  });

  // build two-column legend with dollar amounts
  const legendEl = document.getElementById('currentLegend');
  HOLDINGS.forEach((h, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-left">
        <div class="legend-dot" style="background:${colors[i]}"></div>
        <span class="legend-ticker">${h.ticker}</span>
      </div>
      <span class="legend-dollar">$${fmt(h.dollar)}</span>
      <span class="legend-pct">${h.pct.toFixed(1)}%</span>
    `;
    legendEl.appendChild(item);
  });
}

/* ═══════════════════════════════════════════════════════════════
   SLEEVE BARS WITH TARGET RANGES
═══════════════════════════════════════════════════════════════ */

function initSleeveBars() {
  const container = document.getElementById('sleeveBars');
  const MAX = 65; // scale denominator for bar widths

  SLEEVES.forEach(s => {
    const inTarget = s.currentPct >= s.targetLow && s.currentPct <= s.targetHigh;
    const curW     = (s.currentPct  / MAX * 100).toFixed(1);
    const lowW     = (s.targetLow   / MAX * 100).toFixed(1);
    const rangeW   = ((s.targetHigh - s.targetLow) / MAX * 100).toFixed(1);

    const statusIcon  = inTarget ? '✓' : '↗';
    const statusClass = inTarget ? 'in-target' : 'over-target';

    const row = document.createElement('div');
    row.className = 'sleeve-row';
    row.innerHTML = `
      <div class="sleeve-row-header">
        <span class="sleeve-name">${s.name}</span>
        <div class="sleeve-meta">
          <span class="sleeve-target-label">Target: ${s.targetLow}–${s.targetHigh}%</span>
          <span class="sleeve-status ${statusClass}">${statusIcon}</span>
        </div>
      </div>
      <div class="sleeve-bar-track">
        <div class="sleeve-range-band" style="left:${lowW}%;width:${rangeW}%;background:${s.color}"></div>
        <div class="sleeve-bar-current" style="width:${curW}%;background:${s.color}">
          <span class="sleeve-bar-label">${s.currentPct.toFixed(1)}%</span>
        </div>
      </div>
      <div class="sleeve-purpose">${s.purpose}</div>
    `;
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
    tr.innerHTML = `
      <td><span class="ticker-cell">${h.ticker}</span></td>
      <td><span class="sleeve-tag ${tagClass}">${h.sleeve}</span></td>
      <td class="dollar-cell">$${fmt(h.dollar)}</td>
      <td class="pct-cell">${h.pct.toFixed(1)}%</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ═══════════════════════════════════════════════════════════════
   DEPLOYMENT LADDER
═══════════════════════════════════════════════════════════════ */

function initLadder() {
  const container = document.getElementById('deploymentLadder');

  LADDER_RUNGS.forEach(rung => {
    const div = document.createElement('div');
    div.className = 'ladder-rung' + (rung.crisis ? ' rung-crisis' : '');
    div.innerHTML = `
      <span class="rung-trigger ${rung.triggerClass}">${rung.trigger}</span>
      <span class="rung-action">${rung.action}</span>
      <span class="rung-amount">${rung.amount}</span>
    `;
    container.appendChild(div);
  });

  const tacticsEl = document.getElementById('tacticsList');
  TACTICS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tactic-card';
    card.innerHTML = `
      <div class="tactic-num">${t.num}</div>
      <div class="tactic-text">${t.text}</div>
    `;
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

    item.innerHTML = `
      <div class="accordion-header">
        <div class="accordion-title-row">
          <span class="accordion-tag" style="background:${r.tagBg};color:${r.tagColor}">${r.ticker}</span>
          <span class="accordion-title">${r.title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span class="accordion-meta" style="color:${r.metaColor}">${r.meta}</span>
          <span class="accordion-chevron">▼</span>
        </div>
      </div>
      <div class="accordion-body">
        <div class="accordion-content">${r.content}</div>
      </div>
    `;

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
    card.innerHTML = `
      <div class="rule-icon">${r.icon}</div>
      <div class="rule-title">${r.title}</div>
      <div class="rule-body">${r.body}</div>
    `;
    container.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════════════════
   PRIORITY LIST
═══════════════════════════════════════════════════════════════ */

function initPriority() {
  const container = document.getElementById('priorityList');
  PRIORITY.forEach(p => {
    const div = document.createElement('div');
    div.className = 'priority-item';
    div.innerHTML = `
      <div class="priority-rank">${p.rank}</div>
      <span class="priority-ticker">${p.ticker}</span>
      <span class="priority-desc">${p.desc}</span>
    `;
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
    div.innerHTML = `
      <span class="ref-num">${r.num}.</span>
      <a class="ref-link" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.text}</a>
    `;
    container.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  initSleeveBars();
  initHoldingsTable();
  initAccordion();
  initLadder();
  initRules();
  initPriority();
  initRefs();
});
