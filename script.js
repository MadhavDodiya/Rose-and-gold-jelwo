// Mobile Menu Toggle
document.getElementById("navToggle")?.addEventListener("click", () => {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("hidden");
});

document.querySelectorAll(".dropdown").forEach((item) => {
  item.addEventListener("click", function () {
    const menu = this.querySelector(".dropdown-menu");
    if (menu) menu.classList.toggle("hidden");
  });
});

// swiper js
if (typeof Swiper !== "undefined") {
  new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    speed: 800,
  });

  // categorySwiper
  new Swiper(".autoSwiper", {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
  });

  new Swiper(".productSwiper", {
    loop: true,
    spaceBetween: 20,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 4 },
    },
  });
}

//   top button
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (!backToTop) return;
  if (window.scrollY > 300) {
    backToTop.classList.remove("hidden");
    backToTop.classList.add("flex");
  } else {
    backToTop.classList.add("hidden");
    backToTop.classList.remove("flex");
  }
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// sidebar
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");

openCart?.addEventListener("click", () => {
  openCartSidebar();
});

closeCart?.addEventListener("click", closeSidebar);
cartOverlay?.addEventListener("click", closeSidebar);

function openCartSidebar() {
  cartSidebar?.classList.remove("translate-x-full");
  cartOverlay?.classList.remove("opacity-0", "invisible");
}

function closeSidebar() {
  cartSidebar?.classList.add("translate-x-full");
  cartOverlay?.classList.add("opacity-0", "invisible");
}

// --- Cart & Wishlist Logic (localStorage backed) ---
const STORAGE_WISHLIST = "site_wishlist_v1";
const STORAGE_CART = "site_cart_v1";

function readWishlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_WISHLIST) || "[]");
  } catch (e) {
    return [];
  }
}
function writeWishlist(items) {
  localStorage.setItem(STORAGE_WISHLIST, JSON.stringify(items));
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_CART) || "[]");
  } catch (e) {
    return [];
  }
}
function writeCart(items) {
  localStorage.setItem(STORAGE_CART, JSON.stringify(items));
}

function getProductDataFromCard(productEl) {
  const img = productEl.querySelector("img")?.getAttribute("src") || "";
  const title = productEl.querySelector(".product-title")?.textContent?.trim() || productEl.querySelector("p")?.textContent?.trim() || "Product";
  // price attribute might be in dataset or in DOM
  let price = Number(productEl.dataset.price);
  if (!price) {
    // attempt to parse from .product-price text like Rs.₹28.00
    const priceText = productEl.querySelector(".product-price")?.textContent || "";
    const matches = priceText.replace(/,/g, "").match(/([\d.]+)/);
    price = matches ? Number(matches[0]) : 0;
  }
  // generate an id using name + price + img (simple)
  const id = productEl.dataset.id || `${title.replace(/\s+/g, "-").toLowerCase()}-${price}-${img}`;
  return { id, title, price, img };
}

function addToWishlistItem(item) {
  const list = readWishlist();
  // avoid duplicates by id
  if (list.some((i) => i.id === item.id)) {
    // optionally notify
    alert("Already in wishlist");
    return false;
  }
  list.push(item);
  writeWishlist(list);
  renderWishlist();
  updateCounts();
  alert("Added to wishlist");
  return true;
}

function removeFromWishlist(id) {
  let list = readWishlist();
  list = list.filter((i) => i.id !== id);
  writeWishlist(list);
  renderWishlist();
  updateCounts();
}

function addToCartItem(item) {
  const cart = readCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  writeCart(cart);
  renderCart();
  updateCounts();
  // open cart automatically
  openCartSidebar();
}

function removeFromCart(id) {
  let cart = readCart();
  cart = cart.filter((c) => c.id !== id);
  writeCart(cart);
  renderCart();
  updateCounts();
}

function changeCartQty(id, delta) {
  const cart = readCart();
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, (item.qty || 1) + delta);
  writeCart(cart);
  renderCart();
  updateCounts();
}

function formatCurrency(n) {
  // simple rupee format
  return "₹" + Number(n).toFixed(2);
}

