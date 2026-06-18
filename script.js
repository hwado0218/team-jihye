const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const siteHeader = document.querySelector(".site-header");
const year = document.querySelector("#year");
const galleryButtons = document.querySelectorAll(".gallery-thumb");
const lightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const phoneReveal = document.querySelector(".phone-reveal");
const phoneNumber = document.querySelector("#manager-phone");
const galleryItems = Array.from(galleryButtons).map((button) => ({
  full: button.dataset.full,
  caption: button.dataset.caption || ""
}));
let currentGalleryIndex = 0;
let swipeStartX = 0;
let swipeStartY = 0;
let lastSwipeAt = 0;

if (year) {
  year.textContent = new Date().getFullYear();
}

const syncHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "메뉴 열기");
    }
  });
}

if (phoneReveal && phoneNumber) {
  phoneReveal.addEventListener("click", () => {
    const isOpen = phoneReveal.getAttribute("aria-expanded") === "true";
    const phone = phoneReveal.dataset.phone || "";

    phoneReveal.setAttribute("aria-expanded", String(!isOpen));
    phoneNumber.hidden = isOpen;
    phoneNumber.textContent = isOpen ? "" : phone;
  });
}

if (lightbox && lightboxImage && lightboxCaption) {
  const showGalleryItem = (index) => {
    if (!galleryItems.length) return;

    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentGalleryIndex];
    if (!item.full) return;

    lightboxImage.src = item.full;
    lightboxImage.alt = item.caption;
    lightboxCaption.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length} · ${item.caption}`;
  };

  const showNextGalleryItem = () => showGalleryItem(currentGalleryIndex + 1);
  const showPrevGalleryItem = () => showGalleryItem(currentGalleryIndex - 1);

  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const full = button.dataset.full;
      if (!full) return;

      showGalleryItem(index);

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
    });
  });

  lightboxClose?.addEventListener("click", () => {
    lightbox.close();
  });

  lightboxPrev?.addEventListener("click", showPrevGalleryItem);
  lightboxNext?.addEventListener("click", showNextGalleryItem);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  const startSwipe = (clientX, clientY) => {
    swipeStartX = clientX;
    swipeStartY = clientY;
  };

  const finishSwipe = (clientX, clientY) => {
    const deltaX = clientX - swipeStartX;
    const deltaY = clientY - swipeStartY;

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
      return;
    }

    if (Date.now() - lastSwipeAt < 250) {
      return;
    }

    lastSwipeAt = Date.now();

    if (deltaX < 0) {
      showNextGalleryItem();
    } else {
      showPrevGalleryItem();
    }
  };

  lightbox.addEventListener("pointerdown", (event) => {
    startSwipe(event.clientX, event.clientY);
  });

  lightbox.addEventListener("pointerup", (event) => {
    finishSwipe(event.clientX, event.clientY);
  }, { passive: true });

  lightbox.addEventListener("mousedown", (event) => {
    startSwipe(event.clientX, event.clientY);
  });

  lightbox.addEventListener("mouseup", (event) => {
    finishSwipe(event.clientX, event.clientY);
  });

  lightbox.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    startSwipe(touch.clientX, touch.clientY);
  }, { passive: true });

  lightbox.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    finishSwipe(touch.clientX, touch.clientY);
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;

    if (event.key === "ArrowRight") {
      showNextGalleryItem();
    }

    if (event.key === "ArrowLeft") {
      showPrevGalleryItem();
    }
  });

  lightbox.addEventListener("close", () => {
    lightboxImage.removeAttribute("src");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  syncHeaderState();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

window.addEventListener("scroll", syncHeaderState, { passive: true });
