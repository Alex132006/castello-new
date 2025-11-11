// Cart and Favorites Management for Cart Page
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Update cart counter in header (if exists)
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Update cart display
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
                    Перейти в меню
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

    // Add event listeners to quantity buttons
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

    // Add event listeners to remove buttons
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

// Update favorites display
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
                    Перейти в меню
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
                    <button class="add-to-cart-from-fav" data-index="${index}">
                        <i class="fas fa-shopping-cart"></i> В корзину
                    </button>
                    <button class="remove-favorite" data-index="${index}">×</button>
                </div>
            `;
            favoritesItems.appendChild(favoriteItem);
        });
        if (favoritesCountEl) favoritesCountEl.textContent = favorites.length;
        if (addAllBtn) addAllBtn.disabled = false;
    }

    // Add event listeners to add to cart buttons
    document.querySelectorAll('.add-to-cart-from-fav').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            const item = favorites[index];

            // Check if item already exists in cart
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
            this.innerHTML = '<i class="fas fa-check"></i> Добавлено!';
            this.style.background = '#27ae60';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i> В корзину';
                this.style.background = '';
            }, 1500);
        });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            favorites.splice(index, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesDisplay();
        });
    });
}

// Tab switching functionality
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

// Modal functionality
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

// Checkout functionality
document.getElementById('checkout-btn').addEventListener('click', function () {
    if (cart.length > 0) {
        orderModal.style.display = 'block';
    }
});

// Order form submission
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const orderNotes = document.getElementById('orderNotes').value;

    // Create order object
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

    // Save order to localStorage (in a real app, this would be sent to server)
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));

    // Close order modal and show success
    orderModal.style.display = 'none';
    successModal.style.display = 'block';

    // Reset form
    this.reset();

    // Update displays
    updateCartDisplay();
    updateCartCounter();
});

// Add all favorites to cart functionality
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
        this.innerHTML = '<i class="fas fa-shopping-cart"></i> Добавить все в корзину';
        this.style.background = '';
    }, 1500);
});

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Load initial data
    updateCartDisplay();
    updateCartCounter();
});