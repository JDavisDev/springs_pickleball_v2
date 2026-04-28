// ---------------------------------------------------------------
// Membership pricing + savings calculator
// Edit PLANS and GUEST_RATES below to change pricing assumptions.
// ---------------------------------------------------------------

const SIGNUP = {
  west: 'https://app.courtreserve.com/Online/Memberships/Public/8778',
  east: 'https://app.courtreserve.com/Online/Memberships/Public/15687',
};

const PLANS = {
  guest: {
    name: 'Free Guest Account',
    category: 'single',
    featured: false,
    prices: {
      monthly: { amount: 0, label: 'free' },
    },
    description: 'Create a free guest account, sign the waiver, and book courts and events at both locations.',
    perks: [
      'Free basic paddle rental',
      'Lowest guest court and open play prices',
      '3-day advance booking',
      'Access to leagues, socials, tournaments, and events',
    ],
  },
  summer_unlimited: {
    name: 'Summer 3-Month Unlimited',
    category: 'single',
    featured: true,
    prices: {
      summer: { amount: 249, label: 'one time', billingText: '$83/mo equivalent' },
    },
    description: 'Unlimited play for 3 months, including open play and doubles court rentals.',
    perks: [
      '3 months of Unlimited membership for $249',
      'Free 2-hour open play sessions',
      'Free court rentals for doubles play',
      '50% off leagues, socials, and in-house tournaments',
      'Works at West and East',
    ],
  },
  flex: {
    name: 'Flex',
    category: 'single',
    prices: {
      annual: { amount: 39, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 49 },
      monthly: { amount: 49, label: '/mo', billingText: 'month to month' },
    },
    description: 'Save 50% on open play and court rentals, with 7-day advance registration.',
    perks: [
      '50% off court rentals and open play',
      '7-day advance registration',
      'Free paddle demos and 10% account credit on paddle purchases',
      'Free access to dink room, gym, and shower rooms',
      'Discounts on leagues and Springs Pickleball-run tournaments',
    ],
  },
  youth_unlimited: {
    name: 'Youth Unlimited',
    category: 'single',
    prices: {
      annual: { amount: 79, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 119 },
    },
    description: 'Unlimited membership for youth ages 8 to 18.',
    perks: [
      'Free open play and doubles court rentals',
      '9-day advance reservations',
      'Built for youth players ages 8 to 18',
      'Works at West and East',
    ],
  },
  couples_flex: {
    name: 'Couples Flex',
    category: 'couples',
    prices: {
      annual: { amount: 69, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 98 },
    },
    description: 'Both players save 50% on open play and court rentals, with 7-day advance registration.',
    perks: [
      '50% off court rentals and open play for each person',
      '7-day advance booking',
      'Works at West and East',
      'Free access to dink room, gym, and shower rooms',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    category: 'single',
    featured: true,
    prices: {
      annual: { amount: 99, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 139 },
      monthly: { amount: 129, label: '/mo', billingText: 'month to month' },
    },
    description: 'Never pay for open play or doubles court rentals, with 9-day advance reservations.',
    perks: [
      'Free court rentals for doubles play',
      'Free open play sessions',
      '9-day advance reservations',
      'Free drilling and singles time when courts are available',
      '50% off leagues, round robins &amp; tournaments',
    ],
  },
  couples_unlimited: {
    name: 'Couples Unlimited',
    category: 'couples',
    featured: true,
    prices: {
      annual: { amount: 189, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 269 },
    },
    description: 'Unlimited play for two people, including open play and doubles court rentals.',
    perks: [
      'Free open play and court rentals',
      '10-day advance registration',
      '50% off leagues and Springs Pickleball-run tournaments',
      'Free access to dink room, gym, and shower rooms',
    ],
  },
  unlimited_plus: {
    name: 'Unlimited+',
    category: 'single',
    prices: {
      annual: { amount: 139, label: '/mo', billingText: 'annual commitment, billed monthly', compareAt: 169 },
    },
    description: 'The ultimate membership with free open play, doubles court rentals, leagues, tournaments, clinics, and guest passes.',
    perks: [
      'Free open play and court rentals for doubles play',
      'Free Springs Pickleball-hosted leagues and tournaments',
      '1 free clinic per month ($30 value)',
      'Guest passes included',
      '10-day advance reservations',
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

const state = { billing: 'annual', party: 'single' };

function planVariant(plan) {
  return plan.prices[state.billing];
}

function planAnnualCost(plan, billing = state.billing) {
  const variant = plan.prices[billing];
  if (!variant) return null;
  return billing === 'summer' ? variant.amount : variant.amount * 12;
}

function annualSavings(plan) {
  const variant = planVariant(plan);
  if (!variant || !variant.compareAt) return 0;
  return Math.max(0, (variant.compareAt - variant.amount) * 12);
}

function money(n) {
  return '$' + Math.round(n).toLocaleString();
}

function renderPlans() {
  const grid = document.getElementById('plan-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const visiblePlans = Object.entries(PLANS).filter(([, plan]) => {
    return plan.category === state.party && planVariant(plan);
  });

  if (!visiblePlans.length) {
    grid.innerHTML = '<div class="plan empty-plan"><h3>No current option</h3><p>There is not a currently listed membership for this billing and player type. Choose another toggle or register through CourtReserve to see all available options.</p></div>';
    return;
  }

  visiblePlans.forEach(([key, plan]) => {
    const variant = planVariant(plan);
    const savings = annualSavings(plan);

    const el = document.createElement('div');
    el.className = 'plan' + (plan.featured ? ' featured' : '');
    el.innerHTML = `
      <h3>${plan.name}</h3>
      <div class="price">${money(variant.amount)}<small>${variant.label}</small></div>
      ${variant.billingText ? `<p class="plan-note">${variant.billingText}</p>` : ''}
      ${savings > 0 ? `<div class="savings-badge">Save ${money(savings)}/yr</div>` : ''}
      ${plan.description ? `<p>${plan.description}</p>` : ''}
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

  // Cost under each plan uses current annual-special pricing from CourtReserve.
  const flexPlan = couples ? PLANS.couples_flex : PLANS.flex;
  const unlimitedPlan = couples ? PLANS.couples_unlimited : PLANS.unlimited;

  const flexMembership = planAnnualCost(flexPlan, 'annual');
  const flexUsage =
    yearlyOpenPlay * FLEX_RATES.openPlay +
    yearlyCourtHrs * FLEX_RATES.courtPerHr +
    yearlyLeagues * FLEX_RATES.league +
    yearlyTourneys * FLEX_RATES.tournament;
  const flexTotal = flexMembership + flexUsage;

  const unlimitedMembership = planAnnualCost(unlimitedPlan, 'annual');
  const unlimitedUsage =
    yearlyLeagues * FLEX_RATES.league * 0.5 + // 50% off leagues
    yearlyTourneys * FLEX_RATES.tournament * 0.5;
  const unlimitedTotal = unlimitedMembership + unlimitedUsage;

  const options = [
    { key: 'guest', name: 'Pay as Guest', total: guestYearly },
    { key: 'flex', name: `${flexPlan.name} (Annual Special)`, total: flexTotal },
    { key: 'unlimited', name: `${unlimitedPlan.name} (Annual Special)`, total: unlimitedTotal },
  ];

  if (!couples) {
    const plusTotal = planAnnualCost(PLANS.unlimited_plus, 'annual'); // leagues & tournaments free
    options.push({ key: 'unlimited_plus', name: 'Unlimited+ (Annual Special)', total: plusTotal });
  }

  options.sort((a, b) => a.total - b.total);

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
