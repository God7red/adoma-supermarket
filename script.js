const products = [
    {
        id: 1,
        name: 'Organic Bananas',
        category: 'Fresh Produce',
        price: 9.99,
        oldPrice: 12.99,
        rating: 4.5,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        badge: 'Sale'
    },
    {
        id: 2,
        name: 'Farm Fresh Eggs',
        category: 'Dairy & Eggs',
        price: 4.99,
        oldPrice: null,
        rating: 4.8,
        reviews: 256,
        image: 'https://plus.unsplash.com/premium_photo-1664305037196-003c3164a78c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        badge: 'Best Seller'
    },
    {
        id: 3,
        name: 'Ideal Milk',
        category: 'Dairy & Eggs',
        price: 3.49,
        oldPrice: 4.29,
        rating: 4.3,
        reviews: 98,
        image: 'https://melcom.com/media/catalog/product/cache/d0e1b0d5c74d14bfa9f7dd43ec52d082/i/d/ideal_original_trip_to_dubai_150g-1.jpg',
        badge: 'Fresh'
    },
    {
        id: 4,
        name: 'Fresh Apples',
        category: 'Fresh Produce',
        price: 3.99,
        oldPrice: null,
        rating: 4.6,
        reviews: 189,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXBwbGVzfGVufDB8fDB8fHww',
        badge: 'Organic'
    },
    {
        id: 5,
        name: 'Bread Loaf',
        category: 'Bakery',
        price: 2.99,
        oldPrice: 3.99,
        rating: 4.4,
        reviews: 67,
        image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=600',
        badge: 'Sale'
    },
    {
        id: 6,
        name: 'Sausage',
        category: 'Meat & Poultry',
        price: 8.99,
        oldPrice: 11.99,
        rating: 4.7,
        reviews: 145,
        image: 'https://fairwayghana.com/image/cache/catalog/2024UPLOADS/SADIA%20CHICKEN%20SAUSAGE%20340G-500x500.jpg',
        badge: 'Fresh'
    },
    {
        id: 7,
        name: 'Cerelac',
        category: 'Cereals',
        price: 10.99,
        oldPrice: 11.99,
        rating: 4.7,
        reviews: 135,
        image: 'https://gh.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/38/0300141/1.jpg?7025',
        badge: 'Cereals'
    },
    {
        id: 8,
        name: 'BB Cocktail Fruit Drink',
        category: 'Beverages',
        price: 11.99,
        rating: 4.7,
        reviews: 135,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStY_R4xMpv6w_h3UHRtM6XL22vSrVhZkn3zQ&s',
        badge: 'Best Seller'
    }
];

// XSS-safe HTML escaping utility
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// CART STATE
let cart = [];

// WISHLIST STATE
let wishlist = [];

function loadWishlist() {
    try {
        const saved = localStorage.getItem('adomaWishlist');
        if (saved) wishlist = JSON.parse(saved);
    } catch (e) {
        console.warn('Could not load wishlist from storage:', e);
        wishlist = [];
    }
}

function saveWishlist() {
    try {
        localStorage.setItem('adomaWishlist', JSON.stringify(wishlist));
    } catch (e) {
        console.warn('Could not save wishlist to storage:', e);
    }
}

window.toggleWishlist = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const index = wishlist.findIndex(item => item.id === productId);
    let added;
    if (index > -1) {
        wishlist.splice(index, 1);
        added = false;
    } else {
        wishlist.push({ id: product.id, name: product.name, price: product.price, image: product.image });
        added = true;
    }

    saveWishlist();
    updateWishlistCount();
    // Re-render products to update heart icon state
    displayProducts(getActiveFilter(), document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim().toLowerCase() : '');

    // Show notification
    const note = document.getElementById('cartNotification');
    if (note) {
        const messageSpan = note.querySelector('span');
        const originalMessage = messageSpan.textContent;
        messageSpan.textContent = added ? `${product.name} added to wishlist!` : `${product.name} removed from wishlist!`;
        note.classList.add('show');
        setTimeout(() => {
            note.classList.remove('show');
            setTimeout(() => { messageSpan.textContent = originalMessage; }, 300);
        }, 2200);
    }
};

