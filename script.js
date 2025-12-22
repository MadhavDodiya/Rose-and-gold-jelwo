// -----------------------------
// script.js (updated wishlist + cart persistence + rendering)
// -----------------------------

// Defensive helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Storage keys
const STORAGE_WISHLIST = "site_wishlist_v1";
const STORAGE_CART = "site_cart_v1";

// Read/write helpers
function readWishlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_WISHLIST) || "[]");
  } catch (e) {
    return [];
  }
}
function writeWishlist(list) {
  localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(list));
}
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CART) || "[]");
  } catch (e) {
    return [];
  }
}
function writeCart(list) {
  localStorage.setItem(STORAGE_CART, JSON.stringify(list));
}

// Simple currency formatter
function formatCurrency(n) {
  return "₹" + Number(n).toFixed(2);
}

// Build stable id
function buildProductId(title, price, img) {
  return `${String(title || "product").trim().toLowerCase().replace(/\s+/g, "-")}-${price}-${(img || "").split("/").pop()}`;
}

// Extract product data from a product card element
function getProductDataFromCard(card) {
  if (!card) return null;
  const img = card.querySelector("img")?.getAttribute("src") || "";
  const title = card.querySelector(".product-title")?.textContent?.trim() ||
                card.querySelector("h3")?.textContent?.trim() ||
                card.querySelector("p")?.textContent?.trim() ||
                "Product";
  let price = Number(card.dataset.price || 0);
  if (!price) {
    const priceText = card.querySelector(".product-price")?.textContent || "";
    const match = priceText.replace(/,/g, "").match(/([\d.]+)/);
    price = match ? Number(match[0]) : 0;
  }
  const id = card.dataset.id || buildProductId(title, price, img);
  const category = card.dataset.category || "";
  const stock = card.dataset.stock || "in";
  return { id, img, title, price, category, stock };
}

// Add to wishlist (no duplicates)
function addToWishlistItem(item) {
  if (!item || !item.id) return false;
  const list = readWishlist();
  if (list.some(i => i.id === item.id)) {
    flashMessage("Already in wishlist");
    updateCounts();
    return false;
  }
  list.push(item);
  writeWishlist(list);
  flashMessage("Added to wishlist");
  updateCounts();
  // If on wishlist page, re-render
  renderWishlist();
  return true;
}

// Remove from wishlist
function removeFromWishlist(id) {
  let list = readWishlist();
  list = list.filter(i => i.id !== id);
  writeWishlist(list);
  renderWishlist();
  updateCounts();
}

// Add to cart (simple qty increment)
function addToCartItem(item) {
  if (!item || !item.id) return;
  const cart = readCart();
  const existing = cart.find(c => c.id === item.id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ ...item, qty: 1 });
  writeCart(cart);
  flashMessage("Added to cart");
  renderCart();
  updateCounts();
  openCartSidebar();
}

// Remove from cart
function removeFromCart(id) {
  let cart = readCart();
  cart = cart.filter(c => c.id !== id);
  writeCart(cart);
  renderCart();
  updateCounts();
}
function changeCartQty(id, delta) {
  const cart = readCart();
  const it = cart.find(c => c.id === id);
  if (!it) return;
  it.qty = Math.max(1, (it.qty || 1) + delta);
  writeCart(cart);
  renderCart();
  updateCounts();
}

// Small non-blocking flash message
function flashMessage(text, ms = 1200) {
  let el = document.getElementById("__flash_msg");
  if (el) el.remove();
  el = document.createElement("div");
  el.id = "__flash_msg";
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    right: "20px",
    bottom: "80px",
    padding: "10px 14px",
    background: "#111827",
    color: "#fff",
    borderRadius: "8px",
    zIndex: 99999,
    fontSize: "14px",
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// -----------------------------
// Cart sidebar open/close (keeps your existing markup)
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");

function openCartSidebar() {
  cartSidebar?.classList.remove("translate-x-full");
  cartOverlay?.classList.remove("opacity-0", "invisible");
}
function closeSidebar() {
  cartSidebar?.classList.add("translate-x-full");
  cartOverlay?.classList.add("opacity-0", "invisible");
}
openCart?.addEventListener("click", (e) => { e.preventDefault(); openCartSidebar(); });
closeCart?.addEventListener("click", closeSidebar);
cartOverlay?.addEventListener("click", closeSidebar);

// -----------------------------
// Render wishlist on wishlist.html keeping same product-card layout and responsiveness
function renderWishlist() {
  const container = document.getElementById("wishlist");
  const empty = document.getElementById("wishlistEmpty");
  if (!container) return; // not on wishlist page
  const list = readWishlist();
  container.innerHTML = "";
  if (!list.length) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  list.forEach(item => {
    // create the same inner structure as collection card for consistent styling
    const outer = document.createElement("div");
    outer.className = "product border p-3";
    outer.dataset.id = item.id;
    outer.dataset.category = item.category || "";
    outer.dataset.price = item.price || 0;
    outer.dataset.stock = item.stock || "in";

    outer.innerHTML = `
      <img src="${item.img}" class="w-full object-contain">
      <hr class="my-2">
      <p class="text-xs text-center">JEWELRY</p>
      <p class="font-semibold text-center product-title">${item.title}</p>
      <p class="text-center text-sm text-[#b38a6d] product-price">Rs.₹${Number(item.price).toFixed(2)}</p>
      <div class="flex gap-2 mt-2">
        <button class="remove-from-wishlist w-10 h-10 border rounded-full flex items-center justify-center text-red-600" title="Remove">✕</button>
        <button class="add-to-cart flex-1 bg-[#b38a6d] text-white text-xs py-2 rounded-full">ADD TO CART</button>
      </div>
    `;
    container.appendChild(outer);
  });

  // Attach handlers
  container.querySelectorAll(".remove-from-wishlist").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.closest(".product")?.dataset.id;
      if (id) removeFromWishlist(id);
    });
  });
  container.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = btn.closest(".product");
      if (!card) return;
      const data = getProductDataFromCard(card);
      addToCartItem(data);
    });
  });
}

