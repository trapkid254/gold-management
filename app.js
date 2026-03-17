// ===== app.js - Complete Enhanced Version =====

// ===== Data Structure =====
let appData = {
    sales: [],
    expenses: [],
    purchases: [],
    customers: [],
    openingStock: 1000,
    settings: {
        baseCurrency: 'USD',
        weightUnit: 'g',
        profitTarget: 25,
        lowStockThreshold: 100,
        notifications: true
    },
    goldPrices: {
        usd: 1950.50,
        eur: 1800.25,
        gbp: 1550.75,
        aed: 7160.00,
        inr: 162000.00,
        lastUpdated: new Date().toISOString()
    }
};

// Exchange rates (relative to USD)
const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    INR: 83.12
};

// Gold price API (using free API)
const GOLD_PRICE_API = 'https://api.metals.live/v1/spot/gold';

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadFromLocalStorage();
    
    // Set default dates
    setDefaultDates();
    
    // Initialize UI
    initializeUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Fetch live gold price
    fetchLiveGoldPrice();
    
    // Update all displays
    refreshAllData();
    
    // Start auto-refresh for gold price (every 5 minutes)
    setInterval(fetchLiveGoldPrice, 300000);
});

// ===== LocalStorage Functions =====
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('goldTradingData');
    if (savedData) {
        try {
            appData = JSON.parse(savedData);
        } catch (e) {
            console.error('Error loading data:', e);
            saveToLocalStorage();
        }
    } else {
        // Add sample data for demonstration
        addSampleData();
        saveToLocalStorage();
    }
}

function addSampleData() {
    // Add sample customers
    appData.customers = [
        {
            id: Date.now() - 1000000,
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+1 234-567-8901',
            birthday: '1985-06-15',
            address: '123 Main St, New York',
            idType: 'passport',
            idNumber: 'P12345678',
            totalPurchases: 12500,
            totalVolume: 250,
            lastPurchase: new Date().toISOString().split('T')[0],
            tier: 'gold',
            notes: 'VIP customer, prefers 24K gold',
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() - 2000000,
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+1 345-678-9012',
            birthday: '1990-12-03',
            address: '456 Oak Ave, Los Angeles',
            idType: 'drivers',
            idNumber: 'D87654321',
            totalPurchases: 8500,
            totalVolume: 170,
            lastPurchase: '2024-02-15',
            tier: 'silver',
            notes: 'Interested in investment-grade gold',
            createdAt: new Date().toISOString()
        }
    ];

    // Add sample sales
    const today = new Date();
    for (let i = 0; i < 20; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        appData.sales.push({
            id: Date.now() - i * 1000,
            date: dateStr,
            weight: 10 + Math.random() * 90,
            purity: [24, 22, 21][Math.floor(Math.random() * 3)],
            pricePerGram: 60 + Math.random() * 10,
            buyerName: ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Emma Wilson'][Math.floor(Math.random() * 4)],
            buyerContact: '+1 234-567-8901',
            buyerEmail: 'customer@email.com',
            buyerBirthday: '1985-06-15',
            notes: 'Sample sale',
            createdAt: new Date().toISOString()
        });
    }
    
    // Add sample expenses
    const categories = ['Transport', 'Security', 'Permit', 'Supplier Payment', 'Marketing', 'Maintenance', 'Salary'];
    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        appData.expenses.push({
            id: Date.now() - i * 2000,
            date: dateStr,
            category: categories[Math.floor(Math.random() * categories.length)],
            amount: 100 + Math.random() * 900,
            description: 'Sample expense',
            createdAt: new Date().toISOString()
        });
    }
    
    // Calculate total values for sales
    appData.sales.forEach(sale => {
        sale.totalValue = sale.weight * sale.pricePerGram;
    });
}

function saveToLocalStorage() {
    localStorage.setItem('goldTradingData', JSON.stringify(appData));
}

// ===== Live Gold Price Functions =====
async function fetchLiveGoldPrice() {
    try {
        const response = await fetch(GOLD_PRICE_API);
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Update gold prices in USD
            appData.goldPrices.usd = data[0].price;
            
            // Calculate other currencies
            appData.goldPrices.eur = appData.goldPrices.usd * exchangeRates.EUR;
            appData.goldPrices.gbp = appData.goldPrices.usd * exchangeRates.GBP;
            appData.goldPrices.aed = appData.goldPrices.usd * exchangeRates.AED;
            appData.goldPrices.inr = appData.goldPrices.usd * exchangeRates.INR;
            appData.goldPrices.lastUpdated = new Date().toISOString();
            
            updateGoldPriceDisplay();
        }
    } catch (error) {
        console.error('Error fetching gold price:', error);
        // Use fallback prices
        updateGoldPriceDisplay();
    }
}