function updateWishlistCount() {
    const badge = document.getElementById('wishlistCount');
    if (badge) badge.textContent = wishlist.length;
    const mobileBadge = document.getElementById('mobileWishlistCount');
    if (mobileBadge) mobileBadge.textContent = wishlist.length;
}

function openWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const overlay = document.getElementById('wishlistOverlay');
    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderWishlistModal();
}

function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    const overlay = document.getElementById('wishlistOverlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function renderWishlistModal() {
    const el = document.getElementById('wishlistItems');
    const countEl = document.getElementById('wishlistItemCount');
    if (countEl) countEl.textContent = wishlist.length;
    if (!el) return;
    if (wishlist.length === 0) {
        el.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-heart" aria-hidden="true"></i>
                <p>Your wishlist is empty</p>
                <small>Click the heart on any product to save it!</small>
            </div>`;
        return;
    }
    el.innerHTML = wishlist.map(item => {
        const safeName = escapeHTML(item.name);
        const safeImage = escapeHTML(item.image);
        return `
            <div class="cart-item">
                <img src="${safeImage}" alt="${safeName}" class="cart-item-image" loading="lazy"
                    onerror="this.src='https://via.placeholder.com/60?text=Item'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${safeName}</div>
                    <div class="cart-item-price">GH₵${item.price.toFixed(2)}</div>
                </div>
                <button class="btn-cart btn-checkout" style="padding:0.4rem 0.8rem;font-size:0.8rem;" onclick="addToCart(${item.id}); closeWishlistModal();">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <div class="remove-item" onclick="toggleWishlist(${item.id})" role="button" tabindex="0" aria-label="Remove ${safeName} from wishlist">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </div>
            </div>`;
    }).join('');
}

// localStorage access
function loadCart() {
    try {
        const saved = localStorage.getItem('adomaCart');
        if (saved) cart = JSON.parse(saved);
    } catch (e) {
        console.warn('Could not load cart from storage:', e);
        cart = [];
    }
    updateCartCount();
}

function saveCart() {
    try {
        localStorage.setItem('adomaCart', JSON.stringify(cart));
    } catch (e) {
        console.warn('Could not save cart to storage:', e);
    }
}

// Cart operations
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id:       product.id,
            name:     product.name,
            price:    product.price,
            image:    product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    updateCartModal();

    // Show cart notification
    const note = document.getElementById('cartNotification');
    if (note) {
        const messageSpan = note.querySelector('span');
        const originalMessage = messageSpan.textContent;
        messageSpan.textContent = `${product.name} added to cart!`;
        note.classList.add('show');

        setTimeout(() => {
            note.classList.remove('show');
            setTimeout(() => {
                messageSpan.textContent = originalMessage;
            }, 300);
        }, 2200 )
    }
};

window.updateQuantity = function(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        window.removeFromCart(productId);
    } else {
        saveCart();
        updateCartCount();
        updateCartModal();
    }
};

window.removeFromCart = function(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartCount();
    updateCartModal();
};

window.clearCart = function() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartModal();
    }
};

function updateCartCount() {
    const count = cart.reduce((t, i) => t + i.quantity, 0);
    ['cartCount', 'mobileCartCount', 'cartItemCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

// Cart totals
function getCartTotals() {
    const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
    const delivery = subtotal > 50 ? 0 : 5;
    return { subtotal, delivery, total: subtotal + delivery };
}

// Cart modal
function updateCartModal() {
    const cartItemsEl   = document.getElementById('cartItems');
    const cartSummaryEl = document.getElementById('cartSummary');
    if (!cartItemsEl || !cartSummaryEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                <p>Your cart is empty</p>
                <small>Add some products to get started!</small>
            </div>`;
        cartSummaryEl.innerHTML = '';
        return;
    }

    cartItemsEl.innerHTML = cart.map(item => {
        const safeName  = escapeHTML(item.name);
        const safeImage = escapeHTML(item.image);
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `
            <div class="cart-item">
                <img src="${safeImage}"
                    alt="${safeName}"
                    class="cart-item-image"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/60?text=Item'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${safeName}</div>
                    <div class="cart-item-price">GH₵${item.price.toFixed(2)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Decrease quantity">−</button>
                        <span class="quantity-value" aria-label="Quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="cart-item-total">GH₵${itemTotal}</div>
                <div class="remove-item" onclick="removeFromCart(${item.id})" role="button" tabindex="0" aria-label="Remove ${safeName}">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </div>
            </div>`;
    }).join('');

    const { subtotal, delivery, total } = getCartTotals();

    cartSummaryEl.innerHTML = `
        <div class="summary-row"><span>Subtotal:</span><span>GH₵${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Delivery:</span><span>${delivery === 0 ? 'Free' : 'GH₵5.00'}</span></div>
        <div class="summary-row total"><span>Total:</span><span>GH₵${total.toFixed(2)}</span></div>
        <button class="btn-clear" onclick="clearCart()">
            <i class="fas fa-trash" aria-hidden="true"></i> Clear Cart
        </button>
        <div class="cart-actions">
            <button class="btn-cart btn-continue" onclick="closeCartModal()">
                <i class="fas fa-arrow-left" aria-hidden="true"></i> Continue Shopping
            </button>
            <button class="btn-cart btn-checkout" onclick="openCheckout()">
                <i class="fas fa-credit-card" aria-hidden="true"></i> Checkout
            </button>
        </div>`;
}

