const CURRENCY = 'GH₵';

//data
function getOrders() {
    try {
        return JSON.parse(localStorage.getItem('adomaOrders') || '[]');
    } catch(e) { return []; }
}

function saveOrders(orders) {
    try {
        localStorage.setItem('adomaOrders', JSON.stringify(orders));
    } catch(e) {}
}

// Seed demo data if no orders exist
function seedDemoData() {
    const existing = getOrders();
    if (existing.length > 0) return;

    const names   = ['Akosua Mensah','Kwame Asante','Ama Boateng','Kofi Agyeman','Adwoa Darko','Nana Yaw','Efua Tetteh','Esi Owusu'];
    const emails  = ['akosua@gmail.com','kwame@yahoo.com','ama@gmail.com','kofi@hotmail.com','adwoa@gmail.com','nana@gmail.com','efua@yahoo.com','esi@gmail.com'];
    const phones  = ['+233244567890','+233204321567','+233273456789','+233244678901','+233201234567','+233244112233','+233279876543','+233244567123'];
    const cities  = ['Accra','Tema','Kumasi','Accra','Accra','Tema','Accra','Kumasi'];
    const methods = ['card','mobile','cash','mobile','card','cash','mobile','card'];
    const statuses= ['delivered','delivered','pending','processing','delivered','pending','delivered','cancelled'];
    const times   = ['morning','afternoon','evening','morning','afternoon','morning','evening','afternoon'];
    const items   = [
        [{id:1,name:'Organic Bananas',price:9.99,quantity:2,image:'https://images.pexels.com/photos/1166648/pexels-photo-1166648.jpeg?w=60'},{id:2,name:'Farm Fresh Eggs',price:24.99,quantity:1,image:''}],
        [{id:8,name:'Milo Tin (400g)',price:35.99,quantity:1,image:''},{id:6,name:'Pork Sausages',price:28.99,quantity:1,image:''}],
        [{id:4,name:'Fresh Apples',price:15.99,quantity:3,image:''}],
        [{id:3,name:'Ideal Milk',price:13.49,quantity:2,image:''},{id:7,name:'Nestlé Cerelac',price:42.99,quantity:1,image:''}],
        [{id:12,name:'Chicken Thighs',price:38.99,quantity:2,image:''}],
        [{id:5,name:'Sliced Bread',price:8.99,quantity:1,image:''},{id:9,name:'Pineapple',price:7.99,quantity:1,image:''}],
        [{id:11,name:'Fresh Tomatoes',price:6.50,quantity:4,image:''},{id:4,name:'Fresh Apples',price:15.99,quantity:1,image:''}],
        [{id:8,name:'Milo Tin',price:35.99,quantity:2,image:''}]
    ];

    const now = Date.now();
    const orders = names.map((name, i) => {
        const subtotal = items[i].reduce((t, x) => t + x.price * x.quantity, 0);
        const delivery = subtotal > 50 ? 0 : 15;
        return {
            orderNumber: 'ADM' + (now - i * 86400000 * (i+1)).toString().slice(-8),
            date: new Date(now - i * 86400000 * (i % 3 + 1)).toISOString(),
            customer: { name, email: emails[i], phone: phones[i] },
            delivery:  { address: `${10+i} Market Rd`, city: cities[i], time: times[i] },
            paymentMethod: methods[i],
            items: items[i],
            subtotal, deliveryFee: delivery, total: subtotal + delivery,
            status: statuses[i]
        };
    });

    saveOrders(orders);
}

//tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

    const tab  = document.getElementById(`tab-${tabId}`);
    const link = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
    if (tab)  tab.classList.add('active');
    if (link) link.classList.add('active');

    const titles = { dashboard:'Dashboard', orders:'Orders', products:'Products', customers:'Customers', analytics:'Analytics', settings:'Settings' };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[tabId] || tabId;

    // Render tab content
    if (tabId === 'dashboard')  renderDashboard();
    if (tabId === 'orders')     renderOrdersTable();
    if (tabId === 'products')   renderProductsTable();
    if (tabId === 'customers')  renderCustomersTable();
    if (tabId === 'analytics')  renderAnalytics();
}