function updateGoldPriceDisplay() {
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    const price = appData.goldPrices[currency.toLowerCase()] || appData.goldPrices.usd;
    const lastPrice = JSON.parse(localStorage.getItem('lastGoldPrice')) || price;
    
    document.getElementById('liveGoldPrice').textContent = 
        `${getCurrencySymbol(currency)}${price.toFixed(2)}/${appData.settings.weightUnit}`;
    
    // Calculate and display change
    const change = price - lastPrice;
    const changePercent = (change / lastPrice) * 100;
    const changeEl = document.getElementById('goldPriceChange');
    
    changeEl.textContent = `${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
    changeEl.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
    
    // Update last price
    localStorage.setItem('lastGoldPrice', price);
    
    // Update timestamp
    document.getElementById('priceUpdateTime').textContent = 
        `Updated: ${new Date().toLocaleTimeString()}`;
}

// ===== Currency Functions =====
function getCurrencySymbol(currency) {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        AED: 'د.إ',
        INR: '₹'
    };
    return symbols[currency] || '$';
}

function convertCurrency(amount, fromCurrency = 'USD', toCurrency = null) {
    if (!toCurrency) {
        toCurrency = document.getElementById('currencySelector')?.value || 'USD';
    }
    
    // Convert to USD first
    const amountInUSD = amount / exchangeRates[fromCurrency];
    // Convert to target currency
    return amountInUSD * exchangeRates[toCurrency];
}

function formatCurrency(amount, currency = null) {
    if (!currency) {
        currency = document.getElementById('currencySelector')?.value || 'USD';
    }
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
}

// ===== Date Functions =====
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

function getDateRange(period, startDate = null, endDate = null) {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch(period) {
        case 'today':
            start = new Date(today.setHours(0, 0, 0, 0));
            end = new Date(today.setHours(23, 59, 59, 999));
            break;
        case 'week':
            start = new Date(today.setDate(today.getDate() - today.getDay()));
            start.setHours(0, 0, 0, 0);
            end = new Date();
            end.setHours(23, 59, 59, 999);
            break;
        case 'month':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date();
            end.setHours(23, 59, 59, 999);
            break;
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            start = new Date(today.getFullYear(), quarter * 3, 1);
            end = new Date();
            end.setHours(23, 59, 59, 999);
            break;
        case 'year':
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date();
            end.setHours(23, 59, 59, 999);
            break;
        case 'custom':
            if (startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            }
            break;
        case 'all':
        default:
            start = new Date(2000, 0, 1);
            end = new Date(2100, 11, 31);
    }
    
    return { start, end };
}

function filterByDateRange(items, start, end) {
    return items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
    });
}

// ===== Customer Functions =====
function addCustomer(customerData) {
    const newCustomer = {
        id: Date.now(),
        ...customerData,
        totalPurchases: 0,
        totalVolume: 0,
        tier: 'bronze',
        createdAt: new Date().toISOString()
    };
    
    appData.customers.push(newCustomer);
    saveToLocalStorage();
    renderCustomers();
    showNotification('Customer added successfully!', 'success');
    return newCustomer;
}

function updateCustomerTier(customerId) {
    const customer = appData.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Calculate tier based on total purchases
    if (customer.totalPurchases >= 50000) {
        customer.tier = 'platinum';
    } else if (customer.totalPurchases >= 25000) {
        customer.tier = 'gold';
    } else if (customer.totalPurchases >= 10000) {
        customer.tier = 'silver';
    } else {
        customer.tier = 'bronze';
    }
    
    saveToLocalStorage();
}

function getUpcomingBirthdays(days = 30) {
    const today = new Date();
    const upcoming = [];
    
    appData.customers.forEach(customer => {
        if (customer.birthday) {
            const birthday = new Date(customer.birthday);
            birthday.setFullYear(today.getFullYear());
            
            if (birthday < today) {
                birthday.setFullYear(today.getFullYear() + 1);
            }
            
            const daysUntil = Math.ceil((birthday - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= days) {
                upcoming.push({
                    ...customer,
                    daysUntil,
                    birthdayDate: birthday
                });
            }
        }
    });
    
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

// ===== Sales Functions =====
function addSale(saleData) {
    const newSale = {
        id: Date.now(),
        ...saleData,
        createdAt: new Date().toISOString()
    };
    
    appData.sales.push(newSale);
    
    // Update customer stats
    const customer = appData.customers.find(c => 
        c.name === saleData.buyerName || c.email === saleData.buyerEmail
    );
    
    if (customer) {
        customer.totalPurchases += saleData.totalValue;
        customer.totalVolume += saleData.weight;
        customer.lastPurchase = saleData.date;
        updateCustomerTier(customer.id);
    }
    
    saveToLocalStorage();
    refreshAllData();
    showNotification('Sale added successfully!', 'success');
    return newSale;
}

function deleteSale(id) {
    const sale = appData.sales.find(s => s.id === id);
    if (sale) {
        // Update customer stats
        const customer = appData.customers.find(c => c.name === sale.buyerName);
        if (customer) {
            customer.totalPurchases -= sale.totalValue;
            customer.totalVolume -= sale.weight;
            updateCustomerTier(customer.id);
        }
    }
    
    appData.sales = appData.sales.filter(s => s.id !== id);
    saveToLocalStorage();
    refreshAllData();
    showNotification('Sale deleted successfully!', 'success');
}

// ===== Expense Functions =====
function addExpense(expenseData) {
    const newExpense = {
        id: Date.now(),
        ...expenseData,
        createdAt: new Date().toISOString()
    };
    
    appData.expenses.push(newExpense);
    saveToLocalStorage();
    refreshAllData();
    showNotification('Expense added successfully!', 'success');
    return newExpense;
}

function deleteExpense(id) {
    appData.expenses = appData.expenses.filter(e => e.id !== id);
    saveToLocalStorage();
    refreshAllData();
    showNotification('Expense deleted successfully!', 'success');
}

// ===== Purchase Functions =====
function addPurchase(purchaseData) {
    const newPurchase = {
        id: Date.now(),
        ...purchaseData,
        createdAt: new Date().toISOString()
    };
    
    appData.purchases.push(newPurchase);
    saveToLocalStorage();
    refreshAllData();
    showNotification('Purchase added successfully!', 'success');
    return newPurchase;
}

function deletePurchase(id) {
    appData.purchases = appData.purchases.filter(p => p.id !== id);
    saveToLocalStorage();
    refreshAllData();
    showNotification('Purchase deleted successfully!', 'success');
}

// ===== Calculation Functions =====
function calculateTotals(period = 'today', startDate = null, endDate = null) {
    const { start, end } = getDateRange(period, startDate, endDate);
    
    const filteredSales = filterByDateRange(appData.sales, start, end);
    const filteredExpenses = filterByDateRange(appData.expenses, start, end);
    
    const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalSales - totalExpenses;
    
    const totalWeight = filteredSales.reduce((sum, sale) => sum + sale.weight, 0);
    const avgPricePerGram = totalWeight > 0 ? totalSales / totalWeight : 0;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    
    return {
        totalSales,
        totalExpenses,
        netProfit,
        totalWeight,
        avgPricePerGram,
        profitMargin,
        salesCount: filteredSales.length,
        expensesCount: filteredExpenses.length
    };
}

function calculateInventory() {
    const totalSold = appData.sales.reduce((sum, sale) => sum + sale.weight, 0);
    const totalPurchased = appData.purchases.reduce((sum, purchase) => sum + purchase.weight, 0);
    const currentStock = appData.openingStock + totalPurchased - totalSold;
    
    return {
        openingStock: appData.openingStock,
        totalPurchased,
        totalSold,
        currentStock
    };
}

function getBestPerformingDay() {
    const dailyTotals = {};
    
    appData.sales.forEach(sale => {
        const day = sale.date;
        if (!dailyTotals[day]) {
            dailyTotals[day] = { sales: 0, volume: 0 };
        }
        dailyTotals[day].sales += sale.totalValue;
        dailyTotals[day].volume += sale.weight;
    });
    
    let bestDay = null;
    let bestSales = 0;
    
    Object.entries(dailyTotals).forEach(([day, totals]) => {
        if (totals.sales > bestSales) {
            bestSales = totals.sales;
            bestDay = { date: day, ...totals };
        }
    });
    
    return bestDay;
}

function getTopBuyer() {
    const buyerTotals = {};
    
    appData.sales.forEach(sale => {
        if (!buyerTotals[sale.buyerName]) {
            buyerTotals[sale.buyerName] = { total: 0, volume: 0 };
        }
        buyerTotals[sale.buyerName].total += sale.totalValue;
        buyerTotals[sale.buyerName].volume += sale.weight;
    });
    
    let topBuyer = null;
    let maxTotal = 0;
    
    Object.entries(buyerTotals).forEach(([name, totals]) => {
        if (totals.total > maxTotal) {
            maxTotal = totals.total;
            topBuyer = { name, ...totals };
        }
    });
    
    return topBuyer;
}

function calculateGrowthRate(period = 'month') {
    const currentPeriod = calculateTotals(period);
    const previousPeriod = calculateTotals(period, true);
    
    if (previousPeriod.totalSales === 0) return 0;
    
    return ((currentPeriod.totalSales - previousPeriod.totalSales) / previousPeriod.totalSales) * 100;
}

// ===== Update Functions =====
function refreshAllData() {
    updateDashboard();
    renderSalesTable();
    renderExpensesTable();
    updateInventory();
    updateReports();
    updateRecentTransactions();
    renderCustomers();
    checkStockAlerts();
    updateEnhancedDashboard();
}

function updateDashboard() {
    const period = document.getElementById('dashboardPeriod')?.value || 'today';
    const totals = calculateTotals(period);
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    document.getElementById('totalSales').textContent = formatCurrency(totals.totalSales, currency);
    document.getElementById('totalExpenses').textContent = formatCurrency(totals.totalExpenses, currency);
    document.getElementById('netProfit').textContent = formatCurrency(totals.netProfit, currency);
    document.getElementById('goldSold').textContent = `${totals.totalWeight.toFixed(2)}g`;
    
    const profitIndicator = document.getElementById('profitIndicator');
    profitIndicator.textContent = `${totals.profitMargin >= 0 ? '+' : ''}${totals.profitMargin.toFixed(1)}%`;
    profitIndicator.className = `card-label profit-indicator ${totals.profitMargin >= 0 ? 'positive' : 'negative'}`;
    
    updateCharts(period);
}

function updateEnhancedDashboard() {
    const bestDay = getBestPerformingDay();
    const topBuyer = getTopBuyer();
    const totals = calculateTotals('all');
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    // Profit Margin
    const profitMargin = totals.totalSales > 0 ? (totals.netProfit / totals.totalSales) * 100 : 0;
    document.getElementById('profitMargin').textContent = `${profitMargin.toFixed(1)}%`;
    document.getElementById('profitMarginBar').style.width = `${Math.min(profitMargin, 100)}%`;
    
    const status = document.getElementById('profitMarginStatus');
    if (profitMargin >= appData.settings.profitTarget) {
        status.textContent = 'Target Achieved!';
        status.style.color = 'var(--success)';
    } else {
        status.textContent = `${(appData.settings.profitTarget - profitMargin).toFixed(1)}% to target`;
        status.style.color = 'var(--warning)';
    }
    
    // Best Day
    if (bestDay) {
        document.getElementById('bestDay').textContent = formatDate(bestDay.date, 'short');
        document.getElementById('bestDaySales').textContent = formatCurrency(bestDay.sales, currency);
        document.getElementById('bestDayVolume').textContent = `${bestDay.volume.toFixed(2)}g`;
    }
    
    // Top Buyer
    if (topBuyer) {
        document.getElementById('topBuyer').textContent = topBuyer.name;
        document.getElementById('topBuyerTotal').textContent = formatCurrency(topBuyer.total, currency);
        document.getElementById('topBuyerVolume').textContent = `${topBuyer.volume.toFixed(2)}g`;
    }
    
    // Expense Pie Chart
    updateExpensePieChart();
    
    // Monthly Comparison Chart
    updateMonthlyComparisonChart();
}

function updateExpensePieChart() {
    const ctx = document.getElementById('expensePieChart')?.getContext('2d');
    if (!ctx) return;
    
    // Group expenses by category
    const categoryTotals = {};
    appData.expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    
    if (window.expensePieChart) window.expensePieChart.destroy();
    
    window.expensePieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: [
                    '#1e3a8a',
                    '#d4af37',
                    '#10b981',
                    '#8b5cf6',
                    '#ef4444',
                    '#f59e0b',
                    '#3b82f6',
                    '#ec4899'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

function updateMonthlyComparisonChart() {
    const ctx = document.getElementById('monthlyComparisonChart')?.getContext('2d');
    if (!ctx) return;
    
    const year = document.getElementById('comparisonYear')?.value || '2024';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = [];
    const expensesData = [];
    
    for (let i = 0; i < 12; i++) {
        const startDate = `${year}-${String(i + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(year, i + 1, 0).getDate();
        const endDate = `${year}-${String(i + 1).padStart(2, '0')}-${lastDay}`;
        
        const totals = calculateTotals('custom', startDate, endDate);
        salesData.push(totals.totalSales);
        expensesData.push(totals.totalExpenses);
    }
    
    if (window.monthlyChart) window.monthlyChart.destroy();
    
    window.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Sales',
                    data: salesData,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 6
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    backgroundColor: '#d4af37',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateCharts(period) {
    // Sales vs Expenses Chart
    const salesExpensesCtx = document.getElementById('salesExpensesChart')?.getContext('2d');
    if (salesExpensesCtx) {
        if (window.salesExpensesChart) window.salesExpensesChart.destroy();
        
        // Get data for last 7 days
        const labels = [];
        const salesData = [];
        const expensesData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(formatDate(dateStr, 'short'));
            
            const dayTotals = calculateTotals('custom', dateStr, dateStr);
            salesData.push(dayTotals.totalSales);
            expensesData.push(dayTotals.totalExpenses);
        }
        
        window.salesExpensesChart = new Chart(salesExpensesCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sales',
                        data: salesData,
                        backgroundColor: '#1e3a8a',
                        borderRadius: 6
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        backgroundColor: '#d4af37',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Profit Chart
    const profitCtx = document.getElementById('profitChart')?.getContext('2d');
    if (profitCtx) {
        if (window.profitChart) window.profitChart.destroy();
        
        const labels = [];
        const profitData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(formatDate(dateStr, 'short'));
            
            const dayTotals = calculateTotals('custom', dateStr, dateStr);
            profitData.push(dayTotals.netProfit);
        }
        
        window.profitChart = new Chart(profitCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Profit',
                        data: profitData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('salesSearch')?.value.toLowerCase() || '';
    const startDate = document.getElementById('salesStartDate')?.value;
    const endDate = document.getElementById('salesEndDate')?.value;
    const purityFilter = document.getElementById('purityFilter')?.value || 'all';
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    let filteredSales = [...appData.sales];
    
    // Apply search
    if (searchTerm) {
        filteredSales = filteredSales.filter(sale => 
            sale.buyerName?.toLowerCase().includes(searchTerm) ||
            sale.notes?.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply purity filter
    if (purityFilter !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.purity == purityFilter);
    }
    
    // Apply date filter
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredSales = filterByDateRange(filteredSales, start, end);
    }
    
    // Sort by date descending
    filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredSales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No sales found</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filteredSales.map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td>${escapeHtml(sale.buyerName || '')}</td>
            <td>${sale.weight}g</td>
            <td>${sale.purity}K</td>
            <td>${formatCurrency(convertCurrency(sale.pricePerGram, 'USD', currency), currency)}</td>
            <td>${formatCurrency(convertCurrency(sale.totalValue, 'USD', currency), currency)}</td>
            <td>${escapeHtml(sale.buyerContact || '-')}</td>
            <td>${escapeHtml(sale.notes || '-')}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editSale(${sale.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="confirmDeleteSale(${sale.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    if (!tbody) return;
    
    const categoryFilter = document.getElementById('expenseCategoryFilter')?.value || 'all';
    const startDate = document.getElementById('expenseStartDate')?.value;
    const endDate = document.getElementById('expenseEndDate')?.value;
    const minAmount = parseFloat(document.getElementById('minExpenseAmount')?.value) || 0;
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    let filteredExpenses = [...appData.expenses];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
    }
    
    // Apply min amount filter
    if (minAmount > 0) {
        filteredExpenses = filteredExpenses.filter(e => e.amount >= minAmount);
    }
    
    // Apply date filter
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredExpenses = filterByDateRange(filteredExpenses, start, end);
    }
    
    // Sort by date descending
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredExpenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No expenses found</td></tr>`;
        return;
    }
    
    tbody.innerHTML = filteredExpenses.map(expense => `
        <tr>
            <td>${formatDate(expense.date)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>${escapeHtml(expense.description)}</td>
            <td>${formatCurrency(convertCurrency(expense.amount, 'USD', currency), currency)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editExpense(${expense.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="confirmDeleteExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateInventory() {
    const inventory = calculateInventory();
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    document.getElementById('openingStock').textContent = `${inventory.openingStock.toFixed(2)}g`;
    document.getElementById('goldPurchased').textContent = `${inventory.totalPurchased.toFixed(2)}g`;
    document.getElementById('goldSoldInventory').textContent = `${inventory.totalSold.toFixed(2)}g`;
    document.getElementById('currentStock').textContent = `${inventory.currentStock.toFixed(2)}g`;
    
    // Show warning if stock is negative or low
    const stockCard = document.getElementById('currentStockCard');
    const warningEl = document.getElementById('stockWarning');
    
    if (inventory.currentStock < 0) {
        stockCard.classList.add('warning');
        warningEl.textContent = '⚠️ Negative stock! Please check purchases.';
    } else if (inventory.currentStock < appData.settings.lowStockThreshold) {
        stockCard.classList.add('warning');
        warningEl.textContent = `⚠️ Low stock! Below ${appData.settings.lowStockThreshold}g`;
    } else {
        stockCard.classList.remove('warning');
        warningEl.textContent = '';
    }
    
    renderPurchasesTable();
}

function checkStockAlerts() {
    const inventory = calculateInventory();
    const alerts = [];
    
    if (inventory.currentStock < 0) {
        alerts.push({
            type: 'danger',
            message: 'Negative stock detected! Immediate action required.'
        });
    } else if (inventory.currentStock < appData.settings.lowStockThreshold) {
        alerts.push({
            type: 'warning',
            message: `Low stock alert: ${inventory.currentStock.toFixed(2)}g remaining. Consider purchasing more gold.`
        });
    }
    
    // Check for unusual sales patterns
    const today = new Date().toISOString().split('T')[0];
    const todaySales = appData.sales.filter(s => s.date === today).length;
    const avgDailySales = appData.sales.length / 30; // Rough average
    
    if (todaySales > avgDailySales * 2) {
        alerts.push({
            type: 'info',
            message: `Unusual high sales volume today: ${todaySales} transactions.`
        });
    }
    
    displayStockAlerts(alerts);
}

function displayStockAlerts(alerts) {
    const alertsPanel = document.getElementById('alertsPanel');
    const alertsList = document.getElementById('stockAlertsList');
    
    if (alerts.length === 0) {
        alertsPanel.style.display = 'none';
        return;
    }
    
    alertsPanel.style.display = 'block';
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item alert-${alert.type}">
            <i class="fas fa-${alert.type === 'danger' ? 'exclamation-circle' : 
                                 alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${alert.message}</span>
        </div>
    `).join('');
}

function renderPurchasesTable() {
    const tbody = document.getElementById('purchasesTableBody');
    if (!tbody) return;
    
    const purchases = [...appData.purchases].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (purchases.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No purchases recorded</td></tr>`;
        return;
    }
    
    tbody.innerHTML = purchases.map(purchase => `
        <tr>
            <td>${formatDate(purchase.date)}</td>
            <td>${purchase.weight}g</td>
            <td>${escapeHtml(purchase.source || '-')}</td>
            <td>${purchase.price ? formatCurrency(purchase.price) : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-delete" onclick="confirmDeletePurchase(${purchase.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateRecentTransactions() {
    const tbody = document.getElementById('recentTransactionsBody');
    if (!tbody) return;
    
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    const transactions = [
        ...appData.sales.map(s => ({ ...s, type: 'Sale' })),
        ...appData.expenses.map(e => ({ ...e, type: 'Expense' })),
        ...appData.purchases.map(p => ({ ...p, type: 'Purchase' }))
    ];
    
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = transactions.slice(0, 10);
    
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem;">No recent transactions</td></tr>`;
        return;
    }
    
    tbody.innerHTML = recent.map(t => {
        let details = '';
        let amount = '';
        
        switch(t.type) {
            case 'Sale':
                details = `${t.buyerName} - ${t.weight}g ${t.purity}K`;
                amount = formatCurrency(convertCurrency(t.totalValue, 'USD', currency), currency);
                break;
            case 'Expense':
                details = t.description;
                amount = formatCurrency(convertCurrency(t.amount, 'USD', currency), currency);
                break;
            case 'Purchase':
                details = `Purchased ${t.weight}g ${t.source ? 'from ' + t.source : ''}`;
                amount = t.price ? formatCurrency(convertCurrency(t.price, 'USD', currency), currency) : '-';
                break;
        }
        
        return `
            <tr>
                <td>${formatDate(t.date)}</td>
                <td><span class="transaction-type ${t.type.toLowerCase()}">${t.type}</span></td>
                <td>${escapeHtml(details)}</td>
                <td>${amount}</td>
            </tr>
        `;
    }).join('');
}

function updateReports() {
    const reportType = document.getElementById('reportType')?.value || 'daily';
    const reportDate = document.getElementById('reportDate')?.value;
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    if (!reportDate) return;
    
    let start, end;
    const date = new Date(reportDate);
    
    switch(reportType) {
        case 'daily':
            start = reportDate;
            end = reportDate;
            break;
        case 'weekly':
            const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
            const lastDay = new Date(date.setDate(firstDay.getDate() + 6));
            start = firstDay.toISOString().split('T')[0];
            end = lastDay.toISOString().split('T')[0];
            break;
        case 'monthly':
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const lastDayMonth = new Date(year, month, 0).getDate();
            start = `${year}-${String(month).padStart(2, '0')}-01`;
            end = `${year}-${String(month).padStart(2, '0')}-${lastDayMonth}`;
            break;
        case 'quarterly':
            const quarter = Math.floor(date.getMonth() / 3);
            const quarterStartMonth = quarter * 3 + 1;
            const quarterEndMonth = quarterStartMonth + 2;
            const quarterLastDay = new Date(date.getFullYear(), quarterEndMonth, 0).getDate();
            start = `${date.getFullYear()}-${String(quarterStartMonth).padStart(2, '0')}-01`;
            end = `${date.getFullYear()}-${String(quarterEndMonth).padStart(2, '0')}-${quarterLastDay}`;
            break;
        case 'yearly':
            start = `${date.getFullYear()}-01-01`;
            end = `${date.getFullYear()}-12-31`;
            break;
    }
    
    const totals = calculateTotals('custom', start, end);
    const growthRate = calculateGrowthRate(reportType);
    
    document.getElementById('totalTransactions').textContent = totals.salesCount;
    document.getElementById('avgPricePerGram').textContent = formatCurrency(convertCurrency(totals.avgPricePerGram, 'USD', currency), currency);
    document.getElementById('totalWeightSold').textContent = `${totals.totalWeight.toFixed(2)}g`;
    document.getElementById('totalExpensesReport').textContent = formatCurrency(convertCurrency(totals.totalExpenses, 'USD', currency), currency);
    document.getElementById('profitMarginReport').textContent = `${totals.profitMargin.toFixed(1)}%`;
    document.getElementById('growthRate').textContent = `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
    
    updateReportChart(reportType, start, end);
    renderReportTable(reportType, start, end);
}

function renderReportTable(reportType, start, end) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;
    
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const rows = [];
    
    if (reportType === 'daily') {
        // Hourly breakdown (simplified)
        const periods = ['6am-10am', '10am-2pm', '2pm-6pm', '6pm-10pm'];
        periods.forEach(period => {
            rows.push({
                period,
                sales: Math.random() * 5000,
                expenses: Math.random() * 1000,
                volume: Math.random() * 100
            });
        });
    } else if (reportType === 'weekly') {
        // Daily breakdown
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayTotals = calculateTotals('custom', dateStr, dateStr);
            rows.push({
                period: formatDate(dateStr, 'short'),
                sales: dayTotals.totalSales,
                expenses: dayTotals.totalExpenses,
                volume: dayTotals.totalWeight
            });
        }
    } else {
        // Monthly/Quarterly/Yearly breakdown
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < (reportType === 'monthly' ? 4 : 12); i++) {
            rows.push({
                period: months[i],
                sales: Math.random() * 50000,
                expenses: Math.random() * 10000,
                volume: Math.random() * 1000
            });
        }
    }
    
    tbody.innerHTML = rows.map(row => `
        <tr>
            <td>${row.period}</td>
            <td>${formatCurrency(convertCurrency(row.sales, 'USD', currency), currency)}</td>
            <td>${formatCurrency(convertCurrency(row.expenses, 'USD', currency), currency)}</td>
            <td>${formatCurrency(convertCurrency(row.sales - row.expenses, 'USD', currency), currency)}</td>
            <td>${row.volume.toFixed(2)}g</td>
            <td>${row.volume > 0 ? formatCurrency(convertCurrency(row.sales / row.volume, 'USD', currency), currency) : '-'}</td>
        </tr>
    `).join('');
}

function updateReportChart(reportType, start, end) {
    const ctx = document.getElementById('reportChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.reportChart) window.reportChart.destroy();
    
    let labels = [];
    let salesData = [];
    let expensesData = [];
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (reportType === 'daily') {
        labels = ['6am-10am', '10am-2pm', '2pm-6pm', '6pm-10pm'];
        salesData = [1500, 3200, 2800, 1900];
        expensesData = [300, 450, 200, 150];
    } else if (reportType === 'weekly') {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            labels.push(formatDate(dateStr, 'short'));
            const dayTotals = calculateTotals('custom', dateStr, dateStr);
            salesData.push(dayTotals.totalSales);
            expensesData.push(dayTotals.totalExpenses);
        }
    } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels = months;
        for (let i = 0; i < 12; i++) {
            const monthStart = `${startDate.getFullYear()}-${String(i + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(startDate.getFullYear(), i + 1, 0).getDate();
            const monthEnd = `${startDate.getFullYear()}-${String(i + 1).padStart(2, '0')}-${lastDay}`;
            const monthTotals = calculateTotals('custom', monthStart, monthEnd);
            salesData.push(monthTotals.totalSales);
            expensesData.push(monthTotals.totalExpenses);
        }
    }
    
    window.reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sales',
                    data: salesData,
                    borderColor: '#1e3a8a',
                    backgroundColor: 'rgba(30, 58, 138, 0.1)',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Expenses',
                    data: expensesData,
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function renderCustomers() {
    const grid = document.getElementById('customersGrid');
    if (!grid) return;
    
    const searchTerm = document.getElementById('customerSearch')?.value.toLowerCase() || '';
    const tierFilter = document.getElementById('customerTierFilter')?.value || 'all';
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    
    let filteredCustomers = [...appData.customers];
    
    if (searchTerm) {
        filteredCustomers = filteredCustomers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm) ||
            c.phone?.includes(searchTerm)
        );
    }
    
    if (tierFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(c => c.tier === tierFilter);
    }
    
    // Update stats
    document.getElementById('totalCustomers').textContent = appData.customers.length;
    document.getElementById('platinumCount').textContent = appData.customers.filter(c => c.tier === 'platinum').length;
    document.getElementById('goldCount').textContent = appData.customers.filter(c => c.tier === 'gold').length;
    document.getElementById('silverCount').textContent = appData.customers.filter(c => c.tier === 'silver').length;
    document.getElementById('bronzeCount').textContent = appData.customers.filter(c => c.tier === 'bronze').length;
    
    if (filteredCustomers.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem;">No customers found</p>';
        return;
    }
    
    grid.innerHTML = filteredCustomers.map(customer => `
        <div class="customer-card">
            <div class="customer-header">
                <span class="customer-name">${escapeHtml(customer.name)}</span>
                <span class="customer-tier tier-${customer.tier}">${customer.tier}</span>
            </div>
            <div class="customer-details">
                <p><i class="fas fa-envelope"></i> ${escapeHtml(customer.email || '-')}</p>
                <p><i class="fas fa-phone"></i> ${escapeHtml(customer.phone || '-')}</p>
                <p><i class="fas fa-birthday-cake"></i> ${customer.birthday ? formatDate(customer.birthday) : '-'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(customer.address || '-')}</p>
            </div>
            <div class="customer-stats-mini">
                <span>💰 ${formatCurrency(convertCurrency(customer.totalPurchases || 0, 'USD', currency), currency)}</span>
                <span>⚖️ ${(customer.totalVolume || 0).toFixed(2)}g</span>
            </div>
            <div class="customer-footer">
                <small>Last purchase: ${customer.lastPurchase ? formatDate(customer.lastPurchase) : 'Never'}</small>
            </div>
        </div>
    `).join('');
    
    // Update birthday reminders
    renderBirthdayReminders();
}

function renderBirthdayReminders() {
    const container = document.getElementById('birthdayReminders');
    if (!container) return;
    
    const upcoming = getUpcomingBirthdays(30);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p>No upcoming birthdays in the next 30 days</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(c => `
        <div class="birthday-reminder">
            <i class="fas fa-birthday-cake" style="color: #ec4899;"></i>
            <div>
                <strong>${escapeHtml(c.name)}</strong>
                <p>Birthday in ${c.daysUntil} days (${formatDate(c.birthday)})</p>
                <small>Tier: ${c.tier} | Last purchase: ${c.lastPurchase ? formatDate(c.lastPurchase) : 'Never'}</small>
            </div>
        </div>
    `).join('');
}

// ===== Modal Functions =====
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Sale Modal
function showAddSaleModal() {
    document.getElementById('saleForm').reset();
    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('totalValue').value = '';
    openModal('saleModal');
}

function calculateTotalValue() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const price = parseFloat(document.getElementById('pricePerGram').value) || 0;
    document.getElementById('totalValue').value = formatCurrency(weight * price);
}

function handleSaleSubmit(e) {
    e.preventDefault();
    
    const totalValue = parseFloat(document.getElementById('weight').value) * 
                      parseFloat(document.getElementById('pricePerGram').value);
    
    const saleData = {
        date: document.getElementById('saleDate').value,
        weight: parseFloat(document.getElementById('weight').value),
        purity: parseInt(document.getElementById('purity').value),
        pricePerGram: parseFloat(document.getElementById('pricePerGram').value),
        totalValue: totalValue,
        buyerName: document.getElementById('buyerName').value,
        buyerContact: document.getElementById('buyerContact').value,
        buyerEmail: document.getElementById('buyerEmail').value,
        buyerBirthday: document.getElementById('buyerBirthday').value,
        notes: document.getElementById('saleNotes').value
    };
    
    addSale(saleData);
    closeModal('saleModal');
}

// Expense Modal
function showAddExpenseModal() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    openModal('expenseModal');
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const expenseData = {
        date: document.getElementById('expenseDate').value,
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        description: document.getElementById('expenseDescription').value
    };
    
    addExpense(expenseData);
    closeModal('expenseModal');
}

// Purchase Modal
function showAddPurchaseModal() {
    document.getElementById('purchaseForm').reset();
    document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
    openModal('purchaseModal');
}

function handlePurchaseSubmit(e) {
    e.preventDefault();
    
    const purchaseData = {
        date: document.getElementById('purchaseDate').value,
        weight: parseFloat(document.getElementById('purchaseWeight').value),
        source: document.getElementById('purchaseSource').value,
        price: document.getElementById('purchasePrice').value ? parseFloat(document.getElementById('purchasePrice').value) : null
    };
    
    addPurchase(purchaseData);
    closeModal('purchaseModal');
}

// Customer Modal
function showAddCustomerModal() {
    document.getElementById('customerForm').reset();
    openModal('customerModal');
}

function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        birthday: document.getElementById('customerBirthday').value,
        address: document.getElementById('customerAddress').value,
        idType: document.getElementById('customerIdType').value,
        idNumber: document.getElementById('customerIdNumber').value,
        notes: document.getElementById('customerNotes').value
    };
    
    addCustomer(customerData);
    closeModal('customerModal');
}

// Opening Stock Modal
function showOpeningStockModal() {
    document.getElementById('openingStockInput').value = appData.openingStock;
    openModal('openingStockModal');
}

function handleOpeningStockSubmit(e) {
    e.preventDefault();
    
    const newStock = parseFloat(document.getElementById('openingStockInput').value);
    if (!isNaN(newStock) && newStock >= 0) {
        appData.openingStock = newStock;
        saveToLocalStorage();
        refreshAllData();
        closeModal('openingStockModal');
        showNotification('Opening stock updated!', 'success');
    }
}

// Delete Confirmation
let pendingDelete = null;

function confirmDeleteSale(id) {
    pendingDelete = { type: 'sale', id };
    openModal('deleteModal');
}

function confirmDeleteExpense(id) {
    pendingDelete = { type: 'expense', id };
    openModal('deleteModal');
}

function confirmDeletePurchase(id) {
    pendingDelete = { type: 'purchase', id };
    openModal('deleteModal');
}

function handleConfirmDelete() {
    if (pendingDelete) {
        switch(pendingDelete.type) {
            case 'sale':
                deleteSale(pendingDelete.id);
                break;
            case 'expense':
                deleteExpense(pendingDelete.id);
                break;
            case 'purchase':
                deletePurchase(pendingDelete.id);
                break;
        }
        closeModal('deleteModal');
        pendingDelete = null;
    }
}

// ===== Navigation =====
function switchSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    document.getElementById('navMenu').classList.remove('show');
}

// ===== Export Functions =====
function exportToCSV(data, filename) {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportSalesCSV() {
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    const salesForExport = appData.sales.map(s => ({
        Date: s.date,
        Buyer: s.buyerName,
        'Weight (g)': s.weight,
        Purity: `${s.purity}K`,
        'Price/g': formatCurrency(convertCurrency(s.pricePerGram, 'USD', currency), currency),
        Total: formatCurrency(convertCurrency(s.totalValue, 'USD', currency), currency),
        Contact: s.buyerContact || '',
        Email: s.buyerEmail || '',
        Notes: s.notes || ''
    }));
    
    exportToCSV(salesForExport, `gold_sales_${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Sales exported successfully!', 'success');
}

function exportExpensesCSV() {
    const currency = document.getElementById('currencySelector')?.value || 'USD';
    const expensesForExport = appData.expenses.map(e => ({
        Date: e.date,
        Category: e.category,
        Description: e.description,
        Amount: formatCurrency(convertCurrency(e.amount, 'USD', currency), currency)
    }));
    
    exportToCSV(expensesForExport, `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Expenses exported successfully!', 'success');
}

function backupData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold_trading_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Data backed up successfully!', 'success');
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const restoredData = JSON.parse(e.target.result);
            if (validateRestoredData(restoredData)) {
                appData = restoredData;
                saveToLocalStorage();
                refreshAllData();
                showNotification('Data restored successfully!', 'success');
            } else {
                showNotification('Invalid backup file format!', 'error');
            }
        } catch (error) {
            showNotification('Error restoring data: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function validateRestoredData(data) {
    return data && 
           Array.isArray(data.sales) && 
           Array.isArray(data.expenses) && 
           Array.isArray(data.purchases) && 
           Array.isArray(data.customers) && 
           typeof data.openingStock === 'number';
}

// ===== Utility Functions =====
function formatCurrency(value, currency = null) {
    if (!currency) {
        currency = document.getElementById('currencySelector')?.value || 'USD';
    }
    const symbols = { USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', INR: '₹' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${value.toFixed(2)}`;
}

function formatDate(dateStr, format = 'full') {
    const date = new Date(dateStr);
    if (format === 'short') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = '';
        }, 300);
    }, 3000);
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            switchSection(link.dataset.section);
        });
    });
    
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('show');
    });
    
    // Currency selector
    document.getElementById('currencySelector').addEventListener('change', () => {
        refreshAllData();
        updateGoldPriceDisplay();
    });
    
    // Refresh prices
    document.getElementById('refreshPricesBtn').addEventListener('click', fetchLiveGoldPrice);
    
    // Dashboard filters
    document.getElementById('dashboardPeriod').addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            document.getElementById('customDateRange').style.display = 'flex';
        } else {
            document.getElementById('customDateRange').style.display = 'none';
            refreshAllData();
        }
    });
    
    document.getElementById('startDate').addEventListener('change', refreshAllData);
    document.getElementById('endDate').addEventListener('change', refreshAllData);
    document.getElementById('comparePeriod').addEventListener('change', refreshAllData);
    document.getElementById('comparisonYear').addEventListener('change', updateMonthlyComparisonChart);
    
    // Sales filters
    document.getElementById('salesSearch').addEventListener('input', renderSalesTable);
    document.getElementById('salesStartDate').addEventListener('change', renderSalesTable);
    document.getElementById('salesEndDate').addEventListener('change', renderSalesTable);
    document.getElementById('purityFilter').addEventListener('change', renderSalesTable);
    
    // Expense filters
    document.getElementById('expenseCategoryFilter').addEventListener('change', renderExpensesTable);
    document.getElementById('expenseStartDate').addEventListener('change', renderExpensesTable);
    document.getElementById('expenseEndDate').addEventListener('change', renderExpensesTable);
    document.getElementById('minExpenseAmount').addEventListener('input', renderExpensesTable);
    
    // Report filters
    document.getElementById('reportType').addEventListener('change', updateReports);
    document.getElementById('reportDate').addEventListener('change', updateReports);
    document.getElementById('reportComparison').addEventListener('change', updateReports);
    
    // Customer filters
    document.getElementById('customerSearch').addEventListener('input', renderCustomers);
    document.getElementById('customerTierFilter').addEventListener('change', renderCustomers);
    
    // Modal triggers
    document.getElementById('showAddSaleModal').addEventListener('click', showAddSaleModal);
    document.getElementById('showAddExpenseModal').addEventListener('click', showAddExpenseModal);
    document.getElementById('addPurchase').addEventListener('click', showAddPurchaseModal);
    document.getElementById('updateOpeningStock').addEventListener('click', showOpeningStockModal);
    document.getElementById('showAddCustomerModal').addEventListener('click', showAddCustomerModal);
    document.getElementById('showInventoryAlerts').addEventListener('click', () => {
        document.getElementById('alertsPanel').style.display = 
            document.getElementById('alertsPanel').style.display === 'none' ? 'block' : 'none';
    });
    
    // Form submissions
    document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('purchaseForm').addEventListener('submit', handlePurchaseSubmit);
    document.getElementById('customerForm').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('openingStockForm').addEventListener('submit', handleOpeningStockSubmit);
    
    // Close modal buttons
    document.querySelectorAll('.close, #cancelSale, #cancelExpense, #cancelPurchase, #cancelCustomer, #cancelOpeningStock, #cancelDelete')
        .forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.closest('.modal').id);
            });
        });
    
    // Delete confirmation
    document.getElementById('confirmDelete').addEventListener('click', handleConfirmDelete);
    
    // Calculate total value
    document.getElementById('weight').addEventListener('input', calculateTotalValue);
    document.getElementById('pricePerGram').addEventListener('input', calculateTotalValue);
    
    // Export buttons
    document.getElementById('exportSalesCSV').addEventListener('click', exportSalesCSV);
    document.getElementById('exportExpensesCSV').addEventListener('click', exportExpensesCSV);
    document.getElementById('exportReportPDF')?.addEventListener('click', () => {
        window.print();
    });
    
    // Backup and restore
    document.getElementById('backupBtn').addEventListener('click', backupData);
    document.getElementById('restoreBtn').addEventListener('click', () => {
        document.getElementById('restoreFile').click();
    });
    
    document.getElementById('restoreFile').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            restoreData(e.target.files[0]);
            e.target.value = '';
        }
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

function initializeUI() {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        .alert-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 6px;
            animation: slideIn 0.3s ease;
        }
        
        .alert-danger {
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid var(--danger);
        }
        
        .alert-warning {
            background: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--warning);
        }
        
        .alert-info {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid var(--info);
        }
        
        .customer-footer {
            margin-top: 1rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--gray-200);
            color: var(--gray-500);
            font-size: 0.85rem;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.editSale = function(id) {
    showNotification('Edit feature coming soon!', 'info');
};

window.editExpense = function(id) {
    showNotification('Edit feature coming soon!', 'info');
};

window.confirmDeleteSale = confirmDeleteSale;
window.confirmDeleteExpense = confirmDeleteExpense;
window.confirmDeletePurchase = confirmDeletePurchase;