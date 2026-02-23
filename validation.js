/**
 * SpendWise — Form Validation (Member 2: Frontend Logic)
 * Client-side validation for all forms.
 */

const Validator = (() => {

    // ─── Rules ───────────────────────────────────────────────────────────────
    const rules = {
        required: (v) => v.trim() !== '' || 'This field is required.',
        minLength: (n) => (v) => v.trim().length >= n || `Minimum ${n} characters required.`,
        maxLength: (n) => (v) => v.trim().length <= n || `Maximum ${n} characters allowed.`,
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
        positiveNumber: (v) => (Number(v) > 0) || 'Enter a positive number.',
        dateNotFuture: (v) => {
            const d = new Date(v);
            return d <= new Date() || 'Date cannot be in the future.';
        },
    };

    // ─── Core validator ───────────────────────────────────────────────────────
    /**
     * @param {HTMLElement} field  - The input element
     * @param {Function[]}  fns    - Array of rule functions from `rules`
     * @returns {boolean}
     */
    function validate(field, fns) {
        let errorMsg = null;
        for (const fn of fns) {
            const result = fn(field.value);
            if (result !== true) { errorMsg = result; break; }
        }
        _setError(field, errorMsg);
        return !errorMsg;
    }

    function _setError(field, msg) {
        // Remove existing error
        const existing = field.parentElement.querySelector('.sw-error');
        if (existing) existing.remove();
        field.style.borderColor = '';

        if (msg) {
            field.style.borderColor = '#ef4444';
            const err = document.createElement('p');
            err.className = 'sw-error';
            err.style.cssText = 'color:#ef4444;font-size:0.78rem;margin:4px 0 0;text-align:left;';
            err.textContent = msg;
            field.parentElement.appendChild(err);
        } else {
            field.style.borderColor = '#10b981';
        }
    }

    function clearErrors(formEl) {
        formEl.querySelectorAll('.sw-error').forEach(e => e.remove());
        formEl.querySelectorAll('input, select, textarea').forEach(f => f.style.borderColor = '');
    }

    // ─── Specific form validators ─────────────────────────────────────────────

    function validateLogin(formEl) {
        const username = formEl.querySelector('input[type="text"]');
        const password = formEl.querySelector('input[type="password"]');
        clearErrors(formEl);

        const ok1 = validate(username, [rules.required, rules.minLength(3)]);
        const ok2 = validate(password, [rules.required, rules.minLength(6)]);
        return ok1 && ok2;
    }

    function validateSignup(formEl) {
        const username = formEl.querySelector('input[type="text"]');
        const password = formEl.querySelector('input[type="password"]');
        clearErrors(formEl);

        const ok1 = validate(username, [rules.required, rules.minLength(3), rules.maxLength(20)]);
        const ok2 = validate(password, [rules.required, rules.minLength(6)]);
        return ok1 && ok2;
    }

    function validateTransaction(formEl) {
        clearErrors(formEl);

        const title    = formEl.querySelector('input[type="text"]');
        const amount   = formEl.querySelector('input[type="number"]');
        const date     = formEl.querySelector('input[type="date"]');

        const ok1 = validate(title,  [rules.required, rules.minLength(2)]);
        const ok2 = validate(amount, [rules.required, rules.positiveNumber]);
        const ok3 = date ? validate(date, [rules.required]) : true;

        return ok1 && ok2 && ok3;
    }

    return { rules, validate, validateLogin, validateSignup, validateTransaction, clearErrors };
})();
