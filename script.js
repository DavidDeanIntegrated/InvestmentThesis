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
  { ticker:'SGOV', sleeve:'Dry Powder',         currentDollar: 824.86, currentPct: 21.7, proposedDollar: 594.05, proposedPct: 15.7, change: -6.1 },
  { ticker:'VTI',  sleeve:'Broad Market',        currentDollar: 808.82, currentPct: 21.3, proposedDollar: 808.82, proposedPct: 21.3, change: 0   },
  { ticker:'BTC',  sleeve:'Crypto',              currentDollar: 461.46, currentPct: 12.2, proposedDollar: 461.46, proposedPct: 12.2, change: 0   },
  { ticker:'GLD',  sleeve:'Gold',                currentDollar: 329.10, currentPct:  8.7, proposedDollar: 417.44, proposedPct: 11.0, change: +2.3 },
  { ticker:'VTV',  sleeve:'Value',               currentDollar: 308.16, currentPct:  8.1, proposedDollar: 308.16, proposedPct:  8.1, change: 0   },
  { ticker:'NVDA', sleeve:'Quality Compounder',  currentDollar: 207.10, currentPct:  5.5, proposedDollar: 207.10, proposedPct:  5.5, change: 0   },
  { ticker:'TSM',  sleeve:'Quality Compounder',  currentDollar: 191.17, currentPct:  5.0, proposedDollar: 191.17, proposedPct:  5.0, change: 0   },
  { ticker:'MSFT', sleeve:'Quality Compounder',  currentDollar: 180.55, currentPct:  4.8, proposedDollar: 180.55, proposedPct:  4.8, change: 0   },
  { ticker:'PLTR', sleeve:'High Conviction',     currentDollar: 170.10, currentPct:  4.5, proposedDollar: 132.82, proposedPct:  3.5, change: -1.0 },
  { ticker:'VXUS', sleeve:'International',       currentDollar: 161.92, currentPct:  4.3, proposedDollar: 227.70, proposedPct:  6.0, change: +1.7 },
  { ticker:'RKLB', sleeve:'High Conviction',     currentDollar: 151.68, currentPct:  4.0, proposedDollar: 113.85, proposedPct:  3.0, change: -1.0 },
  { ticker:'BCI',  sleeve:'Commodity',           currentDollar:   0.00, currentPct:  0.0, proposedDollar: 151.80, proposedPct:  4.0, change: +4.0, isNew: true },
];

const SLEEVES = [
  { name: 'Equities',                     currentPct: 57.4, proposedPct: 57.2, change: -0.2 },
  { name: 'Real Assets (Gold+Commodities)',currentPct:  8.7, proposedPct: 15.0, change: +6.3 },
  { name: 'Dry Powder (SGOV)',             currentPct: 21.7, proposedPct: 15.7, change: -6.1 },
  { name: 'Crypto (BTC)',                  currentPct: 12.2, proposedPct: 12.2, change:  0   },
];

const SLEEVE_BAR_COLORS = {
  'Equities':                      '#60a5fa',
  'Real Assets (Gold+Commodities)':'#f5c842',
  'Dry Powder (SGOV)':             '#22c55e',
  'Crypto (BTC)':                  '#a78bfa',
};

const SELLS = [
  { ticker: 'SGOV', amount: 230.81 },
  { ticker: 'PLTR', amount:  37.28 },
  { ticker: 'RKLB', amount:  37.83 },
];

const BUYS = [
  { ticker: 'BCI',  amount: 151.80, note: 'new position' },
  { ticker: 'GLD',  amount:  88.34, note: 'add to existing' },
  { ticker: 'VXUS', amount:  65.78, note: 'add to existing' },
];

