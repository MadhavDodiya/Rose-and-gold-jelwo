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
