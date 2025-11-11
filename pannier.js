// Gestion du panier et des favoris pour la page panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Mettre à jour le compteur du panier dans l'en-tête (si existe)
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Mettre à jour l'affichage du panier
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    cartItems.innerHTML = '';
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartTotalEl.textContent = totalPrice + '₽';

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из меню</p>
                <button class="back-to-menu-btn" onclick="window.location.href='index.html'">
                    Mеню
                </button>
            </div>
        `;
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price}₽ за шт.</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus-btn" data-index="${index}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item-total">${item.price * item.quantity}₽</div>
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    // Ajouter des écouteurs d'événements aux boutons de quantité
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            const isPlus = this.classList.contains('plus-btn');

            if (isPlus) {
                cart[index].quantity += 1;
            } else if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCounter();
        });
    });

    // Ajouter des écouteurs d'événements aux boutons de suppression
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCounter();
        });
    });
}

// Mettre à jour l'affichage des favoris
function updateFavoritesDisplay() {
    const favoritesItems = document.getElementById('favorites-items');
    const favoritesCountEl = document.getElementById('favorites-count');
    const addAllBtn = document.getElementById('add-all-to-cart-btn');

    favoritesItems.innerHTML = '';

    if (favorites.length === 0) {
        favoritesItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-heart"></i>
                <h3>Избранное пусто</h3>
                <p>Добавьте товары в избранное</p>
                <button class="back-to-menu-btn" onclick="window.location.href='index.html'">
                    Mеню
                </button>
            </div>
        `;
        if (favoritesCountEl) favoritesCountEl.textContent = '0';
        if (addAllBtn) addAllBtn.disabled = true;
    } else {
        favorites.forEach((item, index) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'cart-item';
            favoriteItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price}₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="add-to-cart-from-fav add-to-cart-btn" data-index="${index}" title="Добавить в корзину">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="remove-favorite" data-index="${index}">×</button>
                </div>
            `;
            favoritesItems.appendChild(favoriteItem);
        });
        if (favoritesCountEl) favoritesCountEl.textContent = favorites.length;
        if (addAllBtn) addAllBtn.disabled = false;
    }

    // Ajouter des écouteurs d'événements aux boutons d'ajout au panier
    document.querySelectorAll('.add-to-cart-from-fav').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            const item = favorites[index];

            // Vérifier si l'article existe déjà dans le panier
            const existingItem = cart.find(cartItem => cartItem.name === item.name);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    id: Date.now()
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            updateCartCounter();

            // Animation
            this.innerHTML = '<i class="fas fa-check"></i>';
            this.style.background = '#27ae60';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                this.style.background = '';
            }, 1500);
        });
    });

    // Ajouter des écouteurs d'événements aux boutons de suppression
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            favorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesDisplay();
        });
    });
}

// Fonctionnalité de changement d'onglet
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const cartContent = document.getElementById('cart-content');
    const favoritesContent = document.getElementById('favorites-content');

    tabs.forEach(tab => tab.classList.remove('active'));

    if (tabName === 'cart') {
        document.querySelector('[data-tab="cart"]').classList.add('active');
        cartContent.style.display = 'block';
        favoritesContent.style.display = 'none';
        updateCartDisplay();
    } else if (tabName === 'favorites') {
        document.querySelector('[data-tab="favorites"]').classList.add('active');
        cartContent.style.display = 'none';
        favoritesContent.style.display = 'block';
        updateFavoritesDisplay();
    }
}

// Fonctionnalité modale
const orderModal = document.getElementById('orderModal');
const successModal = document.getElementById('successModal');
const closeBtns = document.querySelectorAll('.close-btn');

closeBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        orderModal.style.display = 'none';
        successModal.style.display = 'none';
    });
});

window.addEventListener('click', function (event) {
    if (event.target === orderModal || event.target === successModal) {
        orderModal.style.display = 'none';
        successModal.style.display = 'none';
    }
});

// Fonctionnalité de paiement
document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length > 0) {
        orderModal.style.display = 'block';
    }
});

// Soumission du formulaire de commande
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;

    // Créer l'objet commande
    const order = {
        customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            notes: orderNotes
        },
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString(),
        id: Date.now()
    };

    // Sauvegarder la commande dans localStorage (dans une vraie app, ceci serait envoyé au serveur)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Vider le panier
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    // Fermer la modale de commande et afficher le succès
    orderModal.style.display = 'none';
    successModal.style.display = 'block';

    // Réinitialiser le formulaire
    this.reset();

    // Mettre à jour les affichages
    updateCartDisplay();
    updateCartCounter();
});

// Fonctionnalité d'ajout de tous les favoris au panier
document.getElementById('add-all-to-cart-btn').addEventListener('click', function () {
    favorites.forEach(item => {
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => cartItem.name === item.name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1,
                id: Date.now()
            });
        }
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCounter();

    // Animation
    this.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
    this.style.background = '#27ae60';
    setTimeout(() => {
        this.innerHTML = '<i class="fas fa-shopping-cart"></i> все в корзину';
        this.style.background = '';
    }, 1500);
});

// Initialiser la page
document.addEventListener('DOMContentLoaded', function () {
    // Changement d'onglet
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Charger les données initiales
    updateCartDisplay();
    updateCartCounter();
});