const TIMELINES = {
  standard: [
    {
      week: 'W1',
      label: 'Week 1',
      action: 'Sell $37.28 PLTR + $37.83 RKLB + $76.69 SGOV → Buy $151.80 BCI',
      source: 'Funding: PLTR/RKLB trims + partial SGOV',
    },
    {
      week: 'W2',
      label: 'Week 2',
      action: 'Sell $154.12 SGOV → Buy $88.34 GLD + $65.78 VXUS',
      source: 'Funding: SGOV',
    },
  ],
  nosell: [
    {
      week: 'W1',
      label: 'Week 1',
      action: 'Sell $151.80 SGOV → Buy $151.80 BCI',
      source: 'No PLTR/RKLB trims required',
    },
    {
      week: 'W2',
      label: 'Week 2',
      action: 'Sell $88.34 SGOV → Buy $88.34 GLD',
      source: 'SGOV drops to ~$584 (15.4%)',
    },
    {
      week: 'Ongoing',
      label: 'Ongoing',
      action: 'Direct new contributions to VXUS until it reaches ~$228 (6% target)',
      source: 'PLTR and RKLB remain unchanged at 4.5% and 4.0%',
    },
  ],
};

const LADDER_RUNGS = [
  {
    trigger: '–10% SPY',
    triggerClass: 'rung-10',
    action: 'Buy <strong>VTI</strong> (broad US core)',
    amount: '$180',
    crisis: false,
  },
  {
    trigger: '–15% SPY',
    triggerClass: 'rung-15',
    action: 'Buy <strong>Quality Compounders</strong> — equal split: NVDA / MSFT / TSM',
    amount: '$180',
    crisis: false,
  },
  {
    trigger: '–25%+ or VIX >40',
    triggerClass: 'rung-25',
    action: '<strong>Aggressive deploy</strong> — VTI + VXUS + high-conviction names on sale (PLTR, RKLB, etc.)',
    amount: '~$234',
    crisis: true,
  },
];

const TACTICS = [
  {
    num: 1,
    text: '<strong>Check frequency:</strong> Once per week (Sunday evening) or any day SPY drops ≥2%. Takes 30 seconds.',
  },
  {
    num: 2,
    text: '<strong>Calculate trigger:</strong> Open SPY chart → 3-month view → find highest closing price. 10% trigger = that high × 0.90.',
  },
  {
    num: 3,
    text: '<strong>Execution:</strong> Spread the tranche over 1–3 trading days. Never deploy all at once.',
  },
  {
    num: 4,
    text: '<strong>Dalio gut-check:</strong> If BCI and GLD are flat or rising while stocks fall, it\'s a stronger "buy the dip" signal.',
  },
  {
    num: 5,
    text: '<strong>Replenish SGOV:</strong> New paycheck money goes to SGOV first until it\'s back to ~15%. If 12+ months with no deployment, lower target to 10%.',
  },
  {
    num: 6,
    text: '<strong>Permanent floor:</strong> Never let SGOV drop below $100–150 (true emergency cash).',
  },
];