//dashboard
function renderDashboard() {
    const orders = getOrders();

    // KPIs
    const totalRevenue   = orders.filter(o => o.status !== 'cancelled').reduce((t,o) => t + o.total, 0);
    const totalOrders    = orders.length;
    const pendingOrders  = orders.filter(o => o.status === 'pending').length;
    const uniqueCustomers= new Set(orders.map(o => o.customer.email)).size;
    const avgOrder       = totalOrders > 0 ? totalRevenue / orders.filter(o => o.status !== 'cancelled').length : 0;

    const kpis = [
        { icon: 'fa-coins', iconClass: 'green', label: 'Total Revenue', value: `${CURRENCY}${totalRevenue.toFixed(2)}`, change: '+12%', dir: 'up' },
        { icon: 'fa-receipt', iconClass: 'blue', label: 'Total Orders', value: totalOrders, change: '+8%', dir: 'up' },
        { icon: 'fa-clock', iconClass: 'orange', label: 'Pending Orders', value: pendingOrders, change: pendingOrders > 0 ? 'Needs attention' : 'All clear', dir: pendingOrders > 0 ? 'down' : 'up' },
        { icon: 'fa-users', iconClass: 'purple', label: 'Customers', value: uniqueCustomers, change: '+3 this week', dir: 'up' },
        { icon: 'fa-chart-line', iconClass: 'navy', label: 'Avg. Order Value', value: `${CURRENCY}${avgOrder.toFixed(2)}`, change: '+5%', dir: 'up' }
    ];

    document.getElementById('kpiGrid').innerHTML = kpis.map(k => `
        <div class="kpi-card">
            <div class="kpi-icon ${k.iconClass}"><i class="fas ${k.icon}"></i></div>
            <div class="kpi-info">
                <div class="kpi-label">${k.label}</div>
                <div class="kpi-value">${k.value}</div>
                <div class="kpi-change ${k.dir}">
                    <i class="fas fa-arrow-${k.dir}"></i> ${k.change}
                </div>
            </div>
        </div>
    `).join('');

    // Update pending badge
    const badge = document.getElementById('pendingBadge');
    if (badge) { badge.textContent = pendingOrders; badge.style.display = pendingOrders > 0 ? '' : 'none'; }

    // Revenue chart
    renderRevenueChart(orders, 7);

    // Category chart
    renderCategoryChart(orders);

    // Recent orders
    const recent = [...orders].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    document.getElementById('recentOrdersTable').innerHTML = recent.length === 0
        ? emptyState('No orders yet')
        : `<table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${recent.map(o => `
                <tr style="cursor:pointer" onclick="openOrderDetail('${o.orderNumber}')">
                    <td class="td-bold">${o.orderNumber}</td>
                    <td>${escapeHTML(o.customer.name)}</td>
                    <td class="td-bold">${CURRENCY}${o.total.toFixed(2)}</td>
                    <td><span class="status-badge status-${o.status}">${capitalize(o.status)}</span></td>
                    <td>${formatDate(o.date)}</td>
                </tr>`).join('')}
            </tbody>
        </table>`;

    // Top products
    const productSales = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
        o.items.forEach(item => {
            if (!productSales[item.name]) productSales[item.name] = { qty: 0, revenue: 0, image: item.image || '' };
            productSales[item.name].qty += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
        });
    });

    const topProducts = Object.entries(productSales)
        .sort((a,b) => b[1].qty - a[1].qty)
        .slice(0, 6);

    document.getElementById('topProductsList').innerHTML = topProducts.length === 0
        ? emptyState('No data yet')
        : topProducts.map(([name, data]) => `
            <div class="top-product-item">
                <img src="${escapeHTML(data.image) || 'https://placehold.co/40?text=P'}" alt="${escapeHTML(name)}" class="top-product-img"
                     onerror="this.src='https://placehold.co/40?text=P'">
                <div class="top-product-info">
                    <div class="top-product-name">${escapeHTML(name)}</div>
                    <div class="top-product-cat">${data.qty} sold</div>
                </div>
                <div class="top-product-sales">${CURRENCY}${data.revenue.toFixed(2)}</div>
            </div>`).join('');
}