window.openCartModal = function() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartModal();
};

window.closeCartModal = function() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartModal').classList.remove('active');
    document.body.style.overflow = '';
};

// Checkout — navigate to dedicated checkout page (login guard)
window.openCheckout = function() {
    if (cart.length === 0) { alert('Your cart is empty!'); return; }
    closeCartModal();
    const loggedIn = localStorage.getItem('adomaLoggedIn');
    if (!loggedIn) {
        localStorage.setItem('adomaRedirectAfterLogin', 'checkout.html');
        window.location.href = 'login.html';
    } else {
        window.location.href = 'checkout.html';
    }
};

window.closeCheckout = function() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = '';
};

function updateCheckoutSummary() {
    const el = document.getElementById('checkoutSummary');
    if (!el) return;
    const { subtotal, delivery, total } = getCartTotals();

    el.innerHTML = `
        <h4>Order Summary</h4>
        ${cart.map(item => `
            <div class="summary-row">
                <span>${escapeHTML(item.name)} ×${item.quantity}</span>
                <span>GH₵${(item.price * item.quantity).toFixed(2)}</span>
            </div>`).join('')}
        <div class="summary-row" style="margin-top:.5rem;padding-top:.5rem;border-top:1px solid #ddd;">
            <span>Subtotal:</span><span>GH₵${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Delivery:</span><span>${delivery === 0 ? 'Free' : 'GH₵5.00'}</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span><span>GH₵${total.toFixed(2)}</span>
        </div>`;
}

function placeOrder(formData) {
    const { subtotal, delivery, total } = getCartTotals();
    const orderNumber = 'ADM' + Date.now().toString().slice(-8);

    const order = {
        orderNumber,
        date: new Date().toISOString(),
        customer: {
            name:  formData.fullName,
            email: formData.email,
            phone: formData.phone
        },
        delivery: {
            address: formData.address,
            city:    formData.city,
            time:    formData.deliveryTime
        },
        paymentMethod: formData.paymentMethod,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal,
        deliveryFee: delivery,
        total
    };

    try {
        const orders = JSON.parse(localStorage.getItem('adomaOrders') || '[]');
        orders.push(order);
        localStorage.setItem('adomaOrders', JSON.stringify(orders));
    } catch (e) {
        console.warn('Could not save order:', e);
    }

    cart = [];
    saveCart();
    updateCartCount();
    closeCheckout();

    const successMsg = document.getElementById('successMessage');
    if (successMsg) successMsg.textContent = `Order #${orderNumber} has been confirmed. Thank you for shopping with us!`;
    document.getElementById('successModal').classList.add('active');
}

