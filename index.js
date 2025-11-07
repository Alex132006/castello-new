// Loading screen with restaurant name
        window.addEventListener('load', function () {
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <img src="image copy.png" alt="Логотип Кафе Кастелло Пан Африка" class="loading-logo">
                    <h2>добро пожаловать</h2>
                    <h3>В</h3>
                    <h1>Кастелло Пан Африка</h1>
                    <div class="spinner"></div>
                    <p>Загрузка...</p>
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
            `;
            document.body.appendChild(loadingScreen);

            // Hide loading screen after 3 seconds
            setTimeout(function () {
                loadingScreen.style.opacity = '0';
                setTimeout(function () {
                    loadingScreen.remove();
                }, 500);
            }, 1000);
        });


                // Gestion du panier améliorée
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        // Mettre à jour le compteur du panier
        function updateCartCounter() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCounter = document.getElementById('cart-count');
            if (cartCounter) {
                cartCounter.textContent = totalItems;
                cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        }

        // Gestion des boutons quantité
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function () {
                const menuItem = this.closest('.menu-item');
                const quantityDisplay = menuItem.querySelector('.quantity-display');
                let quantity = parseInt(quantityDisplay.textContent);

                if (this.classList.contains('minus-btn') && quantity > 1) {
                    quantity -= 1;
                } else if (this.classList.contains('plus-btn')) {
                    quantity += 1;
                }

                quantityDisplay.textContent = quantity;
            });
        });

        // Boutons "В корзину"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function () {
                const menuItem = this.closest('.menu-item');
                const name = menuItem.querySelector('.item-title span:first-child').textContent;
                const price = menuItem.querySelector('.item-price').textContent;
                const quantity = parseInt(menuItem.querySelector('.quantity-display').textContent);

                addToCart(name, price, quantity);

                // Animation de confirmation
                const originalText = this.textContent;
                this.textContent = '✓ Добавлено!';
                this.style.background = 'linear-gradient(135deg, hsla(120, 59%, 50%, 0.8), hsla(120, 59%, 40%, 0.8))';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = 'linear-gradient(135deg, hsla(120, 59%, 40%, 0.7), hsla(120, 59%, 30%, 0.7))';
                }, 1500);
            });
        });

        // Boutons "В корзину" dans le carousel
        document.querySelectorAll('.carousel-slide .btn').forEach(button => {
            button.addEventListener('click', function () {
                const slide = this.closest('.carousel-slide');
                const name = slide.querySelector('h3').textContent;
                const priceText = slide.querySelector('.price').textContent.trim();
                const price = priceText.replace('₽', '') + '₽';

                addToCart(name, price, 1);

                // Animation de confirmation
                const originalText = this.textContent;
                this.textContent = '✓ Добавлено!';
                this.style.background = 'linear-gradient(135deg, hsla(120, 59%, 50%, 0.8), hsla(120, 59%, 40%, 0.8))';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                }, 1500);
            });
        });

        // Fonction pour ajouter au panier
        function addToCart(name, price, quantity) {
            // Extraire le prix numérique
            const priceValue = parseInt(price.replace('₽', '').replace(/\s/g, ''));

            // Vérifier si l'article existe déjà
            const existingItem = cart.find(item => item.name === name);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    name: name,
                    price: priceValue,
                    quantity: quantity,
                    id: Date.now() // ID unique
                });
            }

            // Sauvegarder dans localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Mettre à jour le compteur du panier
            updateCartCounter();

            // Mettre à jour l'affichage du panier
            updateCartDisplay();

            console.log('Panier mis à jour:', cart);
        }

        // Gestion des favoris
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const menuItem = this.closest('.menu-item');
                const name = menuItem.querySelector('.item-title span:first-child').textContent;
                const price = menuItem.querySelector('.item-price').textContent;

                this.classList.toggle('active');
                const icon = this.querySelector('i');

                if (this.classList.contains('active')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    addToFavorites(name, price);
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    removeFromFavorites(name);
                }
            });
        });

        // Fonction pour ajouter aux favoris
        function addToFavorites(name, price) {
            const priceValue = parseInt(price.replace('₽', '').replace(/\s/g, ''));
            const existingItem = favorites.find(item => item.name === name);

            if (!existingItem) {
                favorites.push({
                    name: name,
                    price: priceValue,
                    id: Date.now()
                });
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateFavoritesDisplay();
            }
        }

        // Fonction pour retirer des favoris
        function removeFromFavorites(name) {
            favorites = favorites.filter(item => item.name !== name);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesDisplay();
        }

        // Initialiser les icônes de favoris au chargement
        function initializeFavoriteIcons() {
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                const menuItem = btn.closest('.menu-item');
                if (!menuItem) return; // Skip if not inside a .menu-item (e.g., promo section)
                const name = menuItem.querySelector('.item-title span:first-child').textContent;
                const icon = btn.querySelector('i');

                const isFavorite = favorites.some(item => item.name === name);

                if (isFavorite) {
                    btn.classList.add('active');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    btn.classList.remove('active');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            });
        }

        // Initialiser au chargement de la page
        document.addEventListener('DOMContentLoaded', function () {
            updateCartCounter();
            initializeFavoriteIcons();

            // Bouton panier dans le header
            const cartBtn = document.getElementById('cartBtn');
            if (cartBtn) {
                cartBtn.addEventListener('click', function () {
                    toggleCart();
                });
            }
        });

        // Les autres fonctions existantes (toggleCart, updateCartDisplay, etc.) restent les mêmes
        // Toggle cart visibility
        function toggleCart() {
            const cart = document.getElementById('floating-cart');
            cart.classList.toggle('expanded');
            cart.classList.toggle('collapsed');
        }

        // Update cart display
        function updateCartDisplay() {
            const cartItems = document.getElementById('cart-items');
            const cartCountEl = document.getElementById('cart-count');
            const cartTotalEl = document.getElementById('cart-total');

            cartItems.innerHTML = '';
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            cartCountEl.textContent = totalItems;
            cartTotalEl.textContent = totalPrice + '₽';

            if (cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Корзина пуста</p>';
            } else {
                cart.forEach((item, index) => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                            <span>${item.name} x${item.quantity}</span>
                            <span>${item.price * item.quantity}₽</span>
                            <button class="remove-item" data-index="${index}">×</button>
                        `;
                    cartItems.appendChild(cartItem);
                });
            }

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index'));
                    removeFromCart(index);
                });
            });
        }

        // Remove item from cart
        function removeFromCart(index) {
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCounter();
            updateCartDisplay();
        }

        // Update favorites display
        function updateFavoritesDisplay() {
            const favoritesContent = document.getElementById('favorites-content');
            const favoritesItems = favoritesContent.querySelector('.cart-items');

            favoritesItems.innerHTML = '';

            if (favorites.length === 0) {
                favoritesItems.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Избранное пусто</p>';
            } else {
                favorites.forEach((item, index) => {
                    const favoriteItem = document.createElement('div');
                    favoriteItem.className = 'cart-item';
                    favoriteItem.innerHTML = `
                            <span>${item.name}</span>
                            <span>${item.price}₽</span>
                            <button class="remove-favorite" data-index="${index}">×</button>
                        `;
                    favoritesItems.appendChild(favoriteItem);
                });
            }

            // Add event listeners to remove buttons
            favoritesContent.querySelectorAll('.remove-favorite').forEach(btn => {
                btn.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index'));
                    const itemName = favorites[index].name;
                    removeFromFavorites(itemName);
                    initializeFavoriteIcons(); // Mettre à jour les icônes dans le menu
                });
            });
        }

        // Tab switching functionality
        function switchTab(tabName) {
            const tabs = document.querySelectorAll('.tab');
            const cartContent = document.getElementById('cart-content');
            const favoritesContent = document.getElementById('favorites-content');

            tabs.forEach(tab => tab.classList.remove('active'));

            if (tabName === 'cart') {
                document.querySelector('[data-tab="cart"]').classList.add('active');
                cartContent.style.display = 'block';
                favoritesContent.style.display = 'none';
            } else if (tabName === 'favorites') {
                document.querySelector('[data-tab="favorites"]').classList.add('active');
                cartContent.style.display = 'none';
                favoritesContent.style.display = 'block';
                updateFavoritesDisplay();
            }
        }

        // Initialize cart toggle and tabs
        document.addEventListener('DOMContentLoaded', function () {
            const cartToggle = document.querySelector('.cart-toggle');
            const cartClose = document.querySelector('.cart-close');
            const tabs = document.querySelectorAll('.tab');

            cartToggle.addEventListener('click', toggleCart);
            cartClose.addEventListener('click', toggleCart);

            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const tabName = this.getAttribute('data-tab');
                    switchTab(tabName);
                });
            });

            updateCartDisplay();
            updateFavoritesDisplay();
        });

        // Les autres fonctions JavaScript existantes restent inchangées...
        // Плавная прокрутка для навигационных ссылок
        document.querySelectorAll("nav a, .btn").forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                if (this.getAttribute("href").startsWith("#")) {
                    e.preventDefault();

                    const targetId = this.getAttribute("href");
                    const targetElement = document.querySelector(targetId);

                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: "smooth",
                    });
                }
            });
        });

        // Events Modal
        const modal = document.getElementById("eventsModal");
        const btn = document.getElementById("eventsBtn");
        const span = document.getElementsByClassName("close-btn")[0];

        btn.onclick = function () {
            modal.style.display = "block";
        };

        span.onclick = function () {
            modal.style.display = "none";
        };

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };

        // Navigation select
        document.getElementById("choix").addEventListener("change", function () {
            const targetId = this.value;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        });

        // Food Details Modal Functionality
        const foodModal = document.getElementById("foodModal");
        const foodDescription = document.getElementById("foodDescription");
        const closeBtn = document.querySelector("#foodModal .close-btn");

        // Close modal when clicking the close button
        closeBtn.onclick = function () {
            foodModal.style.display = "none";
        };

        // Close modal when clicking outside the modal content
        window.onclick = function (event) {
            if (event.target == foodModal) {
                foodModal.style.display = "none";
            }
        };

        // Cookie Consent Banner Functionality
        document.addEventListener("DOMContentLoaded", function () {
            const cookieBanner = document.getElementById("cookie-banner");
            const acceptBtn = document.getElementById("accept-cookies");
            const declineBtn = document.getElementById("decline-cookies");

            // Check if user has already made a choice
            const cookieChoice = localStorage.getItem("cookieConsent");

            if (cookieChoice === "accepted" || cookieChoice === "declined") {
                // Hide banner if choice already made
                cookieBanner.style.display = "none";
            } else {
                // Show banner if no choice made
                cookieBanner.style.display = "flex";
            }

            // Accept cookies
            acceptBtn.addEventListener("click", function () {
                localStorage.setItem("cookieConsent", "accepted");
                cookieBanner.style.display = "none";
                // Here you can add code to enable cookies/analytics if needed
            });

            // Decline cookies
            declineBtn.addEventListener("click", function () {
                localStorage.setItem("cookieConsent", "declined");
                cookieBanner.style.display = "none";
                // Here you can add code to disable non-essential cookies
            });
        });
 