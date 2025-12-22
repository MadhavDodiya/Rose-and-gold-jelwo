// Mobile Menu Toggle
document.getElementById("navToggle").addEventListener("click", () => {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("hidden");
});

document.querySelectorAll(".dropdown").forEach((item) => {
  item.addEventListener("click", function () {
    const menu = this.querySelector(".dropdown-menu");
    menu.classList.toggle("hidden");
  });
});

// swiper js
new Swiper(".mySwiper", {
  loop: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  speed: 800
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
    640: {   // tablet
      slidesPerView: 2,
      spaceBetween: 20,
    },
    1024: {  // laptop & PC
      slidesPerView: 3,
      spaceBetween: 24,
    }
  }
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

//   top button
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.classList.remove("hidden");
    backToTop.classList.add("flex");
  } else {
    backToTop.classList.add("hidden");
    backToTop.classList.remove("flex");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// sidebar
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');

openCart.addEventListener('click', () => {
  cartSidebar.classList.remove('translate-x-full');
  cartOverlay.classList.remove('opacity-0', 'invisible');
});

closeCart.addEventListener('click', closeSidebar);
cartOverlay.addEventListener('click', closeSidebar);

function closeSidebar() {
  cartSidebar.classList.add('translate-x-full');
  cartOverlay.classList.add('opacity-0', 'invisible');
}

// collection page js
document.addEventListener("DOMContentLoaded", () => {
  const products = document.querySelectorAll(".product");

  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");
  const resetPrice = document.getElementById("resetPrice");

  const categoryChecks = document.querySelectorAll(".category-filter");
  const stockChecks = document.querySelectorAll(".stock-filter");
  const wishlistContainer = document.getElementById("wishlist");

  function applyFilters() {
    const maxPrice = Number(priceRange.value || Infinity);
    priceValue.textContent = maxPrice;

    const activeCategories = [...categoryChecks]
      .filter(c => c.checked)
      .map(c => c.value);

    const activeStock = [...stockChecks]
      .filter(s => s.checked)
      .map(s => s.value);

    products.forEach(product => {
      const price = Number(product.dataset.price);
      const categories = product.dataset.category.split(","); // split by comma
      const stock = product.dataset.stock;

      const priceMatch = price <= maxPrice;

      const categoryMatch =
        activeCategories.length === 0 ||
        activeCategories.some(c => categories.includes(c));

      const stockMatch =
        activeStock.length === 0 ||
        activeStock.includes(stock);

      const show = priceMatch && categoryMatch && stockMatch;

      product.classList.toggle("hidden", !show);
    });
  }

  // Price filter
  priceRange?.addEventListener("input", applyFilters);
  resetPrice?.addEventListener("click", () => {
    priceRange.value = priceRange.max;
    applyFilters();
  });

  // Category & Stock filters
  categoryChecks.forEach(c => c.addEventListener("change", applyFilters));
  stockChecks.forEach(s => s.addEventListener("change", applyFilters));

  // Add to Wishlist
  products.forEach(product => {
    const btn = product.querySelector(".add-to-wishlist");
    btn.addEventListener("click", () => {
      const cloned = product.cloneNode(true);
      cloned.querySelector(".add-to-wishlist").remove(); // remove button in wishlist
      wishlistContainer.appendChild(cloned);
      alert("Product added to wishlist!");
    });
  });

  applyFilters(); // initial filter
});