// for products display
function displayProducts(filter = 'All', searchQuery = '') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    let filtered = products;

    if (filter === 'Fresh') {
        filtered = filtered.filter(p => p.badge === 'Fresh' || p.badge === 'Organic');
    } else if (filter === 'On Sale') {
        filtered = filtered.filter(p => p.oldPrice !== null);
    } else if (filter === 'Best Sellers') {
        filtered = filtered.filter(p => p.badge === 'Best Seller');
    } else if (filter === 'Beverages') {
    filtered = filtered.filter(p => p.category === 'Beverage' || p.category === 'Beverages');
}

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" aria-hidden="true"></i>
                <p>No products found. Try a different search or filter.</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const stars        = getStarRating(p.rating);
        const oldPriceHtml = p.oldPrice
            ? `<span class="old-price">GH₵${p.oldPrice.toFixed(2)}</span>`
            : '';
        const placeholder  = encodeURIComponent(p.name);

        return `
            <div class="product-card">
                <div class="product-badge">${escapeHTML(p.badge)}</div>
                <div class="product-image">
                    <img src="${escapeHTML(p.image)}"
                        alt="${escapeHTML(p.name)}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400x250?text=${placeholder}'">
                    <div class="product-overlay" aria-hidden="true">
                        <button class="overlay-btn" onclick="addToCart(${p.id})" aria-label="Add ${escapeHTML(p.name)} to cart">
                            <i class="fas fa-cart-plus" aria-hidden="true"></i>
                        </button>
                        <button class="overlay-btn ${wishlist.some(w => w.id === p.id) ? 'wishlisted' : ''}" onclick="toggleWishlist(${p.id})" aria-label="${wishlist.some(w => w.id === p.id) ? 'Remove from wishlist' : 'Add to wishlist'}">
                            <i class="${wishlist.some(w => w.id === p.id) ? 'fas' : 'far'} fa-heart" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${escapeHTML(p.category)}</div>
                    <h3 class="product-title">${escapeHTML(p.name)}</h3>
                    <div class="product-rating" aria-label="Rating: ${p.rating} out of 5">
                        <div class="stars" aria-hidden="true">${stars}</div>
                        <span class="rating-count">(${p.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">GH₵${p.price.toFixed(2)}</span>
                        ${oldPriceHtml}
                    </div>
                    <button class="add-to-cart" onclick="addToCart(${p.id})">
                        <i class="fas fa-shopping-cart" aria-hidden="true"></i> Add to Cart
                    </button>
                </div>
            </div>`;
    }).join('');
}

function getStarRating(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating))   html += '<i class="fas fa-star"></i>';
        else if (i - rating < 1)       html += '<i class="fas fa-star-half-alt"></i>';
        else                           html += '<i class="far fa-star"></i>';
    }
    return html;
}

// Countdown persists across page reloads
function startCountdown() {
    const STORAGE_KEY = 'adomaSaleEndDate';
    let endDate;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        endDate = stored ? new Date(stored) : null;
        if (!endDate || endDate <= new Date()) {
            endDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
            localStorage.setItem(STORAGE_KEY, endDate.toISOString());
        }
    } catch (e) {
        endDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
    }

    function tick() {
        const diff = endDate - Date.now();
        if (diff <= 0) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            startCountdown();
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        document.getElementById('days').textContent    = String(d).padStart(2, '0');
        document.getElementById('hours').textContent   = String(h).padStart(2, '0');
        document.getElementById('minutes').textContent = String(m).padStart(2, '0');
        document.getElementById('seconds').textContent = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}

// Live search
function initSearch() {
    const input    = document.getElementById('searchInput');
    const dropdown = document.getElementById('searchDropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        input.setAttribute('aria-expanded', query.length > 0 ? 'true' : 'false');

        if (!query) {
            dropdown.classList.remove('visible');
            dropdown.innerHTML = '';
            displayProducts(getActiveFilter());
            return;
        }

        const matches = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">No products found for "${escapeHTML(query)}"</div>`;
        } else {
            dropdown.innerHTML = matches.map(p => `
                <div class="search-result-item" onclick="selectSearchResult(${p.id})" role="option" tabindex="0" aria-label="${escapeHTML(p.name)}">
                    <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/40'">
                    <span>${escapeHTML(p.name)}</span>
                </div>`).join('');
        }

        dropdown.classList.add('visible');
        displayProducts(getActiveFilter(), query);
    });

    document.addEventListener('click', function(e) {
        if (!document.getElementById('searchContainer').contains(e.target)) {
            dropdown.classList.remove('visible');
            input.setAttribute('aria-expanded', 'false');
        }
    });

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdown.classList.remove('visible');
            this.value = '';
            displayProducts(getActiveFilter());
        }
    });
}

