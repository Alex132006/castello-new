// =============================================
// LOADING SCREEN - Экран загрузки (показывается один раз)
// =============================================
window.addEventListener("load", function () {
  if (!localStorage.getItem("hasSeenLoading")) {
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loading-screen";
    loadingScreen.innerHTML = `
            <div class="loading-content">
                <img src="image copy.png" alt="Логотип Кафе Кастелло Пан Африка" 
                     class="loading-logo" 
                     onload="this.style.opacity = '1'">
                <div class="loading-text">
                    <h2>добро пожаловать</h2>
                    <h3>В</h3>
                    <h1>Кастелло Пан Африка</h1>
                </div>
                <div class="spinner"></div>
                <p class="loading-status">Загрузка меню...</p>
            </div>
        `;

    loadingScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #442d0a 0%, #d4af37 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Playfair Display', Georgia, serif;
            text-align: center;
            opacity: 1;
            transition: opacity 0.5s ease-out;
        `;

    document.body.appendChild(loadingScreen);

    // Предзагрузка критических изображений
    const criticalImages = [
      "image copy.png",
      // Добавьте другие важные изображения
    ];

    // Счетчик загруженных ресурсов
    let resourcesLoaded = 0;
    const images = document.querySelectorAll("img");
    const totalImages = Math.max(1, images.length);

    // Обновление статуса загрузки
    function updateLoadingStatus() {
      resourcesLoaded++;
      const percent = Math.min(
        95,
        Math.round((resourcesLoaded / totalImages) * 100)
      );
      const statusEl = document.querySelector(".loading-status");
      if (statusEl) {
        statusEl.textContent = `Загрузка... ${percent}%`;
      }
    }

    // Отслеживание загрузки изображений
    images.forEach((img) => {
      if (img.complete) {
        updateLoadingStatus();
      } else {
        img.addEventListener("load", updateLoadingStatus);
        img.addEventListener("error", updateLoadingStatus); // Даже при ошибке считаем загруженным
      }
    });

    // Минимальное время показа экрана загрузки - 3 секунды
    setTimeout(function () {
      loadingScreen.style.opacity = "0";
      setTimeout(function () {
        loadingScreen.remove();
        localStorage.setItem("hasSeenLoading", "true");
      }, 500);
    }, 3000);
  }
});

// =============================================
// GLOBAL VARIABLES - Глобальные переменные
// =============================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let favoritesCache = null;
let isFavoriteCache = new Map();

// =============================================
// UTILITY FUNCTIONS - Вспомогательные функции
// =============================================

// Дебаунс для оптимизации производительности
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Безопасное получение текста
function safeGetText(element, selector) {
  try {
    const el = element.querySelector(selector);
    return el ? el.textContent.trim() : "";
  } catch (error) {
    console.warn("Не удалось получить текст:", error);
    return "";
  }
}

// Безопасное получение атрибута
function safeGetAttribute(element, selector, attribute) {
  try {
    const el = element.querySelector(selector);
    return el ? el.getAttribute(attribute) : "";
  } catch (error) {
    console.warn("Не удалось получить атрибут:", error);
    return "";
  }
}

// Показать уведомление
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "15px 20px",
    background:
      type === "error" ? "#ff4444" : type === "warning" ? "#ff9800" : "#4CAF50",
    color: "white",
    borderRadius: "4px",
    zIndex: "10000",
    animation: "slideIn 0.3s ease-out",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: "14px",
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// =============================================
// CART MANAGEMENT - Управление корзиной
// =============================================

// Сохранение корзины
function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartLastUpdated", new Date().toISOString());
  } catch (error) {
    console.error("Ошибка сохранения корзины:", error);
    showNotification("Ошибка сохранения корзины", "error");
  }
}

// Добавление в корзину
function addToCart(name, price, quantity = 1, image) {
  try {
    // Нормализация данных
    const normalizedName = name.trim();
    const priceMatch = price.toString().match(/(\d[\d\s]*)/);
    const priceValue = priceMatch
      ? parseInt(priceMatch[0].replace(/\s/g, ""))
      : 0;

    // Проверка существующего товара
    const existingIndex = cart.findIndex(
      (item) => item.name.trim() === normalizedName && item.price === priceValue
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].updatedAt = new Date().toISOString();
    } else {
      cart.push({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: normalizedName,
        price: priceValue,
        quantity: quantity,
        image: image || "",
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Сохранение и обновление
    saveCart();
    updateCartCounter();
    updateCartDisplay();

    // Уведомление
    showNotification(`${normalizedName} добавлен в корзину!`);

    return true;
  } catch (error) {
    console.error("Ошибка при добавлении в корзину:", error);
    showNotification("Ошибка при добавлении товара", "error");
    return false;
  }
}

// Удаление из корзины
function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartCounter();
    updateCartDisplay();
    showNotification(`${itemName} удален из корзины`);
  }
}

// Обновление счетчика корзины
function updateCartCounter() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounter = document.getElementById("cart-count");
  if (cartCounter) {
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? "flex" : "none";
  }
}

// Дебаунсированное обновление счетчика
const updateCartCounterDebounced = debounce(updateCartCounter, 100);

// =============================================
// FAVORITES MANAGEMENT - Управление избранным
// =============================================

// Загрузка избранного
function loadFavorites() {
  if (favoritesCache) return favoritesCache;

  try {
    const stored = localStorage.getItem("favorites");
    favorites = stored ? JSON.parse(stored) : [];
    favoritesCache = [...favorites];
    return favorites;
  } catch (error) {
    console.error("Ошибка загрузки избранного:", error);
    return [];
  }
}

// Проверка избранного
function isFavorite(name) {
  const normalizedName = name.trim();
  if (isFavoriteCache.has(normalizedName)) {
    return isFavoriteCache.get(normalizedName);
  }

  const result = favorites.some((item) => item.name.trim() === normalizedName);
  isFavoriteCache.set(normalizedName, result);
  return result;
}

// Добавление в избранное
function addToFavorites(name, price, image) {
  const normalizedName = name.trim();
  const priceMatch = price.toString().match(/(\d[\d\s]*)/);
  const priceValue = priceMatch
    ? parseInt(priceMatch[0].replace(/\s/g, ""))
    : 0;

  if (!isFavorite(normalizedName)) {
    favorites.push({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: normalizedName,
      price: priceValue,
      image: image || "",
      addedAt: new Date().toISOString(),
    });

    updateFavorites();
    showNotification(`${normalizedName} добавлен в избранное`);
    return true;
  }
  return false;
}

// Удаление из избранного
function removeFromFavorites(name) {
  const normalizedName = name.trim();
  const initialLength = favorites.length;
  favorites = favorites.filter((item) => item.name.trim() !== normalizedName);

  if (favorites.length < initialLength) {
    updateFavorites();
    showNotification(`${normalizedName} удален из избранного`);
    return true;
  }
  return false;
}

// Обновление избранного
function updateFavorites() {
  favoritesCache = null;
  isFavoriteCache.clear();
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesDisplay();
    initializeFavoriteIcons();
  } catch (error) {
    console.error("Ошибка обновления избранного:", error);
  }
}

// =============================================
// INITIALIZATION - Инициализация
// =============================================
document.addEventListener("DOMContentLoaded", function () {
  // Инициализация корзины
  updateCartCounter();

  // Инициализация избранного
  loadFavorites();
  initializeFavoriteIcons();

  // Кнопка корзины в header
  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", toggleCart);
  }

  // Инициализация кликов на изображения
  initializeImageClickEvents();

  // Инициализация кнопок "В корзину"
  initializeAddToCartButtons();

  // Инициализация плавной прокрутки
  initializeSmoothScroll();

  // Инициализация модальных окон
  initializeModals();

  // Инициализация куки-баннера
  initializeCookieBanner();

  // Ленивая загрузка изображений
  initializeLazyLoading();
});

// =============================================
// EVENT HANDLERS - Обработчики событий
// =============================================

// Инициализация кнопок "В корзину"
function initializeAddToCartButtons() {
  // Кнопки в меню
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const menuItem = this.closest(".menu-item");
      const name = safeGetText(menuItem, ".item-title");
      const price = safeGetText(menuItem, ".montant");
      const image = safeGetAttribute(menuItem, "img", "src");

      if (addToCart(name, price, 1, image)) {
        // Анимация подтверждения
        const originalHTML = this.innerHTML;
        this.innerHTML = "✓ Добавлено";
        this.style.background =
          "linear-gradient(135deg, hsla(120, 59%, 50%, 0.8), hsla(120, 59%, 40%, 0.8))";

        setTimeout(() => {
          this.innerHTML = originalHTML;
          this.style.background =
            "linear-gradient(135deg, hsla(62, 59%, 40%, 0.70), hsla(61, 62%, 62%, 0.70))";
        }, 1500);
      }
    });
  });

  // Кнопки в карусели
  document.querySelectorAll(".carousel-slide .btn").forEach((button) => {
    if (button.textContent.includes("корзину")) {
      button.addEventListener("click", function (e) {
        e.stopPropagation();
        const slide = this.closest(".carousel-slide");
        const name = safeGetText(slide, "h4");
        const priceText = safeGetText(slide, ".price");
        const price = priceText.replace("₽", "").trim() + "₽";
        const image = safeGetAttribute(slide, "img", "src");

        if (addToCart(name, price, 1, image)) {
          const originalText = this.textContent;
          this.textContent = "✓ Добавлено!";
          this.style.background =
            "linear-gradient(135deg, hsla(120, 59%, 50%, 0.8), hsla(120, 59%, 40%, 0.8))";

          setTimeout(() => {
            this.textContent = originalText;
            this.style.background = "";
          }, 1500);
        }
      });
    }
  });
}

// Инициализация иконок избранного
function initializeFavoriteIcons() {
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const menuItem = btn.closest(".menu-item");
    if (!menuItem) return;

    const name = safeGetText(menuItem, ".item-title");
    const icon = btn.querySelector("i");

    if (isFavorite(name)) {
      btn.classList.add("active");
      icon.classList.remove("far");
      icon.classList.add("fas");
    } else {
      btn.classList.remove("active");
      icon.classList.remove("fas");
      icon.classList.add("far");
    }

    // Обработчик клика
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const menuItem = this.closest(".menu-item");
      const name = safeGetText(menuItem, ".item-title");
      const price = safeGetText(menuItem, ".montant");
      const image = safeGetAttribute(menuItem, "img", "src");

      if (this.classList.contains("active")) {
        // Удалить из избранного
        removeFromFavorites(name);
        this.classList.remove("active");
        icon.classList.remove("fas");
        icon.classList.add("far");
      } else {
        // Добавить в избранное
        if (addToFavorites(name, price, image)) {
          this.classList.add("active");
          icon.classList.remove("far");
          icon.classList.add("fas");
        }
      }
    });
  });
}

// Инициализация кликов на изображения
function initializeImageClickEvents() {
  document.querySelectorAll(".menu-item img").forEach((img) => {
    img.style.cursor = "pointer";

    img.addEventListener("click", function (e) {
      e.stopPropagation();
      const menuItem = this.closest(".menu-item");
      openProductModal(menuItem);
    });
  });

  // Предотвращение открытия модального окна при клике на кнопки
  document
    .querySelectorAll(".add-to-cart-btn, .favorite-btn")
    .forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });

  // Резервный обработчик для всего элемента меню
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (
        !e.target.closest(".add-to-cart-btn") &&
        !e.target.closest(".favorite-btn") &&
        e.target.tagName !== "IMG"
      ) {
        openProductModal(this);
      }
    });
  });
}

// Инициализация плавной прокрутки
function initializeSmoothScroll() {
  document.querySelectorAll("nav a, .btn").forEach((anchor) => {
    if (anchor.getAttribute("href")?.startsWith("#")) {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    }
  });

  // Навигационный select
  const choixSelect = document.getElementById("choix");
  if (choixSelect) {
    choixSelect.addEventListener("change", function () {
      const targetId = this.value;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  }
}

// =============================================
// MODAL WINDOWS - Модальные окна
// =============================================

// Инициализация модальных окон
function initializeModals() {
  // Events Modal
  const eventsModal = document.getElementById("eventsModal");
  const eventsBtn = document.getElementById("eventsBtn");
  const eventsClose = eventsModal?.querySelector(".close-btn");

  if (eventsBtn && eventsModal) {
    eventsBtn.onclick = function () {
      eventsModal.style.display = "block";
      document.body.style.overflow = "hidden";
    };

    if (eventsClose) {
      eventsClose.onclick = function () {
        eventsModal.style.display = "none";
        document.body.style.overflow = "";
      };
    }

    window.addEventListener("click", function (event) {
      if (event.target == eventsModal) {
        eventsModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  // Food Details Modal
  const foodModal = document.getElementById("foodModal");
  const foodClose = foodModal?.querySelector(".close-btn");

  if (foodModal && foodClose) {
    foodClose.onclick = function () {
      foodModal.style.display = "none";
      document.body.style.overflow = "";
    };

    window.addEventListener("click", function (event) {
      if (event.target == foodModal) {
        foodModal.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  // Обработчик добавления в корзину из модального окна
  const addToCartModalBtn = document.getElementById("addToCartModal");
  if (addToCartModalBtn) {
    addToCartModalBtn.addEventListener("click", function () {
      const title =
        document.getElementById("mainProductTitle")?.textContent || "";
      const price =
        document.getElementById("mainProductPrice")?.textContent || "";
      const image = document.getElementById("mainProductImage")?.src || "";

      if (addToCart(title, price, 1, image)) {
        foodModal.style.display = "none";
        document.body.style.overflow = "";

        // Анимация кнопки
        this.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
        this.style.background =
          "linear-gradient(135deg, hsla(120, 59%, 50%, 0.8), hsla(120, 59%, 40%, 0.8))";

        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-shopping-cart"></i> В корзину';
          this.style.background =
            "linear-gradient(135deg, #d4af37 0%, #b8952c 100%)";
        }, 1500);
      }
    });
  }
}

// Открытие модального окна продукта
function openProductModal(menuItem) {
  const foodModal = document.getElementById("foodModal");
  if (!foodModal) return;

  const image = safeGetAttribute(menuItem, "img", "src");
  const title = safeGetText(menuItem, ".item-title");
  const priceElement =
    menuItem.querySelector(".montant") || menuItem.querySelector(".item-price");
  const price = priceElement ? priceElement.textContent : "Цена не указана";

  // Заполнение основного продукта
  const mainImage = document.getElementById("mainProductImage");
  const mainTitle = document.getElementById("mainProductTitle");
  const mainPrice = document.getElementById("mainProductPrice");

  if (mainImage) mainImage.src = image;
  if (mainTitle) mainTitle.textContent = title;
  if (mainPrice) mainPrice.textContent = price;

  // Получение связанных продуктов
  const sectionId = getSectionFromMenuItem(menuItem);
  const relatedItems = getMenuItemsFromSection(sectionId).filter(
    (item) => item !== menuItem
  );

  const relatedProductsList = document.getElementById("relatedProductsList");
  if (relatedProductsList) {
    relatedProductsList.innerHTML = "";

    // Показываем до 15 связанных продуктов
    relatedItems.slice(0, 15).forEach((item) => {
      const relatedImage = safeGetAttribute(item, "img", "src");
      const relatedTitle = safeGetText(item, ".item-title");
      const relatedPriceElement =
        item.querySelector(".montant") || item.querySelector(".item-price");
      const relatedPrice = relatedPriceElement
        ? relatedPriceElement.textContent
        : "Цена не указана";

      const relatedItem = document.createElement("div");
      relatedItem.className = "related-product-item";
      relatedItem.innerHTML = `
                <img src="${relatedImage}" alt="${relatedTitle}" loading="lazy">
                <div class="related-product-info">
                    <p>${relatedPrice}</p>
                </div>
            `;

      relatedItem.addEventListener("click", function () {
        openProductModal(item);
      });

      relatedProductsList.appendChild(relatedItem);
    });
  }

  // Показать модальное окно
  foodModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Получение названия секции
function getSectionFromMenuItem(menuItem) {
  const section = menuItem.closest("section");
  return section ? section.id : null;
}

// Получение элементов меню из секции
function getMenuItemsFromSection(sectionId) {
  const section = document.getElementById(sectionId);
  return section ? Array.from(section.querySelectorAll(".menu-item")) : [];
}

// =============================================
// CART DISPLAY - Отображение корзины
// =============================================

// Переключение на страницу корзины
function toggleCart() {
  window.location.href = "pannier.html";
}

// Обновление отображения корзины
function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");

  if (!cartItems || !cartCountEl || !cartTotalEl) return;

  cartItems.innerHTML = "";
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCountEl.textContent = totalItems;
  cartTotalEl.textContent = totalPrice + "₽";

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p style="text-align: center; color: #888; padding: 20px;">Корзина пуста</p>';
  } else {
    cart.forEach((item, index) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-quantity">x${item.quantity}</span>
                </div>
                <div class="cart-item-price">
                    <span>${item.price * item.quantity}₽</span>
                    <button class="remove-item" data-index="${index}" title="Удалить">×</button>
                </div>
            `;
      cartItems.appendChild(cartItem);
    });

    // Обработчики кнопок удаления
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        removeFromCart(index);
      });
    });
  }
}