const RATIONALE = [
  {
    ticker: 'GLD',
    change: '+2.3%',
    changeClass: 'change-pos',
    tagBg: 'rgba(245,200,66,0.15)',
    tagColor: '#f5c842',
    title: 'GLD: 8.7% → 11.0% (+$88)',
    meta: '+$88.34',
    metaColor: '#22c55e',
    content: `<p>The current 8.7% gold allocation is already closer to Dalio's target than the theoretical portfolio was. Only ~$88 needs to be added to reach 11%.</p>
<p>At the World Governments Summit in February 2026, Dalio reiterated that gold is <em>"the safest money in this kind of environment."</em> Gold is trading around $5,121–$5,247/oz. J.P. Morgan projects $6,300/oz by year-end 2026, and Goldman Sachs forecasts $5,400.</p>
<p>The structural case — $38 trillion in U.S. debt, central bank buying, de-dollarization — remains intact. With BTC already at 12.2%, pushing gold to 11% now creates the right structural hedge without requiring a BTC sell.</p>`,
  },
  {
    ticker: 'BCI',
    change: '+4.0%',
    changeClass: 'change-pos',
    tagBg: 'rgba(251,146,60,0.15)',
    tagColor: '#fb923c',
    title: 'BCI (New): 0% → 4.0% (+$152)',
    meta: 'New Position',
    metaColor: '#22c55e',
    content: `<p>Dalio's All Weather framework allocates to commodities as a distinct asset class designed to perform during rising inflation. BCI (abrdn Bloomberg All Commodity Strategy K-1 Free ETF) tracks the Bloomberg Commodity Index Total Return (BCOM) — the broad, diversified index with balanced exposure across energy, metals, agriculture, and livestock.</p>
<p><strong>0.26% expense ratio, ETF structure, no K-1.</strong> This 4% allocation is a pragmatic starter for a smaller portfolio.</p>
<p>The inflation case for 2026 is building: Wellington projects conditions "ripe for an inflationary boom," Invesco expects commodity prices to push inflation higher, and PIMCO recommends "modest, diversified allocations across gold and broad commodities."</p>`,
  },
  {
    ticker: 'VXUS',
    change: '+1.7%',
    changeClass: 'change-pos',
    tagBg: 'rgba(52,211,153,0.15)',
    tagColor: '#34d399',
    title: 'VXUS: 4.3% → 6.0% (+$66)',
    meta: '+$65.78',
    metaColor: '#22c55e',
    content: `<p>Already at 4.3% (vs. 2.7% theoretical), only ~$66 needs to be added to reach 6%. VXUS closed around $82.93 on February 23, 2026.</p>
<p>Dalio's chapter is emphatic about survivorship bias — the mistake of using only U.S. returns as representative. Vanguard projects 4.9%–6.9% average annual returns for non-U.S. equities over the next decade, compared to lower projections for U.S. equities.</p>`,
  },
  {
    ticker: 'SGOV',
    change: '–6.1%',
    changeClass: 'change-neg',
    tagBg: 'rgba(34,197,94,0.15)',
    tagColor: '#22c55e',
    title: 'SGOV: 21.7% → 15.7% (–$231)',
    meta: '–$230.81',
    metaColor: '#f87171',
    content: `<p>SGOV is the primary funding source for the reallocation. At 15.7%, it still provides substantial dry powder — enough to deploy meaningfully if the S&P 500 drops 10–15%.</p>
<p>Dalio's observation that real cash yields are near historically negative levels means holding excessive T-bills carries its own cost. The deployment ladder from the original plan still functions at this level.</p>`,
  },
  {
    ticker: 'PLTR + RKLB',
    change: '–2.0%',
    changeClass: 'change-neg',
    tagBg: 'rgba(248,113,113,0.15)',
    tagColor: '#f87171',
    title: 'PLTR: 4.5% → 3.5% and RKLB: 4.0% → 3.0%',
    meta: '–$75.11',
    metaColor: '#f87171',
    content: `<p>Combined high-conviction speculative exposure drops from 8.5% to 6.5%. These are the positions most vulnerable to the valuation compression Dalio warns about during late-cycle transitions.</p>
<p>Both remain meaningful enough to capture upside if the thesis plays out, but the trims fund the real asset and international diversification upgrades. <strong>This step is optional</strong> — the entire reallocation can be funded from SGOV alone if you prefer not to sell.</p>`,
  },
];

const PRIORITY = [
  { rank: 1, ticker: 'SGOV',      desc: 'Until back at <strong>15.7% target</strong>' },
  { rank: 2, ticker: 'VXUS',      desc: 'Until it reaches <strong>6%</strong> (if using no-sell path)' },
  { rank: 3, ticker: 'VTI',       desc: 'Maintain as the core position' },
  { rank: 4, ticker: 'GLD',       desc: 'Continue building toward <strong>12–15%</strong> over time' },
  { rank: 5, ticker: 'BCI',       desc: 'Maintain at <strong>~4%</strong> with occasional top-ups' },
  { rank: 6, ticker: 'NVDA/TSM/MSFT', desc: 'Opportunistic adds on dips' },
];

