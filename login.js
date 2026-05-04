'use strict';

//helpers
function $(id) { return document.getElementById(id); }

function showError(id, show) {
    const el = $(id);
    if (!el) return;
    el.classList.toggle('visible', show);
    // also mark the sibling input
    const wrap = el.previousElementSibling;
    if (wrap) {
        const input = wrap.querySelector('input');
        if (input) input.classList.toggle('error', show);
    }
}

function setBanner(id, msg) {
    const el = $(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('visible', !!msg);
}

function setLoading(btnId, loading) {
    const btn = $(btnId);
    if (!btn) return;
    btn.disabled = loading;
    if (loading) {
        btn.dataset.orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait…';
    } else {
        btn.innerHTML = btn.dataset.orig || btn.innerHTML;
    }
}

//tab switcher
window.showTab = function (tab) {
    ['loginSection', 'registerSection', 'forgotSection'].forEach(id => {
        const el = $(id);
        if (el) el.style.display = 'none';
    });
    ['loginTab', 'registerTab'].forEach(id => {
        const el = $(id);
        if (el) el.classList.remove('active');
    });

    const sections = { login: 'loginSection', register: 'registerSection', forgot: 'forgotSection' };
    const tabs     = { login: 'loginTab',     register: 'registerTab' };
    const section  = $(sections[tab]);
    if (section) section.style.display = 'block';
    const tabEl = $(tabs[tab]);
    if (tabEl) tabEl.classList.add('active');
};

window.showForgot = function (e) {
    if (e) e.preventDefault();
    showTab('forgot');
};

//password toggle
window.togglePw = function (inputId, btn) {
    const input = $(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
};

//password strength
function checkStrength(pw) {
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw))    score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const regPwInput = $('regPassword');
if (regPwInput) {
    regPwInput.addEventListener('input', function () {
        const pw      = this.value;
        const wrap    = $('pwStrength');
        const fill    = $('strengthFill');
        const label   = $('strengthLabel');
        if (!wrap || !fill || !label) return;

        if (!pw) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'flex';

        const score = checkStrength(pw);
        const data = [
            { label: 'Very weak', color: '#f44336', pct: 20 },
            { label: 'Weak',      color: '#ff9800', pct: 40 },
            { label: 'Fair',      color: '#ffc107', pct: 60 },
            { label: 'Good',      color: '#8bc34a', pct: 80 },
            { label: 'Strong',    color: '#4caf50', pct: 100 },
        ][Math.min(score - 1, 4)] || { label: 'Very weak', color: '#f44336', pct: 20 };

        fill.style.width      = data.pct + '%';
        fill.style.background = data.color;
        label.textContent     = data.label;
        label.style.color     = data.color;
    });
}

// get or save users
function getUsers() {
    try { return JSON.parse(localStorage.getItem('adomaUsers') || '[]'); } catch { return []; }
}

function saveUsers(users) {
    localStorage.setItem('adomaUsers', JSON.stringify(users));
}

function setLoggedIn(user) {
    localStorage.setItem('adomaLoggedIn', JSON.stringify({
        id:        user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        phone:     user.phone || ''
    }));
}

//redirect after login
function redirectAfterLogin() {
    const dest = localStorage.getItem('adomaRedirectAfterLogin') || 'index.html';
    localStorage.removeItem('adomaRedirectAfterLogin');
    window.location.href = dest;
}

//show success
function showSuccess(title, msg) {
    ['loginSection', 'registerSection', 'forgotSection'].forEach(id => {
        const el = $(id);
        if (el) el.style.display = 'none';
    });
    const tabs = $('loginTab')?.closest('.auth-tabs');
    if (tabs) tabs.style.display = 'none';

    const success = $('authSuccess');
    if (success) success.style.display = 'block';
    if ($('successTitle')) $('successTitle').textContent  = title;
    if ($('successMsg'))   $('successMsg').textContent    = msg;
}

//guest checkout
window.guestCheckout = function () {
    const dest = localStorage.getItem('adomaRedirectAfterLogin') || 'index.html';
    localStorage.removeItem('adomaRedirectAfterLogin');
    window.location.href = dest;
};

//login form
const loginForm = $('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        setBanner('loginErrorBanner', '');

        const email = $('loginEmail').value.trim();
        const pw    = $('loginPassword').value;
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let valid = true;
        if (!emailRx.test(email)) { showError('loginEmailError', true);    valid = false; }
        else                       { showError('loginEmailError', false); }
        if (pw.length < 6)         { showError('loginPasswordError', true); valid = false; }
        else                       { showError('loginPasswordError', false); }

        if (!valid) return;

        setLoading('loginBtn', true);

        setTimeout(() => {
            const users = getUsers();
            const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pw);

            if (!user) {
                setLoading('loginBtn', false);
                setBanner('loginErrorBanner', 'Invalid email or password. Please try again.');
                return;
            }

            setLoggedIn(user);
            showSuccess(`Welcome back, ${user.firstName}!`, 'Signing you in and redirecting…');
            setTimeout(redirectAfterLogin, 1500);
        }, 800);
    });

    // Clear errors on input
    ['loginEmail', 'loginPassword'].forEach(id => {
        const el = $(id);
        if (el) el.addEventListener('input', () => {
            el.classList.remove('error');
            const errEl = el.closest('.field-group')?.querySelector('.field-error');
            if (errEl) errEl.classList.remove('visible');
            setBanner('loginErrorBanner', '');
        });
    });
}

