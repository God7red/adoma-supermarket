(function () {
    'use strict';

    //states
    let activeCategory = 'All';
    let activeTag      = 'All';
    let activeSort     = 'default';
    let maxPrice       = 100;
    let searchQuery    = '';
    let isListView     = false;

    //filter
    function getFilteredProducts() {
        let list = [...products];

        // Category
        if (activeCategory !== 'All') {
            list = list.filter(p => p.category === activeCategory);
        }

        // Tag / badge
        if (activeTag !== 'All') {
            list = list.filter(p => p.badge === activeTag);
        }

        // Price
        list = list.filter(p => p.price <= maxPrice);

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.badge && p.badge.toLowerCase().includes(q))
            );
        }

        // Sort
        if (activeSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
        if (activeSort === 'price-desc') list.sort((a, b) => b.price - a.price);
        if (activeSort === 'rating')     list.sort((a, b) => b.rating - a.rating);
        if (activeSort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));

        return list;
    }

    function renderProducts() {
        const grid      = document.getElementById('productsGrid');
        const noResults = document.getElementById('noResults');
        const countEl   = document.getElementById('resultCount');
        if (!grid) return;

        const list = getFilteredProducts();
        if (countEl) countEl.textContent = list.length;

        if (list.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        grid.innerHTML = list.map(p => {
            const stars       = getStarRating(p.rating);
            const oldPriceHtml = p.oldPrice
                ? `<span class="old-price">GH₵${p.oldPrice.toFixed(2)}</span>`
                : '';
            const inWishlist = wishlist.some(w => w.id === p.id);
            const placeholder = encodeURIComponent(p.name);

            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-badge">${escapeHTML(p.badge)}</div>
                    <div class="product-image">
                        <img src="${escapeHTML(p.image)}"
                             alt="${escapeHTML(p.name)}"
                             loading="lazy"
                             onerror="this.src='https://placehold.co/400x250?text=${placeholder}'">
                        <div class="product-overlay" aria-hidden="true">
                            <button class="overlay-btn" onclick="addToCart(${p.id})" aria-label="Add ${escapeHTML(p.name)} to cart">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                            <button class="overlay-btn ${inWishlist ? 'wishlisted' : ''}" onclick="toggleWishlist(${p.id})" aria-label="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
                                <i class="${inWishlist ? 'fas' : 'far'} fa-heart"></i>
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
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>`;
        }).join('');

        // Toggle list/grid class
        grid.classList.toggle('list-view', isListView);
    }

    //init controls
    function initControls() {

        // Category radios
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', function () {
                activeCategory = this.value;
                renderProducts();
            });
        });

        // Price range
        const priceRange = document.getElementById('priceRange');
        const priceLabel = document.getElementById('priceRangeLabel');
        if (priceRange) {
            // Set max to highest product price dynamically
            const highestPrice = Math.ceil(Math.max(...products.map(p => p.price)));
            priceRange.max   = highestPrice;
            priceRange.value = highestPrice;
            maxPrice         = highestPrice;
            if (priceLabel) priceLabel.textContent = `Up to GH₵${highestPrice}`;

            priceRange.addEventListener('input', function () {
                maxPrice = Number(this.value);
                if (priceLabel) priceLabel.textContent = `Up to GH₵${maxPrice}`;
                renderProducts();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                activeSort = this.value;
                renderProducts();
            });
        }

        // Tag buttons
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                activeTag = this.dataset.tag;
                renderProducts();
            });
        });

        // Clear filters
        const clearBtn = document.getElementById('clearFilters');
        const resetBtn = document.getElementById('resetBtn');
        function clearAll() {
            activeCategory = 'All';
            activeTag      = 'All';
            activeSort     = 'default';
            searchQuery    = '';

            document.querySelector('input[name="category"][value="All"]').checked = true;
            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.tag-btn[data-tag="All"]').classList.add('active');

            const sortEl = document.getElementById('sortSelect');
            if (sortEl) sortEl.value = 'default';

            const searchEl = document.getElementById('searchInput');
            if (searchEl) searchEl.value = '';

            const priceRangeEl = document.getElementById('priceRange');
            if (priceRangeEl) {
                priceRangeEl.value = priceRangeEl.max;
                maxPrice = Number(priceRangeEl.max);
                const lbl = document.getElementById('priceRangeLabel');
                if (lbl) lbl.textContent = `Up to GH₵${maxPrice}`;
            }

            renderProducts();
        }
        if (clearBtn) clearBtn.addEventListener('click', clearAll);
        if (resetBtn) resetBtn.addEventListener('click', clearAll);

        // View toggle
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');
        if (gridBtn) gridBtn.addEventListener('click', () => {
            isListView = false;
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            renderProducts();
        });
        if (listBtn) listBtn.addEventListener('click', () => {
            isListView = true;
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            renderProducts();
        });

        // Mobile sidebar toggle
        const mobileToggle    = document.getElementById('mobileFilterToggle');
        const sidebar         = document.getElementById('sidebar');
        const sidebarOverlay  = document.getElementById('sidebarOverlay');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

        function openSidebar() {
            sidebar.classList.add('mobile-open');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (sidebarCloseBtn) sidebarCloseBtn.style.display = 'inline-block';
        }
        function closeSidebar() {
            sidebar.classList.remove('mobile-open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
            if (sidebarCloseBtn) sidebarCloseBtn.style.display = 'none';
        }
        if (mobileToggle)    mobileToggle.addEventListener('click', openSidebar);
        if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay)  sidebarOverlay.addEventListener('click', closeSidebar);

        // Mobile search toggle (products page) 
       /* const mobileSearchToggle = document.getElementById('mobileSearchToggle');
        const mobileSearchBar    = document.getElementById('mobileSearchBar');
        const mobileSearchClose  = document.getElementById('mobileSearchClose');
        const mobileSearchInputEl = document.getElementById('mobileSearchInput');
        if (mobileSearchToggle && mobileSearchBar) {
            mobileSearchToggle.addEventListener('click', () => {
                mobileSearchBar.classList.toggle('open');
                if (mobileSearchBar.classList.contains('open') && mobileSearchInputEl) mobileSearchInputEl.focus();
            });
        }
        if (mobileSearchClose) mobileSearchClose.addEventListener('click', () => mobileSearchBar.classList.remove('open'));
        if (mobileSearchInputEl) {
            mobileSearchInputEl.addEventListener('input', function() {
                searchQuery = this.value.trim().toLowerCase();
                renderProducts();
            });
        } */
    }

    //search products page
    function initSearch() {
        const input    = document.getElementById('searchInput');
        const dropdown = document.getElementById('searchDropdown');
        if (!input) return;

        input.addEventListener('input', function () {
            searchQuery = this.value.trim().toLowerCase();

            if (dropdown) {
                if (!searchQuery) {
                    dropdown.classList.remove('visible');
                    dropdown.innerHTML = '';
                } else {
                    const matches = products.filter(p =>
                        p.name.toLowerCase().includes(searchQuery) ||
                        p.category.toLowerCase().includes(searchQuery)
                    );
                    if (matches.length === 0) {
                        dropdown.innerHTML = `<div class="search-no-results">No products found for "${escapeHTML(searchQuery)}"</div>`;
                    } else {
                        dropdown.innerHTML = matches.map(p => `
                            <div class="search-result-item" onclick="pickSearch(${p.id})" role="option" tabindex="0">
                                <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy"
                                     onerror="this.src='https://placehold.co/40'">
                                <span>${escapeHTML(p.name)}</span>
                            </div>`).join('');
                    }
                    dropdown.classList.add('visible');
                }
            }

            renderProducts();
        });

        document.addEventListener('click', function (e) {
            const sc = document.getElementById('searchContainer');
            if (sc && !sc.contains(e.target)) {
                if (dropdown) dropdown.classList.remove('visible');
            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                searchQuery = '';
                this.value  = '';
                if (dropdown) dropdown.classList.remove('visible');
                renderProducts();
            }
        });
    }

    window.pickSearch = function (productId) {
        const p = products.find(x => x.id === productId);
        if (!p) return;
        document.getElementById('searchInput').value = p.name;
        document.getElementById('searchDropdown').classList.remove('visible');
        searchQuery = p.name.toLowerCase();
        renderProducts();
    };

    //cart / wishlist modal
    function initModalListeners() {
        // Cart
        const cartIcon   = document.getElementById('cartIcon');
        const cartOverlay = document.getElementById('cartOverlay');
        const closeCartBtn = document.getElementById('closeCartBtn');
        if (cartIcon)    cartIcon.addEventListener('click', openCartModal);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCartModal);
        if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);

        const mobileCartLink = document.getElementById('mobileCartLink');
        if (mobileCartLink) {
            mobileCartLink.addEventListener('click', e => { e.preventDefault(); openCartModal(); });
        }

        // Wishlist
        const wishlistIcon   = document.getElementById('wishlistIcon');
        const wishlistOverlay = document.getElementById('wishlistOverlay');
        const closeWishlistBtn = document.getElementById('closeWishlistBtn');
        if (wishlistIcon)    wishlistIcon.addEventListener('click', openWishlistModal);
        if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlistModal);
        if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistModal);

        const mobileWishlistLink = document.getElementById('mobileWishlistLink');
        if (mobileWishlistLink) {
            mobileWishlistLink.addEventListener('click', e => { e.preventDefault(); openWishlistModal(); });
        }

        // Hamburger
        const hamburger  = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', e => {
                e.stopPropagation();
                const isOpen = mobileMenu.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', String(isOpen));
                mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            });
        }
        document.addEventListener('click', e => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                const hamburger = document.getElementById('hamburger');
                if (hamburger && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });

        // Back to top
        const backToTop = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (backToTop) backToTop.classList.toggle('show', window.scrollY > 300);
        });
        if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Redirect to login if user is not logged in before checkout
    window.openCheckout = function () {
        if (cart.length === 0) { alert('Your cart is empty!'); return; }
        const loggedIn = localStorage.getItem('adomaLoggedIn');
        closeCartModal();
        if (!loggedIn) {
            // Save intended destination and redirect
            localStorage.setItem('adomaRedirectAfterLogin', 'checkout.html');
            window.location.href = 'login.html';
        } else {
            window.location.href = 'checkout.html';
        }
    };

    //sidebar overlay element
    function injectSidebarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebarOverlay';
        document.body.appendChild(overlay);
    }

    //load functions
    document.addEventListener('DOMContentLoaded', function () {
        loadCart();
        loadWishlist();
        updateWishlistCount();
        injectSidebarOverlay();
        initControls();
        initSearch();
        initModalListeners();
        renderProducts();

        // Check for URL param ?category=X
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        if (catParam) {
            const radio = document.querySelector(`input[name="category"][value="${catParam}"]`);
            if (radio) { radio.checked = true; activeCategory = catParam; renderProducts(); }
        }

        const tagParam = params.get('tag');
        if (tagParam) {
            const tagBtn = document.querySelector(`.tag-btn[data-tag="${tagParam}"]`);
            if (tagBtn) { tagBtn.click(); }
        }
    });

})();