window.selectSearchResult = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById('searchInput').value = product.name;
    document.getElementById('searchDropdown').classList.remove('visible');
    displayProducts('All', product.name.toLowerCase());
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
};

function getActiveFilter() {
    const btn = document.querySelector('.filter-btn.active');
    return btn ? btn.textContent.trim() : 'All';
}

// DOM READY
document.addEventListener('DOMContentLoaded', function() {

    loadCart();
    loadWishlist();
    updateWishlistCount();
    displayProducts();
    startCountdown();
    initSearch();

    // Wishlist icon (desktop nav)
    const wishlistIcon = document.getElementById('wishlistIcon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', openWishlistModal);
        wishlistIcon.addEventListener('keydown', e => e.key === 'Enter' && openWishlistModal());
    }

    // Wishlist icon (mobile menu)
    const mobileWishlistLink = document.getElementById('mobileWishlistLink');
    if (mobileWishlistLink) {
        mobileWishlistLink.addEventListener('click', function(e) {
            e.preventDefault();
            openWishlistModal();
        });
    }

    // Close wishlist
    const closeWishlistBtn = document.getElementById('closeWishlistBtn');
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistModal);
    if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlistModal);

    // Dynamic footer year
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright) {
        footerCopyright.innerHTML = `&copy; ${new Date().getFullYear()} Adoma Supermarket. All rights reserved. | Designed with <i class="fas fa-heart" style="color:var(--orange);" aria-hidden="true"></i> for your family`;
    }

    // Cart icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCartModal);
        cartIcon.addEventListener('keydown', e => e.key === 'Enter' && openCartModal());
    }

    // Mobile cart link
    const mobileCartLink = document.getElementById('mobileCartLink');
    if (mobileCartLink) {
        mobileCartLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }

    // Close cart
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay  = document.getElementById('cartOverlay');
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
    if (cartOverlay)  cartOverlay.addEventListener('click', closeCartModal);

    // Close checkout
    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', window.closeCheckout);

    // Back to cart from checkout
    const backToCart = document.getElementById('backToCart');
    if (backToCart) {
        backToCart.addEventListener('click', function() {
            window.closeCheckout();
            setTimeout(openCartModal, 50);
        });
    }

    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        const selectMethod = function() {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('selected');
                m.setAttribute('aria-checked', 'false');
            });
            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');
        };
        method.addEventListener('click', selectMethod);
        method.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMethod.call(this); }
        });
    });

    // Checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selectedPayment = document.querySelector('.payment-method.selected');
            placeOrder({
                fullName:      document.getElementById('fullName').value.trim(),
                email:         document.getElementById('email').value.trim(),
                phone:         document.getElementById('phone').value.trim(),
                address:       document.getElementById('address').value.trim(),
                city:          document.getElementById('city').value.trim(),
                deliveryTime:  document.getElementById('deliveryTime') ? document.getElementById('deliveryTime').value : '',
                paymentMethod: selectedPayment ? selectedPayment.dataset.method : 'cash'
            });
        });
    }

    // Continue shopping from success modal
    const continueShopping = document.getElementById('continueShopping');
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            document.getElementById('successModal').classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Hamburger menu
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        }
    });
/*
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            displayProducts(this.textContent.trim(), document.getElementById('searchInput').value.trim().toLowerCase());
        });
    }); */ //will fix later

    // Back to top
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (backToTop) backToTop.classList.toggle('show', window.scrollY > 300);
    });
    if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('newsletterEmail').value.trim();
            if (email) {
                alert(`Thanks for subscribing! We'll send deals to: ${email}`);
                this.reset();
            }
        });
    }

}); // end DOMContentLoaded

const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');

filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class and reset aria-selected from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });

        // Add active class and aria-selected to clicked button
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Pass both filter text and search input value to displayProducts
        displayProducts(
            this.textContent.trim(),
            searchInput.value.trim().toLowerCase()
        );
    });
});