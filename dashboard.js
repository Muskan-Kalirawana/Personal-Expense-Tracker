/**
 * SpendWise — Dashboard Logic (Member 2: Frontend Logic)
 * Drop this into side-bar.html as: <script src="dashboard.js"></script>
 * Requires: data.js, charts.js  (load those first)
 */

document.addEventListener('DOMContentLoaded', () => {

    SpendWiseDB.init();

    // ── 1. Populate username from session ────────────────────────────────────
    const user = SpendWiseDB.getUser();
    const userLabel = document.querySelector('#sidebar .nav-item .nav-icon + *') 
                   || [...document.querySelectorAll('.nav-item')].find(el => el.textContent.includes('UserName'));
    if (userLabel && user) {
        userLabel.innerHTML = `<span class="nav-icon">👤</span> ${user.name}`;
    }

    // ── 2. Update stat cards with real totals ────────────────────────────────
    const expenses   = SpendWiseDB.getExpenses();
    const incomeList = SpendWiseDB.getIncome();

    const now       = new Date();
    const thisMonth = (t) => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const monthlyExp = expenses.filter(thisMonth).reduce((s, t) => s + Number(t.amount), 0);
    const monthlyInc = incomeList.filter(thisMonth).reduce((s, t) => s + Number(t.amount), 0);
    const balance    = SpendWiseDB.totalFor(incomeList) - SpendWiseDB.totalFor(expenses);

    const cards = document.querySelectorAll('.card');
    if (cards.length >= 3) {
        cards[0].querySelector('.card-amount').textContent = '$' + balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        cards[1].querySelector('.card-amount').textContent = '+$' + monthlyInc.toLocaleString('en-US', { minimumFractionDigits: 2 });
        cards[2].querySelector('.card-amount').textContent = '-$' + monthlyExp.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    // ── 3. Render trend chart (default 7 days) ────────────────────────────────
    Charts.renderTrendChart('financeChart', 7);

    const timeRangeSelect = document.getElementById('timeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', () => {
            const days = timeRangeSelect.value.includes('7') ? 7 : 30;
            Charts.renderTrendChart('financeChart', days);
        });
    }

    // ── 4. Populate Recent Activity with real transactions ───────────────────
    const activityArea = document.querySelector('.activity-area');
    if (activityArea) {
        const recent = SpendWiseDB.getAll().slice(0, 10);
        // Remove hardcoded transactions, keep the heading
        activityArea.querySelectorAll('.transaction').forEach(el => el.remove());

        if (recent.length === 0) {
            activityArea.insertAdjacentHTML('beforeend', '<p style="color:#64748b;font-size:0.9rem;">No transactions yet. Add one!</p>');
        } else {
            recent.forEach(txn => {
                const isIncome  = txn.type === 'income';
                const sign      = isIncome ? '+' : '-';
                const colorClass = isIncome ? 'up' : 'down';
                const timeAgo   = _timeAgo(txn.date);

                const div = document.createElement('div');
                div.className = 'transaction';
                div.dataset.id = txn.id;
                div.innerHTML = `
                    <div class="trans-info">
                        <p>${_escHtml(txn.title)}</p>
                        <span>${_escHtml(txn.category)} • ${timeAgo}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <p class="${colorClass}" style="font-weight:700;">${sign}$${Number(txn.amount).toFixed(2)}</p>
                        <button class="delete-txn" data-id="${txn.id}" title="Delete" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1rem;padding:4px;">🗑</button>
                    </div>`;
                activityArea.appendChild(div);
            });

            // Delete handler
            activityArea.addEventListener('click', (e) => {
                const btn = e.target.closest('.delete-txn');
                if (!btn) return;
                const id = Number(btn.dataset.id);
                if (confirm('Delete this transaction?')) {
                    SpendWiseDB.remove(id);
                    location.reload();
                }
            });
        }
    }

    // ── 5. Helpers ────────────────────────────────────────────────────────────
    function _timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr + 'T00:00:00').getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    }

    function _escHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
});
