// ============================================================
// RASPBERRY PI – CART.JS
// Warenkorb / Cart / Carrello
// ============================================================
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('pi_cart') || '[]');

  function saveCart() {
    localStorage.setItem('pi_cart', JSON.stringify(cart));
    updateBadge();
    renderCartItems();
  }

  function addToCart(id, name, price, img) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, img, qty: 1 });
    }
    saveCart();
    showCartToast(name);
    openCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else saveCart();
  }

  function totalCount() { return cart.reduce((s, i) => s + i.qty, 0); }
  function totalPrice() { return cart.reduce((s, i) => s + i.qty * i.price, 0); }

  // ── Badge ──────────────────────────────────────────────────
  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(b => {
      const n = totalCount();
      b.textContent = n;
      b.style.display = n > 0 ? 'flex' : 'none';
    });
  }

  // ── Drawer render ──────────────────────────────────────────
  function renderCartItems() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    if (!container) return;

    const lang = document.documentElement.lang || 'de';
    const t = {
      empty: { de: 'Dein Warenkorb ist leer.', en: 'Your cart is empty.', it: 'Il carrello è vuoto.' },
      total: { de: 'Gesamt', en: 'Total', it: 'Totale' },
      checkout: { de: 'Zur Kasse', en: 'Checkout', it: 'Vai alla cassa' },
      clear: { de: 'Leeren', en: 'Clear', it: 'Svuota' },
    };
    const l = (k) => (t[k][lang] || t[k]['de']);

    if (cart.length === 0) {
      container.innerHTML = `<p class="cart-empty">${l('empty')}</p>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = '';

    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img" onerror="this.style.display='none'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">€ ${(item.price * item.qty).toFixed(0)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="Cart.changeQty('${item.id}', -1)">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="Cart.changeQty('${item.id}', 1)">+</button>
          <button class="cart-remove-btn" onclick="Cart.remove('${item.id}')" aria-label="Remove">✕</button>
        </div>
      </div>
    `).join('');

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `€ ${totalPrice().toFixed(0)}`;

    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) checkoutBtn.textContent = l('checkout');

    const clearBtn = document.getElementById('cartClearBtn');
    if (clearBtn) clearBtn.textContent = l('clear');

    const totalLabel = document.getElementById('cartTotalLabel');
    if (totalLabel) totalLabel.textContent = l('total');
  }

  // ── Toast ──────────────────────────────────────────────────
  function showCartToast(name) {
    const lang = document.documentElement.lang || 'de';
    const msgs = {
      de: `🛒 "${name}" wurde hinzugefügt!`,
      en: `🛒 "${name}" added to cart!`,
      it: `🛒 "${name}" aggiunto al carrello!`,
    };
    const msg = msgs[lang] || msgs['de'];
    const toast = document.getElementById('cart-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ── Drawer open/close ──────────────────────────────────────
  function openCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();
    renderCartItems();

    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
    document.getElementById('cartClearBtn')?.addEventListener('click', () => {
      cart = []; saveCart();
    });
    document.getElementById('cartBtn')?.addEventListener('click', () => {
      const drawer = document.getElementById('cartDrawer');
      drawer?.classList.contains('is-open') ? closeCart() : openCart();
    });

    // "Add to cart" buttons
    document.querySelectorAll('[data-cart-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(
          btn.dataset.cartId,
          btn.dataset.cartName,
          parseFloat(btn.dataset.cartPrice),
          btn.dataset.cartImg || ''
        );
      });
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });

  // ── Public API ─────────────────────────────────────────────
  window.Cart = {
    add: addToCart,
    remove: removeFromCart,
    changeQty,
    open: openCart,
    close: closeCart,
  };
})();