// Render cart sidebar content
function renderCart() {
  const el = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const footer = document.getElementById("cartFooter");
  const subtotalEl = document.getElementById("cartSubtotal");
  if (!el || !emptyEl || !footer || !subtotalEl) return;
  const cart = readCart();
  el.innerHTML = "";
  if (!cart.length) {
    emptyEl.style.display = "flex";
    footer.classList.add("hidden");
    subtotalEl.textContent = formatCurrency(0);
    return;
  }
  emptyEl.style.display = "none";
  footer.classList.remove("hidden");

  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * (item.qty || 1);
    const div = document.createElement("div");
    div.className = "flex items-center gap-3";
    div.innerHTML = `
      <img src="${item.img}" class="w-16 h-16 object-cover border p-1">
      <div class="flex-1">
        <p class="font-medium">${item.title}</p>
        <p class="text-sm text-gray-500">${formatCurrency(item.price)}</p>
        <div class="mt-2 flex items-center gap-2">
          <button class="dec-qty border px-2 py-1" data-id="${item.id}">-</button>
          <span class="px-2">${item.qty}</span>
          <button class="inc-qty border px-2 py-1" data-id="${item.id}">+</button>
        </div>
      </div>
      <div>
        <p class="font-semibold">${formatCurrency(item.price * (item.qty || 1))}</p>
        <button class="remove-from-cart text-sm text-red-500 mt-2" data-id="${item.id}">Remove</button>
      </div>
    `;
    el.appendChild(div);
  });

  subtotalEl.textContent = formatCurrency(subtotal);

  el.querySelectorAll(".remove-from-cart").forEach(btn => btn.addEventListener("click", () => removeFromCart(btn.dataset.id)));
  el.querySelectorAll(".inc-qty").forEach(btn => btn.addEventListener("click", () => changeCartQty(btn.dataset.id, 1)));
  el.querySelectorAll(".dec-qty").forEach(btn => btn.addEventListener("click", () => changeCartQty(btn.dataset.id, -1)));
}

// Update header counts
function updateCounts() {
  const wishlistCountEl = document.getElementById("wishlistCount");
  const cartCountEl = document.getElementById("cartCount");
  const wishlist = readWishlist();
  const cart = readCart();
  const cartQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
  if (cartCountEl) cartCountEl.textContent = cartQty;
}

// Attach add-to-wishlist & add-to-cart handlers site-wide (collection page cards and any other product card markup)
function attachProductButtons(root = document) {
  $$(".add-to-wishlist", root).forEach(btn => {
    btn.removeEventListener("click", btn.__wishHandler?.fn);
    const handler = (e) => {
      e.preventDefault();
      const card = btn.closest(".product");
      const data = getProductDataFromCard(card);
      if (data) addToWishlistItem(data);
    };
    btn.addEventListener("click", handler);
    btn.__wishHandler = { fn: handler };
  });

  $$(".add-to-cart", root).forEach(btn => {
    btn.removeEventListener("click", btn.__cartHandler?.fn);
    const handler = (e) => {
      e.preventDefault();
      const card = btn.closest(".product");
      const data = getProductDataFromCard(card);
      if (data) addToCartItem(data);
    };
    btn.addEventListener("click", handler);
    btn.__cartHandler = { fn: handler };
  });
}

// Initialize (attach handlers and render if on wishlist page)
document.addEventListener("DOMContentLoaded", () => {
  attachProductButtons(document);
  renderWishlist();
  renderCart();
  updateCounts();
});

// In case scripts load later
window.addEventListener("load", () => {
  attachProductButtons(document);
  renderWishlist();
  renderCart();
  updateCounts();
});

// Note: this file only adds wishlist/cart persistence + rendering logic.
// It intentionally preserves your existing markup and styles so wishlist cards use the same classes and remain responsive.