// =============================================
// FAVORITES DISPLAY - Отображение избранного
// =============================================
function updateFavoritesDisplay() {
  const favoritesContent = document.getElementById("favorites-content");
  if (!favoritesContent) return;

  const favoritesItems = favoritesContent.querySelector(".cart-items");
  if (!favoritesItems) return;

  favoritesItems.innerHTML = "";

  if (favorites.length === 0) {
    favoritesItems.innerHTML =
      '<p style="text-align: center; color: #888; padding: 20px;">Избранное пусто</p>';
  } else {
    favorites.forEach((item, index) => {
      const favoriteItem = document.createElement("div");
      favoriteItem.className = "cart-item";
      favoriteItem.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                </div>
                <div class="cart-item-price">
                    <span>${item.price}₽</span>
                    <button class="remove-favorite" data-index="${index}" title="Удалить">×</button>
                </div>
            `;
      favoritesItems.appendChild(favoriteItem);
    });

    // Обработчики кнопок удаления
    favoritesContent.querySelectorAll(".remove-favorite").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        const itemName = favorites[index].name;
        removeFromFavorites(itemName);
      });
    });
  }
}

// =============================================
// TAB SWITCHING - Переключение вкладок
// =============================================
function switchTab(tabName) {
  const tabs = document.querySelectorAll(".tab");
  const cartContent = document.getElementById("cart-content");
  const favoritesContent = document.getElementById("favorites-content");

  tabs.forEach((tab) => tab.classList.remove("active"));

  if (tabName === "cart") {
    const cartTab = document.querySelector('[data-tab="cart"]');
    if (cartTab) cartTab.classList.add("active");
    if (cartContent) cartContent.style.display = "block";
    if (favoritesContent) favoritesContent.style.display = "none";
  } else if (tabName === "favorites") {
    const favTab = document.querySelector('[data-tab="favorites"]');
    if (favTab) favTab.classList.add("active");
    if (cartContent) cartContent.style.display = "none";
    if (favoritesContent) {
      favoritesContent.style.display = "block";
      updateFavoritesDisplay();
    }
  }
}

// Инициализация переключения вкладок
document.addEventListener("DOMContentLoaded", function () {
  const cartToggle = document.querySelector(".cart-toggle");
  const cartClose = document.querySelector(".cart-close");
  const tabs = document.querySelectorAll(".tab");

  if (cartToggle) cartToggle.addEventListener("click", toggleCart);
  if (cartClose) cartClose.addEventListener("click", toggleCart);

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  updateCartDisplay();
  updateFavoritesDisplay();
});

// =============================================
// COOKIE CONSENT BANNER - Баннер согласия на куки
// =============================================
function initializeCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookies");
  const declineBtn = document.getElementById("decline-cookies");

  if (!cookieBanner || !acceptBtn || !declineBtn) return;

  // Проверка предыдущего выбора
  const cookieChoice = localStorage.getItem("cookieConsent");

  if (cookieChoice === "accepted" || cookieChoice === "declined") {
    cookieBanner.style.display = "none";
  } else {
    cookieBanner.style.display = "flex";
  }

  // Принять куки
  acceptBtn.addEventListener("click", function () {
    localStorage.setItem("cookieConsent", "accepted");
    cookieBanner.style.display = "none";
    // Здесь можно добавить код для включения аналитики
    showNotification("Настройки куки сохранены");
  });

  // Отклонить куки
  declineBtn.addEventListener("click", function () {
    localStorage.setItem("cookieConsent", "declined");
    cookieBanner.style.display = "none";
    // Здесь можно добавить код для отключения необязательных куки
    showNotification("Настройки куки сохранены");
  });
}

// =============================================
// LAZY LOADING - Ленивая загрузка
// =============================================
function initializeLazyLoading() {
  if ("IntersectionObserver" in window) {
    const lazyImages = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;

            // Удаляем атрибут после загрузки
            img.addEventListener("load", () => {
              img.removeAttribute("data-src");
              img.classList.add("loaded");
            });

            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      }
    );

    lazyImages.forEach((img) => imageObserver.observe(img));
  }
}

// =============================================
// ERROR HANDLING - Обработка ошибок
// =============================================

// Глобальный обработчик ошибок JavaScript
window.addEventListener("error", function (e) {
  console.error("Произошла ошибка:", e.error);

  // Можно отправить ошибку на сервер для анализа
  if (typeof window.errorLogEndpoint !== "undefined") {
    const errorData = {
      message: e.error?.message || "Unknown error",
      stack: e.error?.stack || "",
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    fetch(window.errorLogEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(errorData),
    }).catch(() => {});
  }
});

// Обработка необработанных промисов
window.addEventListener("unhandledrejection", function (e) {
  console.error("Необработанное обещание:", e.reason);
  showNotification("Произошла ошибка при выполнении операции", "error");
});

// =============================================
// DYNAMIC CSS - Динамическое добавление CSS
// =============================================
(function addDynamicCSS() {
  const style = document.createElement("style");
  style.textContent = `
        /* Анимации для уведомлений */
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                visibility: visible;
            }
            to {
                opacity: 0;
                visibility: hidden;
            }
        }
        
        /* Стили для улучшения UX */
        .menu-item img {
            transition: transform 0.3s ease;
            cursor: pointer;
        }
        
        .menu-item img:hover {
            transform: scale(1.02);
        }
        
        .related-product-item {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .related-product-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .loading-screen.fade-out {
            animation: fadeOut 0.5s ease-out forwards;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Улучшенные стили для корзины */
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
        }
        
        .cart-item:hover {
            background-color: #f9f9f9;
        }
        
        .cart-item-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .cart-item-name {
            font-weight: 500;
            color: #333;
        }
        
        .cart-item-quantity {
            font-size: 12px;
            color: #666;
        }
        
        .cart-item-price {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .remove-item, .remove-favorite {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        
        .remove-item:hover, .remove-favorite:hover {
            background: #cc0000;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .notification {
                top: 10px;
                right: 10px;
                left: 10px;
                font-size: 13px;
                padding: 12px 15px;
            }
        }
    `;

  document.head.appendChild(style);
})();

// =============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// Экспорт функций для глобального использования
// =============================================
window.CastelloPanAfrica = {
  addToCart,
  removeFromCart,
  addToFavorites,
  removeFromFavorites,
  updateCartCounter,
  updateCartDisplay,
  updateFavoritesDisplay,
  showNotification,
  openProductModal,
  toggleCart,
};
