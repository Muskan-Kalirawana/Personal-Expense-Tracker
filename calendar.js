/**
 * SpendWise — Calendar Heatmap Logic (Member 2: Frontend Logic)
 * Drop into calender.html as: <script src="calendar.js"></script>
 * Requires: data.js  (load that first)
 */

document.addEventListener('DOMContentLoaded', () => {

    SpendWiseDB.init();

    let currentDate = new Date();

    function getHeatLevel(amount, max) {
        if (!amount || amount === 0) return 0;
        if (amount < max * 0.25) return 1;
        if (amount < max * 0.60) return 2;
        return 3;
    }

    function renderCalendar() {
        const grid         = document.getElementById('calendarGrid');
        const monthDisplay = document.getElementById('monthDisplay');
        if (!grid) return;

        const year  = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
        monthDisplay.innerText = `${monthName} ${year}`;

        grid.innerHTML = '';

        // Day labels
        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day => {
            const label = document.createElement('div');
            label.className = 'day-label';
            label.innerText = day;
            grid.appendChild(label);
        });

        // Calendar math
        const firstDay     = new Date(year, month, 1).getDay();
        const startOffset  = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth  = new Date(year, month + 1, 0).getDate();

        // Get real spending data
        const calData = SpendWiseDB.calendarData();
        const monthAmounts = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const key = `${year}-${String(month + 1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            monthAmounts.push(calData[key] || 0);
        }
        const maxAmount = Math.max(...monthAmounts, 1);

        // Empty slots
        for (let i = 0; i < startOffset; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty-day';
            grid.appendChild(empty);
        }

        // Day cells
        const todayStr = new Date().toISOString().split('T')[0];
        for (let i = 1; i <= daysInMonth; i++) {
            const key    = `${year}-${String(month + 1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            const amount = calData[key] || 0;
            const level  = getHeatLevel(amount, maxAmount);
            const isToday = key === todayStr;

            const day = document.createElement('div');
            day.className = `calendar-day level-${level}`;
            if (isToday) day.style.outline = '2px solid #6366f1';

            day.innerHTML = `<span>${i}</span>`;
            day.title = amount > 0 ? `$${amount.toFixed(2)} spent` : 'No spending';

            // Click: show tooltip with amount
            day.addEventListener('click', () => {
                _showTooltip(day, key, amount);
            });

            grid.appendChild(day);
        }
    }

    function _showTooltip(el, dateStr, amount) {
        document.querySelectorAll('.sw-day-tooltip').forEach(t => t.remove());
        const tip = document.createElement('div');
        tip.className = 'sw-day-tooltip';
        tip.style.cssText = `
            position:fixed; background:#1e293b; color:white; padding:8px 14px;
            border-radius:8px; font-size:0.8rem; font-weight:600; z-index:9999;
            box-shadow:0 4px 12px rgba(0,0,0,0.2); pointer-events:none;
        `;
        const label = amount > 0 ? `$${amount.toFixed(2)} spent` : 'No spending';
        tip.textContent = `${dateStr}: ${label}`;

        const rect = el.getBoundingClientRect();
        tip.style.top  = (rect.top - 44 + window.scrollY) + 'px';
        tip.style.left = (rect.left + window.scrollX) + 'px';
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 2000);
    }

    // Override the global changeMonth function from the original HTML
    window.changeMonth = function(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar();
    };

    // Initial render
    renderCalendar();
});