//charts
let revenueChartInst = null;
let categoryChartInst = null;
let paymentChartInst = null;
let deliveryChartInst = null;

function renderRevenueChart(orders, days) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const labels = [];
    const data   = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
        labels.push(label);

        const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        const dayEnd   = new Date(d); dayEnd.setHours(23,59,59,999);

        const rev = orders
            .filter(o => o.status !== 'cancelled' && new Date(o.date) >= dayStart && new Date(o.date) <= dayEnd)
            .reduce((t,o) => t + o.total, 0);

        // Add some demo variance if no real data for that day
        data.push(rev > 0 ? rev : (Math.random() * 200 + 50).toFixed(2) * 1);
    }

    if (revenueChartInst) revenueChartInst.destroy();

    revenueChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Revenue (GH₵)',
                data,
                fill: true,
                borderColor: '#F68048',
                backgroundColor: 'rgba(246,128,72,0.09)',
                borderWidth: 2.5,
                tension: 0.4,
                pointBackgroundColor: '#F68048',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${CURRENCY}${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                    ticks: { callback: v => `${CURRENCY}${v}`, font: { size: 11 } }
                },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

function renderCategoryChart(orders) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const cats = {};
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
        o.items.forEach(item => {
            // Match category from product id
            const cat = getCategoryById(item.id);
            cats[cat] = (cats[cat] || 0) + item.quantity;
        });
    });

    // Demo data if empty
    if (Object.keys(cats).length === 0) {
        cats['Fresh Produce'] = 12; cats['Dairy & Eggs'] = 8; cats['Beverages'] = 10;
        cats['Meat & Poultry'] = 6; cats['Bakery'] = 4; cats['Cereals'] = 5;
    }

    const labels = Object.keys(cats);
    const data   = Object.values(cats);
    const colors = ['#F68048','#0D1A63','#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444'];

    if (categoryChartInst) categoryChartInst.destroy();

    categoryChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } }
            }
        }
    });
}

function getCategoryById(id) {
    const map = {1:'Fresh Produce',2:'Dairy & Eggs',3:'Dairy & Eggs',4:'Fresh Produce',5:'Bakery',
                 6:'Meat & Poultry',7:'Cereals',8:'Beverages',9:'Fresh Produce',10:'Snacks',11:'Fresh Produce',12:'Meat & Poultry'};
    return map[id] || 'Other';
}

