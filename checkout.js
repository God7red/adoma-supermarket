// NOTE: script.js is loaded first and provides the shared `cart` array and
// getCartTotals(), escapeHTML(), and saveCart() helpers

const CURRENCY = 'GH₵';

//give order summary
function renderSummary() {
    const orderItemsEl  = document.getElementById('orderItems');
    const orderTotalsEl = document.getElementById('orderTotals');
    if (!orderItemsEl || !orderTotalsEl) return;

    if (cart.length === 0) {
        orderItemsEl.innerHTML = '<p style="text-align:center;color:#aaa;padding:1rem;font-size:0.9rem;">No items in cart</p>';
        orderTotalsEl.innerHTML = '';
        return;
    }

    orderItemsEl.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${escapeHTML(item.image)}"
                 alt="${escapeHTML(item.name)}"
                 class="order-item-img"
                 loading="lazy"
                 onerror="this.src='https://placehold.co/52x52?text=Item'">
            <div class="order-item-details">
                <div class="order-item-name">${escapeHTML(item.name)}</div>
                <div class="order-item-qty">Qty: ${item.quantity} &times; ${CURRENCY}${item.price.toFixed(2)}</div>
            </div>
            <div class="order-item-price">${CURRENCY}${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    const { subtotal, delivery, total } = getCartTotals();
    const deliveryDisplay = delivery === 0
        ? `<span class="free-delivery-badge"><i class="fas fa-check" aria-hidden="true"></i> Free</span>`
        : `${CURRENCY}${delivery.toFixed(2)}`;

    const itemCount = cart.reduce((t, i) => t + i.quantity, 0);
    orderTotalsEl.innerHTML = `
        <div class="totals-row">
            <span>Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})</span>
            <span>${CURRENCY}${subtotal.toFixed(2)}</span>
        </div>
        <div class="totals-row">
            <span>Delivery</span>
            <span>${deliveryDisplay}</span>
        </div>
        <div class="totals-row grand-total">
            <span>Total</span>
            <span>${CURRENCY}${total.toFixed(2)}</span>
        </div>
    `;
}

//for validating form
function validateField(id, errorId, testFn) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errorId);
    if (!el || !err) return true;
    const valid = testFn(el.value.trim());
    el.classList.toggle('error', !valid);
    err.classList.toggle('visible', !valid);
    return valid;
}

function validateForm() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const v1 = validateField('fullName', 'fullNameError', v => v.length >= 2);
    const v2 = validateField('email',    'emailError',    v => emailRegex.test(v));
    const v3 = validateField('phone',    'phoneError',    v => v.length >= 7);
    const v4 = validateField('address',  'addressError',  v => v.length >= 5);
    const v5 = validateField('city',     'cityError',     v => v.length >= 2);
    return v1 && v2 && v3 && v4 && v5;
}

//place order
function placeOrder() {
    if (!validateForm()) return;

    const btn = document.getElementById('placeOrderBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…'; }

    const selectedPayment = document.querySelector('.payment-method.selected');
    const { subtotal, delivery, total } = getCartTotals();
    const orderNumber = 'ADM' + Date.now().toString().slice(-8);

    const order = {
        orderNumber,
        date: new Date().toISOString(),
        customer: {
            name:  document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim()
        },
        delivery: {
            address: document.getElementById('address').value.trim(),
            city:    document.getElementById('city').value.trim(),
            time:    document.getElementById('deliveryTime').value
        },
        paymentMethod: selectedPayment ? selectedPayment.dataset.method : 'cash',
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal,
        deliveryFee: delivery,
        total
    };

    try {
        const orders = JSON.parse(localStorage.getItem('adomaOrders') || '[]');
        orders.push(order);
        localStorage.setItem('adomaOrders', JSON.stringify(orders));
        localStorage.removeItem('adomaCart');
    } catch (e) {
        console.warn('Could not save order:', e);
    }

    // Show success screen
    document.getElementById('checkoutContent').style.display = 'none';
    const successWrapper = document.getElementById('successWrapper');
    successWrapper.style.display = 'block';
    document.getElementById('orderNumberDisplay').textContent = orderNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//Init
document.addEventListener('DOMContentLoaded', function () {

    // Show empty state or give summary
    if (cart.length === 0) {
        document.getElementById('emptyState').style.display       = 'block';
        document.getElementById('checkoutFormCard').style.display = 'none';
        document.getElementById('summaryArea').style.display      = 'none';
    } else {
        renderSummary();
    }

    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        const select = function () {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('selected');
                m.setAttribute('aria-checked', 'false');
            });
            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');
        };
        method.addEventListener('click', select);
        method.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select.call(this); }
        });
    });

    // Live validation on blur + clear on input
    const fields = [
        { id: 'fullName', errorId: 'fullNameError', test: v => v.length >= 2 },
        { id: 'email',    errorId: 'emailError',    test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: 'phone',    errorId: 'phoneError',    test: v => v.length >= 7 },
        { id: 'address',  errorId: 'addressError',  test: v => v.length >= 5 },
        { id: 'city',     errorId: 'cityError',     test: v => v.length >= 2 }
    ];

    fields.forEach(({ id, errorId, test }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur',  () => validateField(id, errorId, test));
        el.addEventListener('input', () => {
            el.classList.remove('error');
            document.getElementById(errorId).classList.remove('visible');
        });
    });

    // Place order button
    const btn = document.getElementById('placeOrderBtn');
    if (btn) btn.addEventListener('click', placeOrder);
});