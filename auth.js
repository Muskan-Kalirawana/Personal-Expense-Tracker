/**
 * SpendWise — Auth Logic (Member 2: Frontend Logic)
 * Drop into login.html AND sign-up.html as: <script src="auth.js"></script>
 * Requires: data.js, validation.js  (load those first)
 */

document.addEventListener('DOMContentLoaded', () => {

    SpendWiseDB.init();

    const form       = document.querySelector('form');
    const submitBtn  = document.querySelector('.btn-primary');
    const isSignup   = document.title.toLowerCase().includes('sign');

    if (!form || !submitBtn) return;

    // Remove old inline onclick so our handler takes over
    submitBtn.onclick = null;

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const isValid = isSignup
            ? Validator.validateSignup(form)
            : Validator.validateLogin(form);

        if (!isValid) return;

        const username = form.querySelector('input[type="text"]').value.trim();

        // Animate
        submitBtn.textContent = isSignup ? 'Creating account...' : 'Logging in...';
        submitBtn.disabled = true;

        setTimeout(() => {
            SpendWiseDB.setUser(username);
            window.location.href = 'side-bar.html';
        }, 600);
    });

    // Logout: called from dashboard
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            SpendWiseDB.clearUser();
            window.location.href = 'landing-page.html';
        });
    }
});
