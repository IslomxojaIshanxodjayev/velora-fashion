/* ════════════════════════════════════════════════════════════
   VELORA FASHION — CRM MODULE
   localStorage-based: Auth + Cart + Order History
   ════════════════════════════════════════════════════════════ */

// ── Shared constants (app.js ga bog'liq bo'lmaslik uchun lokal nusxa) ─────
const CRM_EMOJI_MAP = {
  'Ayollar': '👗', 'Erkaklar': '👔', 'Bolalar': '🧒',
  'Sport': '⚽', 'Aksessuar': '👜',
};

// DB ga xavfsiz murojaat: app.js yuklanmagan bo'lsa ham ishdan chiqmaydi
const getDB = () => (typeof DB !== 'undefined' ? DB : null);

// ── Storage keys ─────────────────────────────────────────────
const KEYS = {
  USERS:    'vf_users',
  SESSION:  'vf_session',
  CART:     'vf_cart',
  ORDERS:   'vf_orders',
};

// ── Storage helpers ──────────────────────────────────────────
const store = {
  get:    (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: (k)    => localStorage.removeItem(k),
};

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
const Auth = {
  getUsers()  { return store.get(KEYS.USERS)  || {}; },
  getSession(){ return store.get(KEYS.SESSION) || null; },
  currentUser(){ const s = this.getSession(); return s ? this.getUsers()[s.email] || null : null; },

  register(name, email, password, company) {
    const users = this.getUsers();
    if (users[email]) return { ok: false, msg: 'Bu email allaqachon ro\'yxatdan o\'tgan.' };
    users[email] = { name, email, password: btoa(password), company, createdAt: new Date().toISOString() };
    store.set(KEYS.USERS, users);
    this._startSession(email);
    return { ok: true };
  },

  login(email, password) {
    const users = this.getUsers();
    const user  = users[email];
    if (!user)                       return { ok: false, msg: 'Foydalanuvchi topilmadi.' };
    if (atob(user.password) !== password) return { ok: false, msg: 'Noto\'g\'ri parol.' };
    this._startSession(email);
    return { ok: true };
  },

  logout() {
    store.remove(KEYS.SESSION);
    store.remove(KEYS.CART);
    CRM.updateUI();
  },

  _startSession(email) {
    store.set(KEYS.SESSION, { email, loginAt: new Date().toISOString() });
  },
};

// ════════════════════════════════════════════════════════════
// CART
// ════════════════════════════════════════════════════════════
const Cart = {
  get() { return store.get(KEYS.CART) || []; },
  save(items) { store.set(KEYS.CART, items); CRM.updateCartBadge(); },

  add(product, qty = product.minOrderQty || 1) {
    if (!Auth.currentUser()) { CRM.openAuthModal('login'); showToast('Xarid qilish uchun tizimga kiring', 'warn'); return; }
    const items = this.get();
    const idx   = items.findIndex(i => i.id === product.id);
    if (idx >= 0) { items[idx].qty += qty; }
    else           { items.push({ ...product, qty }); }
    this.save(items);
    showToast(`✓ ${product.name} savatga qo'shildi`);
  },

  remove(productId) {
    this.save(this.get().filter(i => i.id !== productId));
  },

  updateQty(productId, qty) {
    const items = this.get();
    const idx   = items.findIndex(i => i.id === productId);
    if (idx >= 0) { if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty; }
    this.save(items);
  },

  clear() { this.save([]); },

  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },

  checkout() {
    const user  = Auth.currentUser();
    if (!user)  { CRM.openAuthModal('login'); return; }
    const items = this.get();
    if (!items.length) { showToast('Savat bo\'sh', 'warn'); return; }

    const orders   = store.get(KEYS.ORDERS) || {};
    const userOrders = orders[user.email] || [];
    const orderId  = 'ORD-' + Date.now();

    userOrders.unshift({
      id: orderId,
      date: new Date().toISOString(),
      items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: this.total(),
      status: 'Pending',
    });

    orders[user.email] = userOrders;
    store.set(KEYS.ORDERS, orders);
    this.clear();
    CRM.closeCartModal();
    CRM.openProfileModal('orders');
    showToast(`🎉 Buyurtma #${orderId} qabul qilindi!`, 'success');
  },

  getOrders(email) {
    return (store.get(KEYS.ORDERS) || {})[email] || [];
  },
};

// ════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `vf-toast vf-toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
}

