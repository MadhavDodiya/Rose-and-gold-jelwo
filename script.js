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


