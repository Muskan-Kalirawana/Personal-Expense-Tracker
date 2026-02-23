# SpendWise — Member 2 Integration Guide
## JavaScript Logic Layer

All files go in the same folder as the HTML files from Member 1.

---

## Files Created

| File | Purpose |
|------|---------|
| `data.js` | localStorage data store — transactions CRUD + analytics helpers |
| `validation.js` | Client-side form validation (login, signup, transaction) |
| `charts.js` | All Chart.js integrations using real data |
| `dashboard.js` | Wires live data to side-bar.html |
| `transaction.js` | Form logic for new-transaction.html |
| `analysis.js` | Live charts + breakdown for analysis.html |
| `calendar.js` | Real heatmap data for calender.html |
| `auth.js` | Login/signup validation + session save |

---

## How to Integrate (Add these `<script>` tags)

### side-bar.html
Before the closing `</body>` tag, REPLACE the existing `<script>` block with:
```html
<!-- Keep the Chart.js CDN that's already there -->
<script src="data.js"></script>
<script src="charts.js"></script>
<script src="dashboard.js"></script>
```
> ⚠️ Remove the old inline chart + nav script block — dashboard.js replaces it.

---

### new-transaction.html
Before closing `</body>`:
```html
<script src="data.js"></script>
<script src="validation.js"></script>
<script src="transaction.js"></script>
```
> ⚠️ Remove `onsubmit="event.preventDefault(); window.location.href='side-bar.html';"` from the `<form>` tag — transaction.js handles it.

---

### analysis.html
Before closing `</body>`, REPLACE the existing `<script>` block with:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="data.js"></script>
<script src="charts.js"></script>
<script src="analysis.js"></script>
```

---

### calender.html
Before closing `</body>`:
```html
<script src="data.js"></script>
<script src="calendar.js"></script>
```
> The existing `renderCalendar()` and `changeMonth()` functions are replaced by calendar.js.

---

### login.html & sign-up.html
Before closing `</body>`:
```html
<script src="data.js"></script>
<script src="validation.js"></script>
<script src="auth.js"></script>
```
> ⚠️ Remove the existing inline `<script>` block — auth.js replaces it.

---

## What Works After Integration

✅ **Transactions persist** — Add a transaction → go back to dashboard → it appears in Recent Activity  
✅ **Real stat cards** — Balance, Income, Expenses calculated from actual saved data  
✅ **Chart.js with real data** — Line chart shows actual spending per day, donut shows real categories  
✅ **Calendar heatmap** — Color intensity based on actual spending amounts (not random)  
✅ **Form validation** — All forms validate before submitting with error messages  
✅ **Username session** — Name saved on login/signup, shown in sidebar  
✅ **Delete transactions** — Trash icon on each row in Recent Activity  
✅ **7-day / 30-day filter** — Time range dropdown on dashboard actually changes chart data  

---

## Future: Swapping to Django API

In `data.js`, replace `_load` / `_save` localStorage calls with `fetch()`:

```javascript
// Example: replace getAll() with:
async function getAll() {
    const res = await fetch('/api/transactions/', { headers: { 'X-CSRFToken': getCookie('csrftoken') } });
    return res.json();
}
```
The rest of the app doesn't change — all modules read from `SpendWiseDB` methods.