// ════════════════════════════════════════════════════════════
// CRM UI CONTROLLER
// ════════════════════════════════════════════════════════════
const CRM = {
  // ── Update navbar based on auth state ──────────────────
  updateUI() {
    const user = Auth.currentUser();
    const loginBtn = document.getElementById('loginBtn');
    const cartBtn  = document.getElementById('cartBtn');
    if (!loginBtn) return;

    if (user) {
      loginBtn.innerHTML = `👤 ${user.name.split(' ')[0]}`;
      loginBtn.onclick = () => this.openProfileModal('profile');
    } else {
      loginBtn.textContent = 'Kirish';
      loginBtn.onclick = () => this.openAuthModal('login');
    }
    this.updateCartBadge();
  },

  updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const c = Cart.count();
    badge.textContent = c;
    badge.style.display = c > 0 ? 'flex' : 'none';
  },

  // ── Auth Modal ─────────────────────────────────────────
  openAuthModal(tab = 'login') {
    const modal = document.getElementById('crmAuthModal');
    if (modal) { modal.classList.add('open'); this.switchAuthTab(tab); }
  },

  closeAuthModal() {
    document.getElementById('crmAuthModal')?.classList.remove('open');
  },

  switchAuthTab(tab) {
    document.querySelectorAll('.crm-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.crm-tab-pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + tab));
    document.getElementById('authError').textContent = '';
  },

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('crmEmail').value.trim();
    const pass  = document.getElementById('crmPass').value;
    const res   = Auth.login(email, pass);
    if (res.ok) { this.closeAuthModal(); this.updateUI(); showToast(`Xush kelibsiz, ${Auth.currentUser().name}!`); }
    else        { document.getElementById('authError').textContent = res.msg; }
  },

  handleRegister(e) {
    e.preventDefault();
    const name    = document.getElementById('regName').value.trim();
    const company = document.getElementById('regCompany').value.trim();
    const email   = document.getElementById('regEmail').value.trim();
    const pass    = document.getElementById('regPass').value;
    const pass2   = document.getElementById('regPass2').value;
    const err     = document.getElementById('authError');

    if (pass !== pass2)   { err.textContent = 'Parollar mos kelmadi.'; return; }
    if (pass.length < 6)  { err.textContent = 'Parol kamida 6 ta belgi bo\'lishi kerak.'; return; }

    const res = Auth.register(name, email, pass, company);
    if (res.ok) { this.closeAuthModal(); this.updateUI(); showToast(`🎉 Ro'yxatdan o'tdingiz, ${name}!`); }
    else        { err.textContent = res.msg; }
  },

  // ── Cart Modal ─────────────────────────────────────────
  openCartModal() {
    if (!Auth.currentUser()) { this.openAuthModal('login'); showToast('Savat uchun tizimga kiring', 'warn'); return; }
    this.renderCart();
    document.getElementById('cartModal')?.classList.add('open');
  },

  closeCartModal() {
    document.getElementById('cartModal')?.classList.remove('open');
  },

  renderCart() {
    const items = Cart.get();
    const body  = document.getElementById('cartBody');
    const totalEl = document.getElementById('cartTotal');
    if (!body) return;

    if (!items.length) {
      body.innerHTML = '<div class="cart-empty">🛒<br>Savat bo\'sh</div>';
      totalEl.textContent = '$0.00';
      return;
    }

    body.innerHTML = items.map(i => `
      <div class="cart-item">
        <div class="cart-item-thumb" style="background:${i.color||'#f3f4f6'}">${CRM_EMOJI_MAP[i.category]||'👕'}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">$${i.price.toFixed(2)} × ${i.qty} = <b>$${(i.price * i.qty).toFixed(2)}</b></div>
        </div>
        <div class="cart-item-actions">
          <button onclick="Cart.updateQty('${i.id}', ${i.qty - 1}); CRM.renderCart()">−</button>
          <span>${i.qty}</span>
          <button onclick="Cart.updateQty('${i.id}', ${i.qty + 1}); CRM.renderCart()">+</button>
          <button class="cart-remove" onclick="Cart.remove('${i.id}'); CRM.renderCart()">🗑</button>
        </div>
      </div>`).join('');

    totalEl.textContent = `$${Cart.total().toFixed(2)}`;
  },

  // ── Profile Modal ──────────────────────────────────────
  openProfileModal(tab = 'profile') {
    const user = Auth.currentUser();
    if (!user) { this.openAuthModal('login'); return; }
    this.renderProfile(user);
    this.renderOrderHistory(user);
    document.getElementById('profileModal')?.classList.add('open');
    this.switchProfileTab(tab);
  },

  closeProfileModal() {
    document.getElementById('profileModal')?.classList.remove('open');
  },

  switchProfileTab(tab) {
    document.querySelectorAll('.prof-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.prof-pane').forEach(p => p.classList.toggle('active', p.id === 'prof-' + tab));
  },

  renderProfile(user) {
    const el = document.getElementById('profileInfo');
    if (!el) return;
    const orders = Cart.getOrders(user.email);
    const totalSpent = orders.reduce((s, o) => s + o.total, 0);
    el.innerHTML = `
      <div class="profile-avatar">${user.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-company">🏢 ${user.company || '—'}</div>
      <div class="profile-email">✉️ ${user.email}</div>
      <div class="profile-stats">
        <div class="ps-stat"><div class="ps-val">${orders.length}</div><div class="ps-lbl">Buyurtmalar</div></div>
        <div class="ps-stat"><div class="ps-val">$${totalSpent.toFixed(0)}</div><div class="ps-lbl">Jami xarid</div></div>
        <div class="ps-stat"><div class="ps-val">${new Date(user.createdAt).toLocaleDateString('uz-UZ')}</div><div class="ps-lbl">Ro'yxat sanasi</div></div>
      </div>`;
  },

  renderOrderHistory(user) {
    const el = document.getElementById('orderHistory');
    if (!el) return;
    const orders = Cart.getOrders(user.email);
    const STATUS_COLORS = { Pending: '#f59e0b', Processing: '#3b82f6', Delivered: '#10b981', Cancelled: '#ef4444' };
    const STATUS_LABELS = { Pending: '⏳ Kutilmoqda', Processing: '⚙️ Jarayonda', Delivered: '✅ Yetkazildi', Cancelled: '❌ Bekor' };

    if (!orders.length) {
      el.innerHTML = '<div class="orders-empty">📦<br>Hali buyurtma yo\'q</div>';
      return;
    }

    el.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card-head">
          <span class="order-id">${o.id}</span>
          <span class="order-status" style="color:${STATUS_COLORS[o.status]||'#6b7280'}">${STATUS_LABELS[o.status]||o.status}</span>
          <span class="order-date">${new Date(o.date).toLocaleDateString('uz-UZ')}</span>
          <span class="order-total"><b>$${o.total.toFixed(2)}</b></span>
        </div>
        <div class="order-items">${o.items.map(i=>`<span>${i.name} ×${i.qty}</span>`).join('')}</div>
      </div>`).join('');
  },
};

// ════════════════════════════════════════════════════════════
// INJECT HTML MODALS + CART BUTTON
// ════════════════════════════════════════════════════════════
function injectCRMHTML() {
  // Cart button in navbar
  const navActions = document.querySelector('.nav-actions');
  if (navActions && !document.getElementById('cartBtn')) {
    const cartBtn = document.createElement('button');
    cartBtn.className = 'btn-ghost cart-btn';
    cartBtn.id = 'cartBtn';
    cartBtn.innerHTML = '🛒 Savat <span class="cart-badge" id="cartBadge" style="display:none">0</span>';
    cartBtn.onclick = () => CRM.openCartModal();
    navActions.insertBefore(cartBtn, navActions.firstChild);
  }

  // Add to cart buttons on product cards (patched after render)
  patchProductCards();

  document.body.insertAdjacentHTML('beforeend', `
  <!-- ══════ CRM AUTH MODAL ══════ -->
  <div class="modal-overlay crm-modal" id="crmAuthModal">
    <div class="modal-box crm-box">
      <div class="modal-header">
        <div class="crm-tabs">
          <button class="crm-tab active" data-tab="login"  onclick="CRM.switchAuthTab('login')">Kirish</button>
          <button class="crm-tab"        data-tab="register" onclick="CRM.switchAuthTab('register')">Ro'yxat</button>
        </div>
        <button class="modal-close" onclick="CRM.closeAuthModal()">✕</button>
      </div>
      <div class="login-error" id="authError"></div>

      <!-- Login pane -->
      <div id="pane-login" class="crm-tab-pane active">
        <form onsubmit="CRM.handleLogin(event)">
          <div class="form-group"><label>Email</label>
            <input type="email" id="crmEmail" placeholder="email@kompaniya.uz" required /></div>
          <div class="form-group"><label>Parol</label>
            <input type="password" id="crmPass" placeholder="Parolingiz" required /></div>
          <button type="submit" class="btn-submit">Kirish →</button>
        </form>
        <div class="login-divider">hali ro'yxatdan o'tmaganmisiz?</div>
        <div style="text-align:center">
          <button class="btn-ghost" onclick="CRM.switchAuthTab('register')" style="width:100%">Ro'yxatdan o'tish →</button>
        </div>
      </div>

      <!-- Register pane -->
      <div id="pane-register" class="crm-tab-pane">
        <form onsubmit="CRM.handleRegister(event)">
          <div class="form-group"><label>To'liq ism</label>
            <input type="text" id="regName" placeholder="Alisher Karimov" required /></div>
          <div class="form-group"><label>Kompaniya nomi</label>
            <input type="text" id="regCompany" placeholder="Karimov Fashion LLC" /></div>
          <div class="form-group"><label>Email</label>
            <input type="email" id="regEmail" placeholder="email@kompaniya.uz" required /></div>
          <div class="form-group"><label>Parol <small>(min 6 belgi)</small></label>
            <input type="password" id="regPass" placeholder="Yangi parol" required /></div>
          <div class="form-group"><label>Parolni tasdiqlang</label>
            <input type="password" id="regPass2" placeholder="Parolni qayta kiriting" required /></div>
          <button type="submit" class="btn-submit">Ro'yxatdan o'tish →</button>
        </form>
      </div>
    </div>
  </div>

  <!-- ══════ CART MODAL ══════ -->
  <div class="modal-overlay crm-modal" id="cartModal">
    <div class="modal-box crm-box cart-modal-box">
      <div class="modal-header">
        <div><h3>🛒 Savat</h3></div>
        <button class="modal-close" onclick="CRM.closeCartModal()">✕</button>
      </div>
      <div id="cartBody" class="cart-body"></div>
      <div class="cart-footer">
        <div class="cart-total-row">
          <span>Jami:</span>
          <span id="cartTotal" class="cart-total-val">$0.00</span>
        </div>
        <button class="btn-submit" onclick="Cart.checkout()">✅ Buyurtma berish</button>
        <button class="btn-ghost" onclick="CRM.closeCartModal()" style="width:100%;margin-top:8px">Davom etish</button>
      </div>
    </div>
  </div>

  <!-- ══════ PROFILE MODAL ══════ -->
  <div class="modal-overlay crm-modal" id="profileModal">
    <div class="modal-box crm-box profile-modal-box">
      <div class="modal-header">
        <div class="crm-tabs">
          <button class="prof-tab active" data-tab="profile" onclick="CRM.switchProfileTab('profile')">👤 Profil</button>
          <button class="prof-tab"        data-tab="orders"  onclick="CRM.switchProfileTab('orders')">📦 Buyurtmalar</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn-ghost" onclick="Auth.logout(); CRM.closeProfileModal();" style="font-size:12px;padding:4px 10px">Chiqish</button>
          <button class="modal-close" onclick="CRM.closeProfileModal()">✕</button>
        </div>
      </div>
      <div id="prof-profile" class="prof-pane active">
        <div id="profileInfo"></div>
      </div>
      <div id="prof-orders" class="prof-pane">
        <div id="orderHistory"></div>
      </div>
    </div>
  </div>
  `);

  // Close old modal logic since we replaced it
  document.getElementById('authModal')?.remove();
  document.getElementById('loginBtn').onclick = () => {
    Auth.currentUser() ? CRM.openProfileModal() : CRM.openAuthModal('login');
  };
}

// Patch product cards to have "Add to cart" button
function patchProductCards() {
  // MutationObserver to catch dynamically rendered cards
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.product-card:not([data-crm])').forEach(card => {
      card.setAttribute('data-crm', '1');
      const footer = card.querySelector('.product-footer');
      if (!footer) return;
      const btn = document.createElement('button');
      btn.className = 'btn-add-cart';
      btn.textContent = '🛒 Qo\'shish';
      btn.onclick = (e) => {
        e.stopPropagation();
        // find product by sku or name
        const sku  = card.querySelector('.product-sku')?.textContent;
        const prod = getDB()?.products?.find(p => p.sku === sku);
        if (prod) Cart.add(prod);
      };
      footer.appendChild(btn);
    });
  });
  const grid = document.getElementById('productsGrid');
  if (grid) observer.observe(grid, { childList: true, subtree: true });
}

// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  injectCRMHTML();
  CRM.updateUI();
});
