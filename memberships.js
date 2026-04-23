// ---------------------------------------------------------------
// Membership pricing + savings calculator
// Edit PLANS and GUEST_RATES below to change pricing assumptions.
// ---------------------------------------------------------------

const ANNUAL_MULTIPLIER = 10;   // 10 months of cost for 12 months = 2 months free
const COUPLES_MULTIPLIER = 1.7; // couples pay 1.7x single

const SIGNUP = {
  west: 'https://app.courtreserve.com/Online/Memberships/Public/8778',
  east: 'https://app.courtreserve.com/Online/Memberships/Public/15687',
};

const PLANS = {
  flex: {
    name: 'Flex',
    monthly: 39,
    perks: [
      '50% off 2-hour Open Play ($7 / $9 primetime)',
      '50% off court rentals ($15/hr, $20/hr primetime)',
      'FREE dinking practice room & gym',
      'FREE court cameras at East — record &amp; rewatch your games',
      'FREE Flex membership for children under 18',
      'FREE member events',
      '10–20% off leagues, round robins &amp; tournaments',
      '7-day advance booking',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    monthly: 99,
    featured: true,
    perks: [
      'FREE open play sessions',
      'FREE court rentals (4 per court)',
      'FREE dinking practice room & gym',
      'FREE court cameras at East — record &amp; rewatch your games',
      'FREE Flex membership for children under 18',
      'FREE member events',
      '50% off leagues, round robins &amp; tournaments',
      '9-day advance booking',
    ],
  },
  unlimited_plus: {
    name: 'Unlimited+',
    monthly: 139,
    perks: [
      'FREE open play sessions',
      'FREE court rentals (4 per court)',
      'FREE round robins (including DUPR), king/queen of the court',
      'FREE leagues &amp; tournaments',
      '2 free guest passes/mo ($40 value)',
      '1 free clinic/mo ($30 value)',
      'FREE dinking practice room & gym',
      'FREE court cameras at East — record &amp; rewatch your games',
      'FREE Flex membership for children under 18',
      'FREE member events',
      '10-day advance booking',
    ],
  },
};

const GUEST_RATES = {
  openPlay: 14,        // per 2-hr session
  courtPerHr: 30,      // per hour (full court up to 6)
  league: 120,         // per 6-week league
  tournament: 50,      // per tournament entry
};

// Flex-member rates for calculator
const FLEX_RATES = {
  openPlay: 7,
  courtPerHr: 15,
  league: 96,          // ~20% off
  tournament: 40,
};

// ---------------------------------------------------------------
// Render pricing cards based on toggle state
// ---------------------------------------------------------------

const state = { billing: 'monthly', party: 'single' };

function planPrice(plan) {
  let price = plan.monthly;
  if (state.party === 'couples') price *= COUPLES_MULTIPLIER;
  if (state.billing === 'annual') price *= ANNUAL_MULTIPLIER / 12; // effective monthly
  return price;
}

function annualCost(plan) {
  let p = plan.monthly * 12;
  if (state.party === 'couples') p *= COUPLES_MULTIPLIER;
  if (state.billing === 'annual') p = (plan.monthly * ANNUAL_MULTIPLIER) * (state.party === 'couples' ? COUPLES_MULTIPLIER : 1);
  return p;
}

function annualSavings(plan) {
  // savings vs monthly-single baseline annual cost
  const baseline = plan.monthly * 12 * (state.party === 'couples' ? COUPLES_MULTIPLIER : 1);
  const actual = annualCost(plan);
  return Math.max(0, baseline - actual);
}

function money(n) {
  return '$' + Math.round(n).toLocaleString();
}

function renderPlans() {
  const grid = document.getElementById('plan-grid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.entries(PLANS).forEach(([key, plan]) => {
    const effMonthly = planPrice(plan);
    const savings = annualSavings(plan);
    const billingLabel = state.billing === 'annual' ? '/mo, billed annually' : '/mo';

    const el = document.createElement('div');
    el.className = 'plan' + (plan.featured ? ' featured' : '');
    el.innerHTML = `
      <h3>${plan.name}${state.party === 'couples' ? ' (Couples)' : ''}</h3>
      <div class="price">${money(effMonthly)}<small>${billingLabel}</small></div>
      ${savings > 0 ? `<div class="savings-badge">Save ${money(savings)}/yr</div>` : ''}
      <ul>${plan.perks.map(p => `<li>${p}</li>`).join('')}</ul>
      <div class="plan-ctas">
        <a href="${SIGNUP.west}" class="btn" target="_blank" rel="noopener">Join at West</a>
        <a href="${SIGNUP.east}" class="btn" target="_blank" rel="noopener">Join at East</a>
      </div>
    `;
    grid.appendChild(el);
  });
}