//ORDERS TABLE
function renderOrdersTable() {
    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
    let orders = getOrders();

    if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
    }

    orders.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Update pending badge
    const pending = orders.filter(o => o.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    if (badge) { badge.textContent = pending; badge.style.display = pending > 0 ? '' : 'none'; }

    const wrap = document.getElementById('ordersTableWrap');
    if (!wrap) return;

    if (orders.length === 0) {
        wrap.innerHTML = emptyState('No orders found');
        return;
    }

    wrap.innerHTML = `<table>
        <thead>
            <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map(o => `
            <tr>
                <td class="td-bold">${o.orderNumber}</td>
                <td>
                    <div style="font-weight:600;font-size:0.86rem;">${escapeHTML(o.customer.name)}</div>
                    <div style="font-size:0.76rem;color:#888;">${escapeHTML(o.customer.email)}</div>
                </td>
                <td>${o.items.reduce((t,i) => t + i.quantity, 0)} item${o.items.reduce((t,i) => t+i.quantity,0) !== 1 ? 's' : ''}</td>
                <td class="td-bold">${CURRENCY}${o.total.toFixed(2)}</td>
                <td><span style="text-transform:capitalize;">${o.paymentMethod}</span></td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${o.orderNumber}', this.value)">
                        ${['pending','processing','delivered','cancelled'].map(s =>
                            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${capitalize(s)}</option>`
                        ).join('')}
                    </select>
                </td>
                <td style="font-size:0.82rem;color:#888;">${formatDate(o.date)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action" onclick="openOrderDetail('${o.orderNumber}')" title="View details"><i class="fas fa-eye"></i></button>
                        <button class="btn-action danger" onclick="deleteOrder('${o.orderNumber}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function updateOrderStatus(orderNumber, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        order.status = newStatus;
        saveOrders(orders);
        // Refresh dashboard badge
        const pending = orders.filter(o => o.status === 'pending').length;
        const badge = document.getElementById('pendingBadge');
        if (badge) { badge.textContent = pending; badge.style.display = pending > 0 ? '' : 'none'; }
    }
}

function deleteOrder(orderNumber) {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    const orders = getOrders().filter(o => o.orderNumber !== orderNumber);
    saveOrders(orders);
    renderOrdersTable();
}

function openOrderDetail(orderNumber) {
    const order = getOrders().find(o => o.orderNumber === orderNumber);
    if (!order) return;

    document.getElementById('orderDetailTitle').textContent = `Order ${order.orderNumber}`;

    document.getElementById('orderDetailBody').innerHTML = `
        <div class="order-detail-grid">
            <div class="detail-group">
                <label>Customer</label>
                <p>${escapeHTML(order.customer.name)}</p>
            </div>
            <div class="detail-group">
                <label>Email</label>
                <p>${escapeHTML(order.customer.email)}</p>
            </div>
            <div class="detail-group">
                <label>Phone</label>
                <p>${escapeHTML(order.customer.phone)}</p>
            </div>
            <div class="detail-group">
                <label>Status</label>
                <p><span class="status-badge status-${order.status}">${capitalize(order.status)}</span></p>
            </div>
            <div class="detail-group">
                <label>Delivery Address</label>
                <p>${escapeHTML(order.delivery.address)}, ${escapeHTML(order.delivery.city)}</p>
            </div>
            <div class="detail-group">
                <label>Delivery Time</label>
                <p style="text-transform:capitalize;">${order.delivery.time}</p>
            </div>
            <div class="detail-group">
                <label>Payment Method</label>
                <p style="text-transform:capitalize;">${order.paymentMethod}</p>
            </div>
            <div class="detail-group">
                <label>Order Date</label>
                <p>${new Date(order.date).toLocaleString()}</p>
            </div>
        </div>

        <h4 style="margin-bottom:0.6rem;color:var(--navy);font-size:0.88rem;">Items Ordered</h4>
        <div class="order-items-list">
            ${order.items.map(item => `
                <div class="order-item-row">
                    <img src="${escapeHTML(item.image || '')}" alt="${escapeHTML(item.name)}"
                         onerror="this.src='https://placehold.co/38?text=P'">
                    <span style="flex:1;font-weight:600;">${escapeHTML(item.name)}</span>
                    <span style="color:#888;">×${item.quantity}</span>
                    <span style="font-weight:700;color:var(--navy);">${CURRENCY}${(item.price * item.quantity).toFixed(2)}</span>
                </div>`).join('')}
        </div>

        <div class="order-totals-summary">
            <div class="summary-line"><span>Subtotal</span><span>${CURRENCY}${order.subtotal.toFixed(2)}</span></div>
            <div class="summary-line"><span>Delivery Fee</span><span>${order.deliveryFee === 0 ? 'Free' : CURRENCY + order.deliveryFee.toFixed(2)}</span></div>
            <div class="summary-line total"><span>Total</span><span>${CURRENCY}${order.total.toFixed(2)}</span></div>
        </div>`;

    openModal('orderDetailModal', 'orderDetailOverlay');
}

//products table
function getAdminProducts() {
    try {
        const custom = JSON.parse(localStorage.getItem('adomaCustomProducts') || '[]');
        // Merge with base products (injected via script.js products array via window)
        const base = (window._baseProducts || []).map(p => ({ ...p, _base: true }));
        return [...base, ...custom];
    } catch(e) { return window._baseProducts || []; }
}

function renderProductsTable() {
    const products = getAdminProducts();
    const wrap = document.getElementById('productsTableWrap');
    if (!wrap) return;

    wrap.innerHTML = `<table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Old Price</th>
                <th>Badge</th>
                <th>Rating</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${products.map(p => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:0.7rem;">
                        <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" width="38" height="38"
                             style="border-radius:7px;object-fit:cover;"
                             onerror="this.src='https://placehold.co/38?text=P'">
                        <span style="font-weight:600;font-size:0.86rem;">${escapeHTML(p.name)}</span>
                    </div>
                </td>
                <td>${escapeHTML(p.category)}</td>
                <td class="td-bold">${CURRENCY}${p.price.toFixed(2)}</td>
                <td>${p.oldPrice ? `<span style="text-decoration:line-through;color:#bbb;">${CURRENCY}${p.oldPrice.toFixed(2)}</span>` : '—'}</td>
                <td>${p.badge ? `<span class="status-badge status-delivered" style="font-size:0.72rem;">${p.badge}</span>` : '—'}</td>
                <td>⭐ ${p.rating} (${p.reviews})</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-action" onclick="openEditProduct(${p.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        ${!p._base ? `<button class="btn-action danger" onclick="deleteCustomProduct(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                </td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

window.openEditProduct = function(id) {
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    // Pre-fill form if needed
    const p = getAdminProducts().find(x => x.id === id);
    if (!p) return;
    document.getElementById('pName').value      = p.name;
    document.getElementById('pCategory').value  = p.category;
    document.getElementById('pPrice').value     = p.price;
    document.getElementById('pOldPrice').value  = p.oldPrice || '';
    document.getElementById('pBadge').value     = p.badge || '';
    document.getElementById('pImage').value     = p.image || '';
    openModal('productModal', 'productModalOverlay');
};

window.deleteCustomProduct = function(id) {
    if (!confirm('Delete this product?')) return;
    try {
        const custom = JSON.parse(localStorage.getItem('adomaCustomProducts') || '[]');
        const updated = custom.filter(p => p.id !== id);
        localStorage.setItem('adomaCustomProducts', JSON.stringify(updated));
        renderProductsTable();
    } catch(e) {}
};

//customer table
function renderCustomersTable() {
    const orders = getOrders();
    const customerMap = {};

    orders.forEach(o => {
        const email = o.customer.email;
        if (!customerMap[email]) {
            customerMap[email] = { ...o.customer, orders: 0, totalSpent: 0, lastOrder: o.date };
        }
        customerMap[email].orders++;
        if (o.status !== 'cancelled') customerMap[email].totalSpent += o.total;
        if (new Date(o.date) > new Date(customerMap[email].lastOrder)) {
            customerMap[email].lastOrder = o.date;
        }
    });

    const customers = Object.values(customerMap);
    const wrap = document.getElementById('customersTableWrap');
    if (!wrap) return;

    if (customers.length === 0) {
        wrap.innerHTML = emptyState('No customers yet');
        return;
    }

    customers.sort((a,b) => b.totalSpent - a.totalSpent);

    wrap.innerHTML = `<table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
            </tr>
        </thead>
        <tbody>
            ${customers.map((c, i) => `
            <tr>
                <td style="color:#bbb;font-size:0.8rem;">${i+1}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--navy);color:white;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:700;flex-shrink:0;">
                            ${escapeHTML(c.name.charAt(0).toUpperCase())}
                        </div>
                        <span style="font-weight:600;">${escapeHTML(c.name)}</span>
                    </div>
                </td>
                <td style="color:#888;">${escapeHTML(c.email)}</td>
                <td>${escapeHTML(c.phone)}</td>
                <td>${c.orders}</td>
                <td class="td-bold">${CURRENCY}${c.totalSpent.toFixed(2)}</td>
                <td style="font-size:0.82rem;color:#888;">${formatDate(c.lastOrder)}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

//analytics
function renderAnalytics() {
    const orders = getOrders();
    const completed = orders.filter(o => o.status !== 'cancelled');

    // KPIs
    const totalRev = completed.reduce((t,o) => t+o.total, 0);
    const freeDeliveryCount = completed.filter(o => o.deliveryFee === 0).length;
    const deliveryRevenue   = completed.reduce((t,o) => t+o.deliveryFee, 0);
    const conversionRate    = orders.length > 0 ? ((completed.length / orders.length) * 100).toFixed(1) : 0;

    document.getElementById('analyticsKpiGrid').innerHTML = [
        { icon:'fa-coins',       iconClass:'green',  label:'Total Revenue (completed)',  value:`${CURRENCY}${totalRev.toFixed(2)}` },
        { icon:'fa-truck',       iconClass:'blue',   label:'Free Delivery Orders',       value:freeDeliveryCount },
        { icon:'fa-money-bill',  iconClass:'orange', label:'Delivery Revenue',           value:`${CURRENCY}${deliveryRevenue.toFixed(2)}` },
        { icon:'fa-percent',     iconClass:'purple', label:'Completion Rate',            value:`${conversionRate}%` }
    ].map(k => `
        <div class="kpi-card">
            <div class="kpi-icon ${k.iconClass}"><i class="fas ${k.icon}"></i></div>
            <div class="kpi-info">
                <div class="kpi-label">${k.label}</div>
                <div class="kpi-value">${k.value}</div>
            </div>
        </div>`).join('');

    // Payment chart
    const paymentCtx = document.getElementById('paymentChart');
    if (paymentCtx) {
        const pm = { card: 0, mobile: 0, cash: 0 };
        completed.forEach(o => { if (pm[o.paymentMethod] !== undefined) pm[o.paymentMethod]++; });
        if (paymentChartInst) paymentChartInst.destroy();
        paymentChartInst = new Chart(paymentCtx, {
            type: 'bar',
            data: {
                labels: ['Card', 'Mobile Money', 'Cash on Delivery'],
                datasets: [{
                    label: 'Orders',
                    data: [pm.card, pm.mobile, pm.cash],
                    backgroundColor: ['#3b82f6','#22c55e','#F68048'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Delivery time chart
    const delivCtx = document.getElementById('deliveryChart');
    if (delivCtx) {
        const dt = { morning: 0, afternoon: 0, evening: 0 };
        completed.forEach(o => { if (dt[o.delivery.time] !== undefined) dt[o.delivery.time]++; });
        if (deliveryChartInst) deliveryChartInst.destroy();
        deliveryChartInst = new Chart(delivCtx, {
            type: 'doughnut',
            data: {
                labels: ['Morning', 'Afternoon', 'Evening'],
                datasets: [{
                    data: [dt.morning, dt.afternoon, dt.evening],
                    backgroundColor: ['#f59e0b','#F68048','#0D1A63'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
            }
        });
    }
}

//modal helpers
function openModal(modalId, overlayId) {
    const modal   = document.getElementById(modalId);
    const overlay = document.getElementById(overlayId);
    if (!modal) return;
    modal.style.display = 'block';
    if (overlay) overlay.classList.add('active');
    requestAnimationFrame(() => modal.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId, overlayId) {
    const modal   = document.getElementById(modalId);
    const overlay = document.getElementById(overlayId);
    if (!modal) return;
    modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 280);
    document.body.style.overflow = '';
}

//EXPORT CSV
function exportOrdersCSV() {
    const orders = getOrders();
    const headers = ['Order #','Date','Customer Name','Email','Phone','City','Payment','Items','Subtotal','Delivery Fee','Total','Status'];
    const rows = orders.map(o => [
        o.orderNumber,
        new Date(o.date).toLocaleDateString(),
        o.customer.name,
        o.customer.email,
        o.customer.phone,
        o.delivery.city,
        o.paymentMethod,
        o.items.map(i => `${i.name}×${i.quantity}`).join('; '),
        o.subtotal.toFixed(2),
        o.deliveryFee.toFixed(2),
        o.total.toFixed(2),
        o.status
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `adoma-orders-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
}

//UTILITIES 
function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function emptyState(msg) {
    return `<div class="empty-state"><i class="fas fa-inbox"></i><p>${msg}</p></div>`;
}

// INIT 
document.addEventListener('DOMContentLoaded', function() {

    seedDemoData();

    // Date in topbar
    const dateEl = document.getElementById('topbarDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    }

    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle')?.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        document.getElementById('mainContent')?.classList.toggle('sidebar-collapsed');
    });

    // Mobile sidebar
    document.getElementById('mobileSidebarBtn')?.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const btn = document.getElementById('mobileSidebarBtn');
            if (!sidebar.contains(e.target) && !btn?.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Sidebar nav links
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this.dataset.tab);
            if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');
        });
    });

    // Close modals
    document.getElementById('closeOrderDetail')?.addEventListener('click', () => closeModal('orderDetailModal','orderDetailOverlay'));
    document.getElementById('orderDetailOverlay')?.addEventListener('click', () => closeModal('orderDetailModal','orderDetailOverlay'));
    document.getElementById('closeProductModal')?.addEventListener('click', () => closeModal('productModal','productModalOverlay'));
    document.getElementById('productModalOverlay')?.addEventListener('click', () => closeModal('productModal','productModalOverlay'));

    // Order status filter
    document.getElementById('orderStatusFilter')?.addEventListener('change', renderOrdersTable);

    // Export orders
    document.getElementById('exportOrdersBtn')?.addEventListener('click', exportOrdersCSV);

    // Add product
    document.getElementById('addProductBtn')?.addEventListener('click', function() {
        document.getElementById('productModalTitle').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        openModal('productModal','productModalOverlay');
    });

    // Product form submit
    document.getElementById('productForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name     = document.getElementById('pName').value.trim();
        const category = document.getElementById('pCategory').value;
        const price    = parseFloat(document.getElementById('pPrice').value);
        const oldPrice = document.getElementById('pOldPrice').value ? parseFloat(document.getElementById('pOldPrice').value) : null;
        const badge    = document.getElementById('pBadge').value || null;
        const image    = document.getElementById('pImage').value || 'https://placehold.co/300x200?text=Product';

        if (!name || isNaN(price)) return alert('Name and price are required.');

        const custom = JSON.parse(localStorage.getItem('adomaCustomProducts') || '[]');
        custom.push({
            id: Date.now(),
            name, category, price, oldPrice, badge, image,
            rating: 4.0, reviews: 0, featured: false
        });
        localStorage.setItem('adomaCustomProducts', JSON.stringify(custom));

        closeModal('productModal','productModalOverlay');
        renderProductsTable();
    });

    // Refresh button
    document.getElementById('refreshBtn')?.addEventListener('click', function() {
        this.querySelector('i').style.animation = 'spin 0.6s linear';
        const activeTab = document.querySelector('.tab-content.active')?.id?.replace('tab-','') || 'dashboard';
        switchTab(activeTab);
        setTimeout(() => {
            if (this.querySelector('i')) this.querySelector('i').style.animation = '';
        }, 700);
    });

    // Period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderRevenueChart(getOrders(), parseInt(this.dataset.period));
        });
    });

    // Settings: clear orders
    document.getElementById('clearOrdersBtn')?.addEventListener('click', function() {
        if (confirm('This will delete ALL orders. Continue?')) {
            localStorage.removeItem('adomaOrders');
            alert('All orders cleared.');
        }
    });

    document.getElementById('clearAllDataBtn')?.addEventListener('click', function() {
        if (confirm('This will clear ALL store data including orders, cart, and custom products. Continue?')) {
            ['adomaOrders','adomaCart','adomaCustomProducts','adomaSubs'].forEach(k => localStorage.removeItem(k));
            alert('All data cleared. Demo data will reload on next visit.');
            location.reload();
        }
    });

    // Save settings buttons
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.type === 'submit') return;
            e.preventDefault();
            const orig = this.textContent;
            this.innerHTML = '<i class="fas fa-check"></i> Saved!';
            this.style.background = 'var(--success)';
            setTimeout(() => {
                this.textContent = orig;
                this.style.background = '';
            }, 1800);
        });
    });

    // Add spin keyframe dynamically
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    // Store base products reference for admin products table
    // We load products from localStorage if available
    window._baseProducts = [
        {id:1,name:'Organic Bananas',category:'Fresh Produce',price:9.99,oldPrice:12.99,rating:4.5,reviews:128,image:'images/banana.jpg',badge:'Sale'},
        {id:2,name:'Farm Fresh Eggs (Tray of 30)',category:'Dairy & Eggs',price:24.99,oldPrice:null,rating:4.8,reviews:256,image:'images/eggs.jpg',badge:'Best Seller'},
        {id:3,name:'Ideal Milk (Tin)',category:'Dairy & Eggs',price:13.49,oldPrice:15.99,rating:4.3,reviews:98,image:'images/milk.jpg',badge:'Sale'},
        {id:4,name:'Fresh Apples (1kg)',category:'Fresh Produce',price:15.99,oldPrice:null,rating:4.6,reviews:189,image:'images/apples.jpg',badge:'Fresh'},
        {id:5,name:'Sliced Bread Loaf',category:'Bakery',price:8.99,oldPrice:11.99,rating:4.4,reviews:67,image:'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?w=300',badge:'Sale'},
        {id:6,name:'Pork Sausages (500g)',category:'Meat & Poultry',price:28.99,oldPrice:34.99,rating:4.7,reviews:145,image:'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=300',badge:'Fresh'},
        {id:7,name:'Nestlé Cerelac (400g)',category:'Cereals',price:42.99,oldPrice:47.99,rating:4.7,reviews:135,image:'images/cere.jpg',badge:'Best Seller'},
        {id:8,name:'Milo Tin (400g)',category:'Beverages',price:35.99,oldPrice:39.99,rating:4.9,reviews:312,image:'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=300',badge:'Best Seller'},
        {id:9,name:'Pineapple (Whole)',category:'Fresh Produce',price:7.99,oldPrice:null,rating:4.5,reviews:88,image:'https://images.pexels.com/photos/947879/pexels-photo-947879.jpeg?w=300',badge:'Fresh'},
        {id:10,name:'Tom Tom Candy (Pack)',category:'Snacks',price:3.99,oldPrice:null,rating:4.2,reviews:55,image:'https://images.pexels.com/photos/1120575/pexels-photo-1120575.jpeg?w=300',badge:'New'},
        {id:11,name:'Fresh Tomatoes (500g)',category:'Fresh Produce',price:6.50,oldPrice:null,rating:4.6,reviews:201,image:'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?w=300',badge:'Fresh'},
        {id:12,name:'Chicken Thighs (1kg)',category:'Meat & Poultry',price:38.99,oldPrice:44.99,rating:4.8,reviews:178,image:'https://images.pexels.com/photos/4110461/pexels-photo-4110461.jpeg?w=300',badge:'Sale'}
    ];

    // Init dashboard
    switchTab('dashboard');
});
