// storage.js - LocalStorage management

const Storage = {
    // Initialize default data
    init: function() {
        console.log('Initializing storage...');
        
        // Check if users exist, if not create them
        if (!localStorage.getItem('users')) {
            const users = [
                { email: 'client@aurum.com', password: 'client123', role: 'client', wallet: 10000 },
                { email: 'admin@aurum.com', password: 'admin123', role: 'admin' }
            ];
            localStorage.setItem('users', JSON.stringify(users));
            console.log('Users created:', users);
        }

        // Initialize other storage if not exists
        if (!localStorage.getItem('gold_sales')) {
            localStorage.setItem('gold_sales', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('gold_expenses')) {
            localStorage.setItem('gold_expenses', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('client_purchases')) {
            localStorage.setItem('client_purchases', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('gold_inventory')) {
            const initialInventory = [
                { id: 1, weight: 100, purity: 99.99, status: 'available' },
                { id: 2, weight: 50, purity: 99.5, status: 'available' },
                { id: 3, weight: 25, purity: 99.99, status: 'available' },
                { id: 4, weight: 10, purity: 99.99, status: 'available' },
                { id: 5, weight: 5, purity: 99.9, status: 'available' }
            ];
            localStorage.setItem('gold_inventory', JSON.stringify(initialInventory));
        }
    },

    // User operations
    getUsers: function() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    // Session management
    setSession: function(user) {
        localStorage.setItem('session_user', JSON.stringify(user));
        console.log('Session set:', user);
    },

    getSession: function() {
        const session = localStorage.getItem('session_user');
        return session ? JSON.parse(session) : null;
    },

    clearSession: function() {
        localStorage.removeItem('session_user');
    },

    // Sales operations
    getSales: function() {
        const sales = localStorage.getItem('gold_sales');
        return sales ? JSON.parse(sales) : [];
    },

    addSale: function(sale) {
        const sales = this.getSales();
        sale.id = Date.now();
        sales.push(sale);
        localStorage.setItem('gold_sales', JSON.stringify(sales));
        this.reduceInventory(sale.weight);
        return sale;
    },

    // Expenses operations
    getExpenses: function() {
        const expenses = localStorage.getItem('gold_expenses');
        return expenses ? JSON.parse(expenses) : [];
    },

    addExpense: function(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now();
        expenses.push(expense);
        localStorage.setItem('gold_expenses', JSON.stringify(expenses));
        return expense;
    },

    // Inventory operations
    getInventory: function() {
        const inventory = localStorage.getItem('gold_inventory');
        return inventory ? JSON.parse(inventory) : [];
    },

    addInventory: function(item) {
        const inventory = this.getInventory();
        item.id = Date.now();
        item.status = 'available';
        inventory.push(item);
        localStorage.setItem('gold_inventory', JSON.stringify(inventory));
        return item;
    },

    reduceInventory: function(weight) {
        let inventory = this.getInventory();
        let remainingToReduce = weight;
        
        inventory = inventory.map(item => {
            if (remainingToReduce > 0 && item.status === 'available') {
                if (item.weight <= remainingToReduce) {
                    remainingToReduce -= item.weight;
                    item.status = 'sold';
                }
            }
            return item;
        });
        
        localStorage.setItem('gold_inventory', JSON.stringify(inventory));
    },

    getTotalGoldWeight: function() {
        const inventory = this.getInventory();
        return inventory
            .filter(item => item.status === 'available')
            .reduce((total, item) => total + item.weight, 0);
    },

    // Client purchases
    getClientPurchases: function(clientEmail) {
        const purchases = localStorage.getItem('client_purchases');
        const allPurchases = purchases ? JSON.parse(purchases) : [];
        return allPurchases.filter(p => p.clientEmail === clientEmail);
    },

    addClientPurchase: function(purchase) {
        const purchases = localStorage.getItem('client_purchases');
        const allPurchases = purchases ? JSON.parse(purchases) : [];
        purchase.id = Date.now();
        allPurchases.push(purchase);
        localStorage.setItem('client_purchases', JSON.stringify(allPurchases));
        this.updateClientWallet(purchase.clientEmail, -purchase.total);
        return purchase;
    },

    updateClientWallet: function(email, amount) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].wallet = (users[userIndex].wallet || 0) + amount;
            localStorage.setItem('users', JSON.stringify(users));
        }
    },

    getClientWallet: function(email) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        return user ? user.wallet || 0 : 0;
    },

    // Profit calculations
    calculateProfit: function(period) {
        const sales = this.getSales();
        const expenses = this.getExpenses();
        const now = new Date();
        
        let filteredSales = sales;
        let filteredExpenses = expenses;
        
        if (period === 'daily') {
            const today = now.toISOString().split('T')[0];
            filteredSales = sales.filter(s => s.date === today);
            filteredExpenses = expenses.filter(e => e.date === today);
        } else if (period === 'weekly') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            filteredSales = sales.filter(s => new Date(s.date) >= weekAgo);
            filteredExpenses = expenses.filter(e => new Date(e.date) >= weekAgo);
        } else if (period === 'monthly') {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            filteredSales = sales.filter(s => new Date(s.date) >= monthAgo);
            filteredExpenses = expenses.filter(e => new Date(e.date) >= monthAgo);
        }
        
        const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        
        return {
            sales: totalSales,
            expenses: totalExpenses,
            profit: totalSales - totalExpenses
        };
    }
};

// Auto-initialize
Storage.init();