// ---------------------------------------------------------------
// Toggles
// ---------------------------------------------------------------

function bindToggles() {
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.toggle;
      const value = btn.dataset.value;
      state[group] = value;
      document.querySelectorAll(`[data-toggle="${group}"]`).forEach(b => {
        b.classList.toggle('active', b.dataset.value === value);
      });
      renderPlans();
    });
  });
}

// ---------------------------------------------------------------
// Calculator: recommend the best-value plan
// ---------------------------------------------------------------

function calculate() {
  const openPlays = parseFloat(document.getElementById('calc-openplay').value) || 0;
  const courtHrs = parseFloat(document.getElementById('calc-court').value) || 0;
  const leagues = parseFloat(document.getElementById('calc-leagues').value) || 0;
  const tourneys = parseFloat(document.getElementById('calc-tourneys').value) || 0;
  const couples = document.getElementById('calc-couples').checked;

  const multiplier = couples ? 2 : 1; // 2 players generating events

  // Weekly events scaled to yearly
  const yearlyOpenPlay = openPlays * 52 * multiplier;
  const yearlyCourtHrs = courtHrs * 52 * multiplier;
  const yearlyLeagues = leagues * multiplier;
  const yearlyTourneys = tourneys * multiplier;

  const guestYearly =
    yearlyOpenPlay * GUEST_RATES.openPlay +
    yearlyCourtHrs * GUEST_RATES.courtPerHr +
    yearlyLeagues * GUEST_RATES.league +
    yearlyTourneys * GUEST_RATES.tournament;

  // Cost under each plan (annual membership, best pricing)
  const coupleMult = couples ? COUPLES_MULTIPLIER : 1;

  const flexMembership = PLANS.flex.monthly * ANNUAL_MULTIPLIER * coupleMult;
  const flexUsage =
    yearlyOpenPlay * FLEX_RATES.openPlay +
    yearlyCourtHrs * FLEX_RATES.courtPerHr +
    yearlyLeagues * FLEX_RATES.league +
    yearlyTourneys * FLEX_RATES.tournament;
  const flexTotal = flexMembership + flexUsage;

  const unlimitedMembership = PLANS.unlimited.monthly * ANNUAL_MULTIPLIER * coupleMult;
  const unlimitedUsage =
    yearlyLeagues * FLEX_RATES.league * 0.5 + // 50% off leagues
    yearlyTourneys * FLEX_RATES.tournament * 0.5;
  const unlimitedTotal = unlimitedMembership + unlimitedUsage;

  const plusMembership = PLANS.unlimited_plus.monthly * ANNUAL_MULTIPLIER * coupleMult;
  const plusTotal = plusMembership; // leagues & tournaments free

  const options = [
    { key: 'guest', name: 'Pay as Guest', total: guestYearly },
    { key: 'flex', name: 'Flex (Annual)', total: flexTotal },
    { key: 'unlimited', name: 'Unlimited (Annual)', total: unlimitedTotal },
    { key: 'unlimited_plus', name: 'Unlimited+ (Annual)', total: plusTotal },
  ].sort((a, b) => a.total - b.total);

  const best = options[0];
  const vsGuest = guestYearly - best.total;

  const out = document.getElementById('calc-result');
  out.innerHTML = `
    <div class="calc-recommend">
      <span class="eyebrow">Best Match</span>
      <h3>${best.name}</h3>
      <p class="calc-total">${money(best.total)}<small>/year</small></p>
      ${best.key !== 'guest' && vsGuest > 0 ? `<p class="calc-save">Saves ~${money(vsGuest)} vs. paying as a guest</p>` : ''}
    </div>
    <div class="calc-breakdown">
      <h4>All options, ranked:</h4>
      <ol>
        ${options.map(o => `<li><strong>${o.name}</strong> — ${money(o.total)}/yr</li>`).join('')}
      </ol>
      <p class="calc-note">Estimates based on current listed rates. Prime-time and weekend pricing may vary.</p>
    </div>
  `;
  out.style.display = 'block';
}

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  renderPlans();
  bindToggles();
  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) calcBtn.addEventListener('click', calculate);
});
