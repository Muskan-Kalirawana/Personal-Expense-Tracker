/**
 * SpendWise — New Transaction Logic (Member 2: Frontend Logic)
 * Drop into new-transaction.html as: <script src="transaction.js"></script>
 * Requires: data.js, validation.js  (load those first)
 */

document.addEventListener('DOMContentLoaded', () => {

    SpendWiseDB.init();

    // Set today's date as default
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    const form      = document.querySelector('.transaction-form');
    const saveBtn   = form.querySelector('button[type="submit"]');
    const cancelBtn = form.querySelector('.btn-secondary');

    // Live validation on blur
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => _liveValidate(field));
        field.addEventListener('input', () => {
            if (field.style.borderColor === 'rgb(239, 68, 68)') _liveValidate(field);
        });
    });

    function _liveValidate(field) {
        const type = field.type;
        if (type === 'text') Validator.validate(field, [Validator.rules.required, Validator.rules.minLength(2)]);
        if (type === 'number') Validator.validate(field, [Validator.rules.required, Validator.rules.positiveNumber]);
    }

    // Override the existing onsubmit (set on the form element inline)
    form.onsubmit = null;
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!Validator.validateTransaction(form)) return;

        const title    = form.querySelector('input[type="text"]').value.trim();
        const amount   = parseFloat(form.querySelector('input[type="number"]').value);
        const type     = form.querySelector('select:nth-of-type(1)').value === 'income' ? 'income' : 'expense';
        const category = form.querySelector('select:nth-of-type(2)').value;
        const date     = form.querySelector('input[type="date"]').value;
        const notes    = form.querySelector('textarea')?.value.trim() || '';

        // Animate button
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled    = true;

        setTimeout(() => {
            SpendWiseDB.add({ title, amount, type, category, date, notes });
            _showToast('✅ Transaction saved!');
            setTimeout(() => { window.location.href = 'side-bar.html'; }, 800);
        }, 400);
    });

    // ── Toast notification ───────────────────────────────────────────────────
    function _showToast(msg) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.cssText = `
            position:fixed; bottom:30px; right:30px; background:#10b981; color:white;
            padding:14px 22px; border-radius:12px; font-weight:600; font-size:0.9rem;
            box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:9999;
            animation: slideIn 0.3s ease;
        `;
        const style = document.createElement('style');
        style.textContent = `@keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }`;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