//register form
const registerForm = $('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        setBanner('registerErrorBanner', '');

        const firstName = $('regFirstName').value.trim();
        const lastName  = $('regLastName').value.trim();
        const email     = $('regEmail').value.trim();
        const phone     = $('regPhone').value.trim();
        const pw        = $('regPassword').value;
        const pwConf    = $('regConfirmPassword').value;
        const agreed    = $('agreeTerms').checked;
        const emailRx   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let valid = true;

        const checks = [
            ['regFirstNameError',      firstName.length >= 2],
            ['regLastNameError',       lastName.length >= 2],
            ['regEmailError',          emailRx.test(email)],
            ['regPhoneError',          phone.length >= 7],
            ['regPasswordError',       pw.length >= 6],
            ['regConfirmPasswordError', pw === pwConf],
            ['termsError',             agreed],
        ];

        checks.forEach(([errId, ok]) => {
            showError(errId, !ok);
            if (!ok) valid = false;
        });

        if (!valid) return;

        // Check email not already in use
        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            setBanner('registerErrorBanner', 'An account with this email already exists. Please sign in.');
            return;
        }

        setLoading('registerBtn', true);

        setTimeout(() => {
            const newUser = {
                id:        'U' + Date.now(),
                firstName,
                lastName,
                email,
                phone,
                password: pw,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);
            setLoggedIn(newUser);

            showSuccess(`Welcome, ${firstName}!`, 'Account created! Redirecting you now…');
            setTimeout(redirectAfterLogin, 1500);
        }, 900);
    });

    // Clear errors on input
    ['regFirstName','regLastName','regEmail','regPhone','regPassword','regConfirmPassword'].forEach(id => {
        const el = $(id);
        if (el) el.addEventListener('input', () => {
            el.classList.remove('error');
            const errEl = el.closest('.field-group')?.querySelector('.field-error');
            if (errEl) errEl.classList.remove('visible');
            setBanner('registerErrorBanner', '');
        });
    });
}

//forgot password form
const forgotForm = $('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email   = $('forgotEmail').value.trim();
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(email)) { showError('forgotEmailError', true); return; }
        showError('forgotEmailError', false);

        showSuccess('Check your email!', `A password reset link has been sent to ${email}`);
    });
}

//auto check login state
document.addEventListener('DOMContentLoaded', function () {
    const loggedIn = localStorage.getItem('adomaLoggedIn');
    if (loggedIn) {
        // Already logged in — redirect straight away
        redirectAfterLogin();
    }

    // Show login tab by default
    showTab('login');
});
