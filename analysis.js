/**
 * SpendWise — Analysis Page Logic (Member 2: Frontend Logic)
 * Drop into analysis.html as: <script src="analysis.js"></script>
 * Requires: data.js, charts.js  (load those first)
 */

document.addEventListener('DOMContentLoaded', () => {

    SpendWiseDB.init();

    const CATEGORY_COLORS = {
        'Food & Grocery':  '#f59e0b',
        'Entertainment':   '#6366f1',
        'Housing':         '#3b82f6',
        'Shopping':        '#ec4899',
        'Transport':       '#14b8a6',
        'Salary/Work':     '#10b981',
        'Other':           '#94a3b8',
    };

    function _color(label) { return CATEGORY_COLORS[label] || '#94a3b8'; }

    // Completely replace the old script-driven chart with real data
    function renderPage(type) {
        const result = Charts.renderDonutChart('analysisDonut', type);

        // Update total label
        const totalEl = document.getElementById('total-amount');
        if (totalEl && result) {
            totalEl.textContent = '$' + result.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // Update title
        const titleEl = document.getElementById('main-title');
        if (titleEl) titleEl.textContent = type === 'expense' ? 'Monthly Expenses' : 'Monthly Income';

        // Render progress bars breakdown
        const list = document.getElementById('breakdownList');
        if (list && result) {
            list.innerHTML = '';
            if (result.labels.length === 0) {
                list.innerHTML = '<p style="color:#64748b;">No data available.</p>';
                return;
            }
            result.labels.forEach((label, i) => {
                const pct = result.total ? ((result.values[i] / result.total) * 100).toFixed(1) : 0;
                const color = _color(label);
                list.insertAdjacentHTML('beforeend', `
                    <div class="category-row">
                        <div class="category-info">
                            <span>${label}</span>
                            <span>${pct}% — $${result.values[i].toFixed(2)}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width:${pct}%;background-color:${color};"></div>
                        </div>
                    </div>`);
            });
        }
    }

    // Toggle buttons
    const incomeBtn  = document.getElementById('incomeBtn');
    const expenseBtn = document.getElementById('expenseBtn');

    if (incomeBtn && expenseBtn) {
        incomeBtn.addEventListener('click', () => {
            incomeBtn.classList.add('active');
            expenseBtn.classList.remove('active');
            renderPage('income');
        });
        expenseBtn.addEventListener('click', () => {
            expenseBtn.classList.add('active');
            incomeBtn.classList.remove('active');
            renderPage('expense');
        });
    }

    // Initial render (expense by default)
    renderPage('expense');
});
