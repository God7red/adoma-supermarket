
        // ── Helpers ── 
        function getLS(key, fallback) {
            try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
            catch { return fallback; }
        }
        function setLS(key, val) {
            try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
        }

        function showToast(msg) {
            const t = document.getElementById('accountToast');
            document.getElementById('toastMsg').textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2800);
        }

        function formatDate(iso) {
            if (!iso) return '—';
            return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        function getInitials(name) {
            return name.trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || 'U';
        }

        // ── Tab switching ──
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tab));
            item.addEventListener('keydown', e => { if (e.key === 'Enter') switchTab(item.dataset.tab); });
        });

        function switchTab(tab) {
            document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
            document.getElementById('tab-' + tab).classList.add('active');
            if (tab === 'orders') renderOrders();
            if (tab === 'transactions') renderTransactions();
            if (tab === 'wishlist') renderWishlistTab();
        }

        // ── Load profile ──
        function loadProfile() {
            const p = getLS('adomaProfile', {});
            const firstName = p.firstName || '';
            const lastName  = p.lastName  || '';
            const fullName  = (firstName + ' ' + lastName).trim() || 'Guest User';
            const email     = p.email || '';

            document.getElementById('avatarInitials').textContent = getInitials(fullName);
            document.getElementById('sidebarName').textContent    = fullName;
            document.getElementById('sidebarEmail').textContent   = email || 'No email set';
            document.getElementById('greetName').textContent      = firstName || 'there';

            if (document.getElementById('firstName')) {
                document.getElementById('firstName').value    = firstName;
                document.getElementById('lastName').value     = lastName;
                document.getElementById('profileEmail').value = email;
                document.getElementById('profilePhone').value = p.phone   || '';
                document.getElementById('profileAddress').value = p.address || '';
            }
        }

        // ── Save profile ──
        function saveProfile() {
            const profile = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName:  document.getElementById('lastName').value.trim(),
                email:     document.getElementById('profileEmail').value.trim(),
                phone:     document.getElementById('profilePhone').value.trim(),
                address:   document.getElementById('profileAddress').value.trim(),
            };
            setLS('adomaProfile', profile);
            loadProfile();
            showToast('Profile saved successfully!');
        }

        function changePassword() {
            const np = document.getElementById('newPw').value;
            const cp = document.getElementById('confirmPw').value;
            if (!np) return showToast('Please enter a new password.');
            if (np !== cp) return showToast('Passwords do not match!');
            document.getElementById('currentPw').value = '';
            document.getElementById('newPw').value = '';
            document.getElementById('confirmPw').value = '';
            showToast('Password updated!');
        }

        // ── Stats ──
        function loadStats() {
            const orders   = getLS('adomaOrders', []);
            const wishlist = getLS('adomaWishlist', []);
            const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

            document.getElementById('statOrders').textContent   = orders.length;
            document.getElementById('statSpent').textContent    = 'GH₵' + totalSpent.toFixed(2);
            document.getElementById('statWishlist').textContent = wishlist.length;
            document.getElementById('wishlistCount').textContent = wishlist.length;

            const cart = getLS('adomaCart', []);
            const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
            document.getElementById('cartCount').textContent = cartCount;
        }

        // ── Overview: recent orders ──
        function loadRecentOrders() {
            const orders = getLS('adomaOrders', []);
            const el = document.getElementById('recentOrdersList');
            if (orders.length === 0) {
                el.innerHTML = `<div class="empty-state" style="padding:2rem;">
                    <i class="fas fa-box-open"></i>
                    <p>No orders yet</p>
                    <a href="index.html"><i class="fas fa-shopping-bag"></i> Shop Now</a>
                </div>`;
                return;
            }
            const recent = [...orders].reverse().slice(0, 3);
            el.innerHTML = buildOrderCards(recent);
        }

        function buildOrderCards(orders) {
            if (orders.length === 0) return `<div class="empty-state"><i class="fas fa-box-open"></i><p>No orders found</p><a href="index.html">Shop Now</a></div>`;
            return orders.map(o => {
                const items   = o.items || [];
                const status  = o.status || 'Delivered';
                const statusClass = status === 'Delivered' ? 'status-delivered' : status === 'Processing' ? 'status-processing' : 'status-cancelled';
                const thumbs  = items.slice(0, 3).map(item => {
                    const img = getProductImage(item.id);
                    return `<img class="order-item-thumb" src="${img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/46'">`;
                }).join('');
                const extra = items.length > 3 ? `<div class="order-more-items">+${items.length - 3}</div>` : '';
                return `
                <div class="order-card">
                    <div class="order-card-header">
                        <div>
                            <div class="order-number">#${o.orderNumber || '—'}</div>
                            <div class="order-date">${formatDate(o.date)}</div>
                        </div>
                        <span class="order-status ${statusClass}">
                            <i class="fas fa-circle" style="font-size:0.5rem;"></i> ${status}
                        </span>
                    </div>
                    <div class="order-items-preview">${thumbs}${extra}<span style="font-size:0.82rem;color:#999;margin-left:0.5rem;">${items.length} item${items.length !== 1 ? 's' : ''}</span></div>
                    <div class="order-card-footer">
                        <div class="order-total">Total: <span>GH₵${(o.total || 0).toFixed(2)}</span></div>
                        <button class="view-order-btn" onclick="viewOrder('${o.orderNumber}')">View Details</button>
                    </div>
                </div>`;
            }).join('');
        }

        // ── Orders tab ──
        function renderOrders() {
            const orders = [...getLS('adomaOrders', [])].reverse();
            document.getElementById('fullOrdersList').innerHTML = buildOrderCards(orders);
        }

        function viewOrder(num) {
            const orders = getLS('adomaOrders', []);
            const o = orders.find(x => x.orderNumber === num);
            if (!o) return;
            const items = (o.items || []).map(i => `<li style="margin-bottom:4px;">${i.name} × ${i.quantity} — GH₵${(i.price * i.quantity).toFixed(2)}</li>`).join('');
            alert(`Order #${o.orderNumber}\nDate: ${formatDate(o.date)}\nCustomer: ${o.customer?.name || '—'}\nDelivery: ${o.delivery?.address || '—'}, ${o.delivery?.city || ''}\nPayment: ${o.paymentMethod || '—'}\n\nItems:\n${(o.items||[]).map(i=>`  • ${i.name} ×${i.quantity} — GH₵${(i.price*i.quantity).toFixed(2)}`).join('\n')}\n\nSubtotal: GH₵${(o.subtotal||0).toFixed(2)}\nDelivery: ${o.deliveryFee===0?'Free':'GH₵5.00'}\nTotal: GH₵${(o.total||0).toFixed(2)}`);
        }

        // ── Transactions tab ──
        function renderTransactions() {
            const orders = [...getLS('adomaOrders', [])].reverse();
            const tbody = document.getElementById('txTableBody');
            const empty = document.getElementById('txEmpty');
            if (orders.length === 0) {
                tbody.innerHTML = '';
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';
            tbody.innerHTML = orders.map(o => `
                <tr>
                    <td><strong>#${o.orderNumber || '—'}</strong></td>
                    <td>${formatDate(o.date)}</td>
                    <td style="text-transform:capitalize;">${o.paymentMethod || 'cash'}</td>
                    <td><span class="tx-type tx-purchase"><i class="fas fa-arrow-down"></i> Purchase</span></td>
                    <td class="tx-amount-neg">−GH₵${(o.total || 0).toFixed(2)}</td>
                </tr>`).join('');
        }

        // ── Wishlist tab ──
        function renderWishlistTab() {
            const wishlist = getLS('adomaWishlist', []);
            const grid  = document.getElementById('accountWishlistGrid');
            const empty = document.getElementById('wishlistEmpty');
            if (wishlist.length === 0) {
                grid.innerHTML = '';
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';
            grid.innerHTML = wishlist.map(item => `
                <div class="wishlist-card">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200x140'">
                    <div class="wishlist-card-body">
                        <div class="wishlist-card-name">${item.name}</div>
                        <div class="wishlist-card-price">GH₵${item.price.toFixed(2)}</div>
                        <button class="wishlist-card-btn" onclick="addToCartFromWishlist(${item.id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>`).join('');
        }

        function addToCartFromWishlist(productId) {
            let cart = getLS('adomaCart', []);
            const wishlist = getLS('adomaWishlist', []);
            const item = wishlist.find(w => w.id === productId);
            if (!item) return;
            const existing = cart.find(c => c.id === productId);
            if (existing) { existing.quantity += 1; }
            else { cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 }); }
            setLS('adomaCart', cart);
            const count = cart.reduce((t, i) => t + i.quantity, 0);
            document.getElementById('cartCount').textContent = count;
            showToast(`${item.name} added to cart!`);
        }

        function getProductImage(productId) {
            const imgs = {
                1: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=200',
                2: 'https://plus.unsplash.com/premium_photo-1664305037196-003c3164a78c?q=80&w=200',
                3: 'https://melcom.com/media/catalog/product/cache/d0e1b0d5c74d14bfa9f7dd43ec52d082/i/d/ideal_original_trip_to_dubai_150g-1.jpg',
                4: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200',
                5: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?w=200',
                6: 'https://fairwayghana.com/image/cache/catalog/2024UPLOADS/SADIA%20CHICKEN%20SAUSAGE%20340G-500x500.jpg',
                7: 'https://gh.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/38/0300141/1.jpg?7025',
            };
            return imgs[productId] || 'https://via.placeholder.com/46';
        }

        // ── Settings ──
        function loadSettings() {
            const s = getLS('adomaSettings', { notifOrders: true, notifDeals: true, notifNewsletter: false });
            document.getElementById('notifOrders').checked     = s.notifOrders !== false;
            document.getElementById('notifDeals').checked      = s.notifDeals  !== false;
            document.getElementById('notifNewsletter').checked = !!s.notifNewsletter;
        }

        function saveSettings() {
            setLS('adomaSettings', {
                notifOrders:     document.getElementById('notifOrders').checked,
                notifDeals:      document.getElementById('notifDeals').checked,
                notifNewsletter: document.getElementById('notifNewsletter').checked,
            });
            showToast('Preferences saved!');
        }

        function confirmDelete() {
            if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                ['adomaProfile','adomaOrders','adomaCart','adomaWishlist','adomaSettings','adomaSaleEndDate'].forEach(k => {
                    try { localStorage.removeItem(k); } catch {}
                });
                showToast('Account deleted. Redirecting...');
                setTimeout(() => window.location.href = 'index.html', 1800);
            }
        }

        // ── Hamburger ──
        const hamburger  = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobile-menu');
        hamburger.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = mobileMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        });
        document.addEventListener('click', e => {
            if (mobileMenu.classList.contains('active') && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // ── Cart icon → back to index ──
        document.getElementById('cartIcon').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        document.getElementById('wishlistIcon').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // ── Init ──
        loadProfile();
        loadStats();
        loadSettings();
        loadRecentOrders();