function renderWishlist() {
  const el = document.getElementById("wishlist");
  const emptyEl = document.getElementById("wishlistEmpty");
  if (!el) return;
  const list = readWishlist();
  el.innerHTML = "";
  if (!list.length) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";
  list.forEach((item) => {
    const div = document.createElement("div");
    div.className = "border p-3 flex items-center gap-4";
    div.innerHTML = `
      <img src="${item.img}" class="w-24 h-24 object-cover">
      <div class="flex-1">
        <p class="font-semibold">${item.title}</p>
        <p class="text-[#b38a6d]">${formatCurrency(item.price)}</p>
      </div>
      <div class="flex flex-col gap-2">
        <button class="remove-from-wishlist bg-red-100 text-red-600 px-3 py-1 rounded" data-id="${item.id}">Remove</button>
        <button class="add-to-cart-from-wishlist bg-[#b38a6d] text-white px-3 py-1 rounded" data-id="${item.id}">Add to cart</button>
      </div>
    `;
    el.appendChild(div);
  });

  // attach events
  el.querySelectorAll(".remove-from-wishlist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      removeFromWishlist(id);
    });
  });
  el.querySelectorAll(".add-to-cart-from-wishlist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const item = readWishlist().find((i) => i.id === id);
      if (item) {
        addToCartItem(item);
      }
    });
  });
}

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
  cart.forEach((item) => {
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

  // attach events
  el.querySelectorAll(".remove-from-cart").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
  el.querySelectorAll(".inc-qty").forEach((btn) => {
    btn.addEventListener("click", () => changeCartQty(btn.dataset.id, 1));
  });
  el.querySelectorAll(".dec-qty").forEach((btn) => {
    btn.addEventListener("click", () => changeCartQty(btn.dataset.id, -1));
  });
}

function updateCounts() {
  const wishlistCountEl = document.getElementById("wishlistCount");
  const cartCountEl = document.getElementById("cartCount");
  const wishlist = readWishlist();
  const cart = readCart();
  const cartQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
  if (cartCountEl) cartCountEl.textContent = cartQty;
}

// collection page js and product filter logic
document.addEventListener("DOMContentLoaded", () => {
  // existing collection filtering code preserved:
  const products = document.querySelectorAll(".product");

  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  const resetPrice = document.getElementById("resetPrice");

  const categoryChecks = document.querySelectorAll(".category-filter");
  const stockChecks = document.querySelectorAll(".stock-filter");

  function applyFilters() {
    const maxPrice = Number(priceRange?.value || Infinity);
    if (priceValue) priceValue.textContent = maxPrice;

    const activeCategories = [...categoryChecks]
      .filter((c) => c.checked)
      .map((c) => c.value);

    const activeStock = [...stockChecks]
      .filter((s) => s.checked)
      .map((s) => s.value);

    products.forEach((product) => {
      const price = Number(product.dataset.price);
      const categories = (product.dataset.category || "").split(","); // split by comma
      const stock = product.dataset.stock;

      const priceMatch = price <= maxPrice;

      const categoryMatch =
        activeCategories.length === 0 ||
        activeCategories.some((c) => categories.includes(c));

      const stockMatch =
        activeStock.length === 0 || activeStock.includes(stock);

      const show = priceMatch && categoryMatch && stockMatch;

      product.classList.toggle("hidden", !show);
    });
  }

  // Price filter
  priceRange?.addEventListener("input", applyFilters);
  resetPrice?.addEventListener("click", () => {
    if (priceRange) priceRange.value = priceRange.max;
    applyFilters();
  });

  // Category & Stock filters
  categoryChecks.forEach((c) => c.addEventListener("change", applyFilters));
  stockChecks.forEach((s) => s.addEventListener("change", applyFilters));

  // Attach wishlist / cart button handlers to product cards
  products.forEach((product) => {
    // add-to-wishlist button
    const wishlistBtn = product.querySelector(".add-to-wishlist");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const data = getProductDataFromCard(product);
        addToWishlistItem(data);
      });
    }
    // add-to-cart button
    const cartBtn = product.querySelector(".add-to-cart");
    if (cartBtn) {
      cartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const data = getProductDataFromCard(product);
        addToCartItem(data);
      });
    }
  });

  // wishlist page render
  renderWishlist();

  // cart render
  renderCart();

  updateCounts();
});

// Also initialize counts/render when navigating to other pages
window.addEventListener("load", () => {
  renderWishlist();
  renderCart();
  updateCounts();
});