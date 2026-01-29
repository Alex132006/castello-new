document.addEventListener("DOMContentLoaded", function () {
  // Éléments du DOM
  const track = document.querySelector(".promotion-track");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".indicator-dot");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const currentSlideElement = document.getElementById("current-slide");
  const totalSlidesElement = document.getElementById("total-slides");

  let currentSlide = 0;
  let autoSlideInterval;
  const slideDuration = 5000; // 5 secondes
  const totalSlides = slides.length;

  // Initialisation
  totalSlidesElement.textContent = totalSlides;

  // Fonction pour mettre à jour l'affichage
  function updateCarousel() {
    // Déplacement de la piste
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Mise à jour des points indicateurs
    dots.forEach((dot, index) => {
      dot.classList.toggle("active-dot", index === currentSlide);
    });

    // Mise à jour de l'indicateur
    currentSlideElement.textContent = currentSlide + 1;
  }

  // Fonction pour passer à la slide suivante
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  // Fonction pour passer à la slide précédente
  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  // Démarrage du défilement automatique
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, slideDuration);
  }

  // Arrêt du défilement automatique
  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Événements
  nextBtn.addEventListener("click", function () {
    nextSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  prevBtn.addEventListener("click", function () {
    prevSlide();
    stopAutoSlide();
    startAutoSlide();
  });

  // Navigation par points
  dots.forEach((dot) => {
    dot.addEventListener("click", function () {
      const slideIndex = parseInt(this.getAttribute("data-slide"));
      currentSlide = slideIndex;
      updateCarousel();
      stopAutoSlide();
      startAutoSlide();
    });
  });

  // Pause au survol
  document
    .querySelector(".promo-rotation-container")
    .addEventListener("mouseenter", stopAutoSlide);
  document
    .querySelector(".promo-rotation-container")
    .addEventListener("mouseleave", startAutoSlide);

  // Support du swipe tactile
  let touchStartX = 0;
  let touchEndX = 0;

  document
    .querySelector(".promotion-track")
    .addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    });

  document
    .querySelector(".promotion-track")
    .addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;

      if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
      }

      if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
      }

      startAutoSlide();
    });

  // Initialisation
  updateCarousel();
  startAutoSlide();

  // Redirection des boutons "Наши акции"
  document.querySelectorAll(".action-primary").forEach((button) => {
    button.addEventListener("click", function () {
      const target = this.getAttribute("value");
      if (target) {
        alert(`Redirection vers: ${target}`);
        // Pour une vraie redirection :
        // window.location.hash = target;
      }
    });
  });

  // Action pour les boutons "в корзину"
  document.querySelectorAll(".action-secondary").forEach((button) => {
    button.addEventListener("click", function () {
      alert("Товар добавлен в корзину!");
    });
  });
});