const RULES = [
  {
    icon: '🗓',
    title: 'Hybrid Rebalance Cadence',
    body: 'Quarterly (Mar/Jun/Sep/Dec last trading day) <strong>plus</strong> anytime any sleeve drifts more than <strong>5% absolute</strong> from target.',
  },
  {
    icon: '⚖',
    title: 'Process',
    body: 'Sell whatever has outperformed most → buy whatever has lagged. Keep all trades minimal and use fractional shares on Robinhood.',
  },
  {
    icon: '💰',
    title: 'After SGOV Deployment',
    body: 'New money to SGOV first. Then light profit-taking on +10% recovery — sell 40% of the deployed tranche and return to SGOV.',
  },
  {
    icon: '🏆',
    title: 'Real Assets Priority',
    body: 'Never let GLD + BCI fall below <strong>14%</strong> or rise above <strong>16%</strong> for long — they are the core protection against devaluation.',
  },
  {
    icon: '₿',
    title: 'BTC Special Rule',
    body: 'Hold at current weight and let dilution happen naturally. No forced rebalance unless the >5% drift trigger is hit.',
  },
  {
    icon: '📈',
    title: 'Dalio\'s Bottom Line',
    body: '"Rebalancing is what turns a bunch of good uncorrelated bets into a truly balanced portfolio that can survive any season of the Big Cycle."',
  },
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
   CHARTS
═══════════════════════════════════════════════════════════════ */

function buildChartData(useProposed) {
  const rows = HOLDINGS.filter(h => useProposed ? h.proposedPct > 0 : h.currentPct > 0);
  return {
    labels:  rows.map(h => h.ticker),
    data:    rows.map(h => useProposed ? h.proposedPct : h.currentPct),
    dollars: rows.map(h => useProposed ? h.proposedDollar : h.currentDollar),
    colors:  rows.map(h => SLEEVE_COLORS[h.sleeve] ?? '#6b7280'),
  };
}

function buildLegend(containerId, chartData) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  chartData.labels.forEach((label, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-left">
        <div class="legend-dot" style="background:${chartData.colors[i]}"></div>
        <span class="legend-ticker">${label}</span>
      </div>
      <span class="legend-pct">${chartData.data[i].toFixed(1)}%</span>
    `;
    el.appendChild(item);
  });
}

let currentChartInst = null;
let proposedChartInst = null;

function initCharts() {
  const curData = buildChartData(false);
  const propData = buildChartData(true);

  const chartConfig = (data) => ({
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: data.colors,
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
          bodyFont: { family: "'Inter', system-ui, sans-serif", size: 12 },
          titleColor: '#e8edf5',
          bodyColor: '#8a9bb8',
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const i = item.dataIndex;
              return ` $${fmt(data.dollars[i])}  (${data.data[i].toFixed(1)}%)`;
            },
          },
        },
      },
      animation: { duration: 600, easing: 'easeInOutQuart' },
    },
  });

  currentChartInst  = new Chart(document.getElementById('currentChart'),  chartConfig(curData));
  proposedChartInst = new Chart(document.getElementById('proposedChart'), chartConfig(propData));

  buildLegend('currentLegend',  curData);
  buildLegend('proposedLegend', propData);
}

/* ═══════════════════════════════════════════════════════════════
   VIEW TOGGLE (both / current / proposed)
═══════════════════════════════════════════════════════════════ */

function initViewToggle() {
  const btns = document.querySelectorAll('#viewToggle .toggle-btn');
  const row  = document.getElementById('chartsRow');
  const curCard  = document.getElementById('currentChartCard');
  const propCard = document.getElementById('proposedChartCard');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = btn.dataset.view;
      if (v === 'both') {
        row.style.gridTemplateColumns = '1fr 1fr';
        curCard.style.display  = '';
        propCard.style.display = '';
      } else if (v === 'current') {
        row.style.gridTemplateColumns = '1fr';
        curCard.style.display  = '';
        propCard.style.display = 'none';
      } else {
        row.style.gridTemplateColumns = '1fr';
        curCard.style.display  = 'none';
        propCard.style.display = '';
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   SLEEVE BARS
═══════════════════════════════════════════════════════════════ */

function initSleeveBars() {
  const container = document.getElementById('sleeveBars');

  SLEEVES.forEach(s => {
    const maxPct = Math.max(s.currentPct, s.proposedPct, 30);
    const curW   = (s.currentPct  / maxPct * 100).toFixed(1);
    const propW  = (s.proposedPct / maxPct * 100).toFixed(1);
    const color  = SLEEVE_BAR_COLORS[s.name] ?? '#60a5fa';
    const deltaClass = s.change > 0 ? 'positive' : s.change < 0 ? 'negative' : 'neutral';
    const deltaStr   = s.change > 0 ? `+${s.change.toFixed(1)}%` : s.change < 0 ? `${s.change.toFixed(1)}%` : '—';

    const row = document.createElement('div');
    row.className = 'sleeve-row';
    row.innerHTML = `
      <span class="sleeve-name">${s.name}</span>
      <div class="sleeve-bar-track">
        <div class="sleeve-bar-current" style="width:${curW}%;background:${color}">
          ${s.currentPct.toFixed(1)}%
        </div>
        <div class="sleeve-bar-proposed" style="width:${propW}%;border-color:${color}"></div>
      </div>
      <span class="sleeve-delta ${deltaClass}">${deltaStr}</span>
    `;
    container.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════════
   HOLDINGS TABLE
═══════════════════════════════════════════════════════════════ */

function renderHoldingsTable(filterChanges) {
  const tbody = document.getElementById('holdingsTbody');
  tbody.innerHTML = '';

  HOLDINGS.forEach(h => {
    const isChanged = h.change !== 0;
    if (filterChanges && !isChanged) return;

    const changeStr   = h.change > 0 ? `+${h.change.toFixed(1)}%` : h.change < 0 ? `${h.change.toFixed(1)}%` : '—';
    const changeClass = h.change > 0 ? 'change-pos' : h.change < 0 ? 'change-neg' : 'change-neu';
    const tagClass    = sleeveTagClass(h.sleeve);

    const tr = document.createElement('tr');
    if (h.isNew) tr.style.background = 'rgba(34,197,94,0.04)';

    tr.innerHTML = `
      <td><span class="ticker-cell${h.isNew ? ' new-pos' : ''}">${h.ticker}${h.isNew ? ' ✦' : ''}</span></td>
      <td><span class="sleeve-tag ${tagClass}">${h.sleeve}</span></td>
      <td>${h.currentDollar > 0 ? '$' + fmt(h.currentDollar) : '—'}</td>
      <td>${h.currentPct > 0 ? h.currentPct.toFixed(1) + '%' : '—'}</td>
      <td>$${fmt(h.proposedDollar)}</td>
      <td>${h.proposedPct.toFixed(1)}%</td>
      <td class="change-cell ${changeClass}">${changeStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initTableToggle() {
  renderHoldingsTable(false);

  const btns = document.querySelectorAll('#tableToggle .toggle-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHoldingsTable(btn.dataset.table === 'changes');
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   TRADES
═══════════════════════════════════════════════════════════════ */

function initTrades() {
  const sellsEl = document.getElementById('sellsList');
  const buysEl  = document.getElementById('buysList');

  SELLS.forEach(s => {
    const div = document.createElement('div');
    div.className = 'trade-item sell';
    div.innerHTML = `<span class="trade-ticker">${s.ticker}</span><span class="trade-amount">–$${fmt(s.amount)}</span>`;
    sellsEl.appendChild(div);
  });

  BUYS.forEach(b => {
    const div = document.createElement('div');
    div.className = 'trade-item buy';
    div.innerHTML = `
      <span class="trade-ticker">${b.ticker} <span style="color:var(--text-muted);font-size:0.72rem;font-family:var(--font-sans)">${b.note}</span></span>
      <span class="trade-amount">+$${fmt(b.amount)}</span>
    `;
    buysEl.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════════════════════════ */

function renderTimeline(path) {
  const container = document.getElementById('timeline');
  container.innerHTML = '';
  const items = TIMELINES[path];

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `
      <div class="timeline-dot-wrapper">
        <div class="timeline-dot">${item.week}</div>
      </div>
      <div class="timeline-content">
        <div class="timeline-label">${item.label}</div>
        <div class="timeline-action">${item.action}</div>
        <div class="timeline-source">${item.source}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function initTimeline() {
  renderTimeline('standard');

  const btns = document.querySelectorAll('#pathToggle .toggle-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTimeline(btn.dataset.path);
    });
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
   RATIONALE ACCORDION
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

      // close all
      container.querySelectorAll('.accordion-item').forEach(ai => {
        ai.classList.remove('open');
        ai.querySelector('.accordion-body').style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });

    // set initial height for the first open item
    if (idx === 0) {
      setTimeout(() => { body.style.maxHeight = body.scrollHeight + 'px'; }, 50);
    }

    container.appendChild(item);
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
  initCharts();
  initViewToggle();
  initSleeveBars();
  initTableToggle();
  initTrades();
  initTimeline();
  initLadder();
  initAccordion();
  initPriority();
  initRules();
  initRefs();
});
