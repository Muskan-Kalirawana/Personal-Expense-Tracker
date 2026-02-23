/**
 * SpendWise — Charts Module (Member 2: Frontend Logic)
 * All Chart.js charts, fed by real data from SpendWiseDB.
 */

const Charts = (() => {

    const CATEGORY_COLORS = {
        'Food & Grocery':  '#f59e0b',
        'Entertainment':   '#6366f1',
        'Housing':         '#3b82f6',
        'Shopping':        '#ec4899',
        'Transport':       '#14b8a6',
        'Salary/Work':     '#10b981',
        'Other':           '#94a3b8',
    };

    function _color(label) {
        return CATEGORY_COLORS[label] || '#94a3b8';
    }

    // Keeps references so we can destroy before re-rendering
    const _instances = {};

    function _destroy(id) {
        if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
    }

    // ─── 1. Line / Area chart: Expense trend ─────────────────────────────────
    function renderTrendChart(canvasId, days = 7) {
        _destroy(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const dailyExp = SpendWiseDB.dailyTotals(days, 'expense');
        const labels = Object.keys(dailyExp).map(d => {
            const dt = new Date(d + 'T00:00:00');
            return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const values = Object.values(dailyExp);

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99,102,241,0.45)');
        gradient.addColorStop(1, 'rgba(99,102,241,0)');

        _instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Spent ($)',
                    data: values,
                    borderColor: '#6366f1',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 0,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { callback: v => '$' + v }
                    },
                    x: { grid: { display: false } }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }

    // ─── 2. Donut chart: Category breakdown ──────────────────────────────────
    function renderDonutChart(canvasId, type = 'expense') {
        _destroy(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const catData = SpendWiseDB.byCategory(type);
        const labels  = Object.keys(catData);
        const values  = Object.values(catData);
        const colors  = labels.map(_color);

        _instances[canvasId] = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '82%',
                plugins: { legend: { display: false }, tooltip: { enabled: true } }
            }
        });

        return { labels, values, colors, total: values.reduce((a, b) => a + b, 0) };
    }

    // ─── 3. Bar chart: Monthly Income vs Expense ─────────────────────────────
    function renderBarChart(canvasId) {
        _destroy(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Build last 6 months
        const months = [];
        const incomeData = [];
        const expenseData = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yr = d.getFullYear();
            const mo = d.getMonth(); // 0-indexed
            const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            months.push(label);

            const all = SpendWiseDB.getAll().filter(t => {
                const td = new Date(t.date + 'T00:00:00');
                return td.getFullYear() === yr && td.getMonth() === mo;
            });

            incomeData.push(all.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0));
            expenseData.push(all.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0));
        }

        _instances[canvasId] = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    { label: 'Income',  data: incomeData,  backgroundColor: '#10b981', borderRadius: 6 },
                    { label: 'Expense', data: expenseData, backgroundColor: '#6366f1', borderRadius: 6 },
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: v => '$' + v }, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    return { renderTrendChart, renderDonutChart, renderBarChart };
})();
