/**
 * SpendWise — Data Layer (Member 2: Frontend Logic)
 * Manages all transaction data using localStorage.
 * Ready to swap fetch() calls in for Django API endpoints later.
 */

const SpendWiseDB = (() => {

    const KEYS = {
        TRANSACTIONS: 'spendwise_transactions',
        USER: 'spendwise_user',
    };

    // ─── Seed data so the app looks populated on first load ───────────────────
    const SEED_TRANSACTIONS = [
        { id: 1, title: 'Salary Deposit',       amount: 3100,  type: 'income',  category: 'Salary/Work',       date: '2026-02-01', notes: 'February salary' },
        { id: 2, title: 'Freelance Project',     amount: 900,   type: 'income',  category: 'Salary/Work',       date: '2026-02-05', notes: 'Client website' },
        { id: 3, title: 'Apartment Rent',        amount: 1200,  type: 'expense', category: 'Housing',           date: '2026-02-02', notes: 'Monthly rent' },
        { id: 4, title: 'Grocery Market',        amount: 64.20, type: 'expense', category: 'Food & Grocery',    date: '2026-02-18', notes: '' },
        { id: 5, title: 'Apple Subscription',    amount: 14.99, type: 'expense', category: 'Entertainment',     date: '2026-02-21', notes: 'Apple Music' },
        { id: 6, title: 'Netflix',               amount: 18,    type: 'expense', category: 'Entertainment',     date: '2026-02-10', notes: '' },
        { id: 7, title: 'Uber Ride',             amount: 22.5,  type: 'expense', category: 'Transport',         date: '2026-02-12', notes: 'Airport pickup' },
        { id: 8, title: 'Online Shopping',       amount: 135,   type: 'expense', category: 'Shopping',          date: '2026-02-15', notes: 'Clothes' },
        { id: 9, title: 'Electricity Bill',      amount: 85,    type: 'expense', category: 'Housing',           date: '2026-02-08', notes: '' },
        { id: 10, title: 'Salary Deposit',       amount: 3100,  type: 'income',  category: 'Salary/Work',       date: '2026-01-01', notes: 'January salary' },
        { id: 11, title: 'Restaurant Dinner',    amount: 47,    type: 'expense', category: 'Food & Grocery',    date: '2026-02-20', notes: 'Date night' },
        { id: 12, title: 'Gym Membership',       amount: 40,    type: 'expense', category: 'Entertainment',     date: '2026-02-03', notes: '' },
    ];

    // ─── Helpers ─────────────────────────────────────────────────────────────
    function _load(key) {
        try { return JSON.parse(localStorage.getItem(key)) || null; }
        catch { return null; }
    }

    function _save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function _nextId(items) {
        return items.length ? Math.max(...items.map(t => t.id)) + 1 : 1;
    }

    // ─── Init: seed if first visit ────────────────────────────────────────────
    function init() {
        if (!_load(KEYS.TRANSACTIONS)) {
            _save(KEYS.TRANSACTIONS, SEED_TRANSACTIONS);
        }
    }

    // ─── Transactions CRUD ────────────────────────────────────────────────────
    function getAll()        { return _load(KEYS.TRANSACTIONS) || []; }
    function getById(id)     { return getAll().find(t => t.id === id) || null; }

    function add(txn) {
        const all = getAll();
        const newTxn = { ...txn, id: _nextId(all), date: txn.date || new Date().toISOString().split('T')[0] };
        _save(KEYS.TRANSACTIONS, [newTxn, ...all]);
        return newTxn;
    }

    function update(id, changes) {
        const all = getAll().map(t => t.id === id ? { ...t, ...changes } : t);
        _save(KEYS.TRANSACTIONS, all);
    }

    function remove(id) {
        _save(KEYS.TRANSACTIONS, getAll().filter(t => t.id !== id));
    }

    // ─── Analytics helpers ────────────────────────────────────────────────────
    function getExpenses() { return getAll().filter(t => t.type === 'expense'); }
    function getIncome()   { return getAll().filter(t => t.type === 'income'); }

    function totalFor(list) { return list.reduce((s, t) => s + Number(t.amount), 0); }

    function byCategory(type = 'expense') {
        const items = type === 'expense' ? getExpenses() : getIncome();
        return items.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
        }, {});
    }

    /**
     * Returns daily totals for the last N days (type = 'expense'|'income')
     */
    function dailyTotals(days = 30, type = 'expense') {
        const result = {};
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            result[d.toISOString().split('T')[0]] = 0;
        }
        getAll()
            .filter(t => t.type === type && result.hasOwnProperty(t.date))
            .forEach(t => { result[t.date] = (result[t.date] || 0) + Number(t.amount); });
        return result;
    }

    /**
     * Returns spending totals keyed by date (for calendar heatmap)
     */
    function calendarData() {
        const map = {};
        getExpenses().forEach(t => {
            map[t.date] = (map[t.date] || 0) + Number(t.amount);
        });
        return map;
    }

    // ─── Session / User ───────────────────────────────────────────────────────
    function setUser(name) { _save(KEYS.USER, { name }); }
    function getUser()     { return _load(KEYS.USER); }
    function clearUser()   { localStorage.removeItem(KEYS.USER); }

    // ─── Public API ──────────────────────────────────────────────────────────
    return { init, getAll, getById, add, update, remove, getExpenses, getIncome, totalFor, byCategory, dailyTotals, calendarData, setUser, getUser, clearUser };
})();
