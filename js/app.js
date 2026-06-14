/* ════════════════════════════════════════════
   VELORA FASHION — Main Application
   Barcha ma'lumotlar database.json dan olinadi
   ════════════════════════════════════════════ */

// ── State ─────────────────────────────────────
let DB = null;
let filteredProducts = [];
let currentCategory = 'all';
let productPage = 1;
const PAGE_SIZE = 8;

// ── Load database ─────────────────────────────
const loadDB = async () => {
  const res = await fetch('database.json');
  DB = await res.json();
  return DB;
};

// ── Number formatter ──────────────────────────
const fmt = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000     ? `$${(n / 1_000).toFixed(0)}K`     : `$${n}`;

const fmtNum = (n) => n.toLocaleString('uz-UZ');

// ── Date formatter ────────────────────────────
const fmtDate = (str) =>
  new Date(str).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });

// ═══════════════════════════════════════════════
// DASHBOARD METRICS
// ═══════════════════════════════════════════════
const renderMetrics = () => {
  const d = DB.dashboard;
  const items = [
    { el: 'mRevenue',     val: fmt(d.totalRevenue),      trend: `↑ +${d.revenueGrowthPercent}% o'sdi` },
    { el: 'mOrders',      val: fmtNum(d.totalOrders),    trend: `↑ +${d.ordersGrowthPercent}% o'sdi` },
    { el: 'mCustomers',   val: fmtNum(d.newCustomers),   trend: `↑ +${d.customersGrowthPercent}% o'sdi` },
    { el: 'mDelivery',    val: `${d.deliverySuccessRate}%`, trend: `Muvaffaqiyatli` },
  ];
  items.forEach(({ el, val, trend }) => {
    const valEl   = document.getElementById(el + 'Val');
    const trendEl = document.getElementById(el + 'Trend');
    if (valEl)   { valEl.textContent   = val;   valEl.closest('.metric-card')?.classList.remove('loading'); }
    if (trendEl) { trendEl.textContent = trend; }
  });

  // Hero counters
  set('heroOrders',    fmtNum(d.totalOrders));
  set('heroPartners',  fmtNum(d.totalPartners) + '+');
  set('heroUptime',    '99.9%');
  set('heroProducts',  fmtNum(d.activeProducts) + '+');
};

// ═══════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════
const renderCharts = () => {
  Charts.renderRevenue(DB.monthlyRevenue);
  Charts.renderCategory(DB.categories);
  Charts.renderTraffic(DB.weeklyTraffic);
  Charts.renderConversion(DB.weeklyTraffic);
};

// ═══════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════
const EMOJI_MAP = {
  'Ayollar':  '👗', 'Erkaklar': '👔', 'Bolalar':  '🧒',
  'Sport':    '⚽', 'Aksessuar':'👜',
};

const getProducts = () =>
  currentCategory === 'all'
    ? DB.products
    : DB.products.filter(p => p.category === currentCategory);

const renderProducts = (reset = false) => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (reset) { grid.innerHTML = ''; productPage = 1; filteredProducts = getProducts(); }

  const start = (productPage - 1) * PAGE_SIZE;
  const slice = filteredProducts.slice(start, start + PAGE_SIZE);

  if (!slice.length && productPage === 1) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem">Mahsulot topilmadi</p>';
    return;
  }

  slice.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb" style="background:${p.color}">
        ${EMOJI_MAP[p.category] || '👕'}
        ${p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase()}">${p.badge === 'Hot' ? '🔥 Mashhur' : '✨ Yangi'}</span>` : ''}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-cat">${p.category} · ${p.subCategory}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <div class="product-moq">Min: ${p.minOrderQty} dona</div>
          </div>
          <div class="product-sku">${p.sku}</div>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  const btn = document.getElementById('loadMoreBtn');
  if (btn) btn.style.display = start + PAGE_SIZE < filteredProducts.length ? 'inline-block' : 'none';
};

const initFilters = () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderProducts(true);
    });
  });

  const lb = document.getElementById('loadMoreBtn');
  lb?.addEventListener('click', () => { productPage++; renderProducts(false); });
};

// ═══════════════════════════════════════════════
// ORDERS TABLE
// ═══════════════════════════════════════════════
const STATUS_LABELS = {
  Delivered: 'Yetkazildi', InTransit: "Yo'lda", Processing: 'Jarayonda',
  Pending: 'Kutilmoqda', Shipped: "Jo'natildi", Cancelled: 'Bekor qilindi',
};

const renderOrders = () => {
  const tbody = document.getElementById('ordersBody');
  if (!tbody) return;

  // Show last 12 orders
  const orders = DB.orders.slice(0, 12);
  tbody.innerHTML = orders.map(o => {
    const item    = o.items?.[0];
    const summary = item ? `${item.name}${o.items.length > 1 ? ` +${o.items.length - 1}` : ''}` : '—';
    const qty     = item?.qty ? ` (${item.qty} dona)` : '';
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.company}</td>
        <td>${summary}${qty}</td>
        <td><strong>$${o.total.toLocaleString()}</strong></td>
        <td><span class="status-pill status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
        <td>${fmtDate(o.date)}</td>
      </tr>`;
  }).join('');

  // Update table meta count
  const meta = document.getElementById('ordersCount');
  if (meta) meta.textContent = `${DB.dashboard.totalOrders.toLocaleString()} jami`;
};

// ═══════════════════════════════════════════════
// PARTNERS
// ═══════════════════════════════════════════════
const renderPartners = () => {
  const grid = document.getElementById('partnersGrid');
  if (!grid) return;

  grid.innerHTML = DB.partners.map(p => {
    const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `
      <div class="partner-card">
        <div class="partner-top">
          <div class="partner-avatar tier-${p.tier}">${initials}</div>
          <span class="partner-tier-badge badge-${p.tier}">${p.tier}</span>
        </div>
        <div class="partner-name">${p.name}</div>
        <div class="partner-city">📍 ${p.city} · ${p.since} dan beri</div>
        <div class="partner-stats">
          <div class="ps-item">
            <div class="ps-item-val">${p.orders}</div>
            <div class="ps-item-lbl">Buyurtma</div>
          </div>
          <div class="ps-item">
            <div class="ps-item-val">$${(p.totalSpent / 1000).toFixed(0)}K</div>
            <div class="ps-item-lbl">Jami xarid</div>
          </div>
        </div>
      </div>`;
  }).join('');
};

// ═══════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════
const initContact = () => {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.textContent = 'Yuborilmoqda...';
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      if (success) success.style.display = 'block';
    }, 1200);
  });
};

// ═══════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════
const initNav = () => {
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => links?.classList.toggle('open'));

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[data-sec]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.sec === sec.id);
        });
      }
    });
  });
};

// Auth modal — crm.js tomonidan boshqariladi (CRM.openAuthModal)

// ═══════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════
const set = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
};

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initFilters();

  try {
    await loadDB();
    renderMetrics();
    renderCharts();
    renderProducts(true);
    renderOrders();
    renderPartners();
    initContact();

    // Update site name from DB meta
    const name = DB.meta?.siteName;
    if (name) {
      document.title = name + ' — B2B Ulgurji Platforma';
    }
  } catch (err) {
    console.error('Database yuklanmadi:', err);
  }
});
