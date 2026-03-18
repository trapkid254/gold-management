// Client tab switching
function showClientTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.client-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabId + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('#clientNavMenu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(tabId)) {
            link.classList.add('active');
        }
    });

    // Load tab-specific data
    if (tabId === 'trade') {
        initTradingInterface();
    } else if (tabId === 'orders') {
        loadOpenOrders();
    } else if (tabId === 'history') {
        loadTransactionHistory();
    } else if (tabId === 'portfolio') {
        loadPortfolio();
    }
}

// Initialize trading interface
function initTradingInterface() {
    setupTradeForm();
    loadOrderBook();
    initTradingChart();
    
    // Set current price in trade form
    const priceInput = document.getElementById('tradePrice');
    if (priceInput) {
        priceInput.value = Trading.getLivePrice().toFixed(2);
    }
}

// Setup trade form
function setupTradeForm() {
    const tradeTypeBtns = document.querySelectorAll('.trade-type-btn');
    const tradeForm = document.getElementById('tradeForm');
    const amountInput = document.getElementById('tradeAmount');
    const priceInput = document.getElementById('tradePrice');
    const submitBtn = document.getElementById('tradeSubmitBtn');

    // Trade type switching
    tradeTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tradeTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.type;
            document.getElementById('tradeType').value = type;
            
            // Update UI for buy/sell
            if (type === 'buy') {
                submitBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Buy Gold';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                document.querySelector('.available-info').innerHTML = 
                    '<i class="fas fa-info-circle"></i> Available to buy: <span id="availableAmount">' + 
                    Trading.getAvailableGold().toFixed(2) + 'g</span>';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-arrow-down"></i> Sell Gold';
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                const session = Auth.getCurrentUser();
                const userGold = Trading.getUserGoldHoldings(session.email);
                document.querySelector('.available-info').innerHTML = 
                    '<i class="fas fa-info-circle"></i> Available to sell: <span id="availableAmount">' + 
                    userGold.toFixed(2) + 'g</span>';
            }
            
            updateTradePreview();
        });
    });

    // Update preview on input
    amountInput.addEventListener('input', updateTradePreview);
    priceInput.addEventListener('input', updateTradePreview);

    // Form submission
    tradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const session = Auth.getCurrentUser();
        if (!session) {
            alert('Please login again');
            window.location.href = 'client-login.html';
            return;
        }

        const type = document.getElementById('tradeType').value;
        const amount = parseFloat(amountInput.value);
        const price = parseFloat(priceInput.value);

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        let result;
        if (type === 'buy') {
            result = Trading.buyGold(session.email, amount, price);
        } else {
            result = Trading.sellGold(session.email, amount, price);
        }

        if (result.success) {
            alert(type === 'buy' ? 'Purchase successful!' : 'Sale successful!');
            tradeForm.reset();
            updateTradePreview();
            
            // Refresh relevant data
            loadClientDashboard();
            loadOpenOrders();
            loadTransactionHistory();
            loadPortfolio();
            loadOrderBook();
        } else {
            alert(result.message);
        }
    });
}

// Update trade preview
function updateTradePreview() {
    const amount = parseFloat(document.getElementById('tradeAmount').value) || 0;
    const price = parseFloat(document.getElementById('tradePrice').value) || Trading.getLivePrice();
    const type = document.getElementById('tradeType').value;
    
    const calculation = Trading.calculateTotalWithFee(amount, price, type);
    
    document.getElementById('tradeTotal').textContent = Trading.formatPrice(calculation.subtotal);
    document.getElementById('tradeFee').textContent = Trading.formatPrice(calculation.fee);
    document.getElementById('tradeFinal').textContent = Trading.formatPrice(calculation.total);
    
    // Update available info
    const session = Auth.getCurrentUser();
    if (session) {
        const availableSpan = document.getElementById('availableAmount');
        if (availableSpan) {
            if (type === 'buy') {
                availableSpan.textContent = Trading.getAvailableGold().toFixed(2) + 'g';
            } else {
                const userGold = Trading.getUserGoldHoldings(session.email);
                availableSpan.textContent = userGold.toFixed(2) + 'g';
            }
        }
    }
}

// Load order book
function loadOrderBook() {
    const orderBook = Trading.getOrderBook();
    const bidsContainer = document.getElementById('orderBookBids');
    const asksContainer = document.getElementById('orderBookAsks');

    if (bidsContainer) {
        bidsContainer.innerHTML = '';
        orderBook.bids.forEach(bid => {
            const row = document.createElement('div');
            row.className = 'order-book-row bid';
            row.innerHTML = `
                <span class="price positive">$${bid.limitPrice.toFixed(2)}</span>
                <span>${bid.amount}g</span>
                <span>$${(bid.amount * bid.limitPrice).toFixed(2)}</span>
            `;
            bidsContainer.appendChild(row);
        });
    }

    if (asksContainer) {
        asksContainer.innerHTML = '';
        orderBook.asks.forEach(ask => {
            const row = document.createElement('div');
            row.className = 'order-book-row ask';
            row.innerHTML = `
                <span class="price negative">$${ask.limitPrice.toFixed(2)}</span>
                <span>${ask.amount}g</span>
                <span>$${(ask.amount * ask.limitPrice).toFixed(2)}</span>
            `;
            asksContainer.appendChild(row);
        });
    }
}

// Initialize trading chart
let tradingChart;
function initTradingChart() {
    const ctx = document.getElementById('tradingChart')?.getContext('2d');
    if (!ctx) return;

    // Generate sample historical data
    const labels = [];
    const data = [];
    let price = Trading.getLivePrice();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - i);
        labels.push(date.getHours() + ':' + date.getMinutes().toString().padStart(2,'0'));
        
        price = price + (Math.random() - 0.5) * 2;
        data.push(price);
    }

    tradingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gold Price',
                data: data,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Price: ' + Trading.formatPrice(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: '#e5e7eb' },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Update trading chart
function updateTradingChart(newPrice) {
    if (!tradingChart) return;
    
    // Add new data point
    const now = new Date();
    const timeLabel = now.getHours() + ':' + now.getMinutes().toString().padStart(2,'0');
    
    tradingChart.data.labels.push(timeLabel);
    tradingChart.data.datasets[0].data.push(newPrice);
    
    // Remove old data points if too many
    if (tradingChart.data.labels.length > 50) {
        tradingChart.data.labels.shift();
        tradingChart.data.datasets[0].data.shift();
    }
    
    tradingChart.update();
}

// Load open orders
function loadOpenOrders() {
    const session = Auth.getCurrentUser();
    if (!session) return;

    const orders = JSON.parse(localStorage.getItem('client_orders')) || [];
    const userOrders = orders.filter(o => o.clientEmail === session.email && o.status === 'pending');
    const tbody = document.getElementById('openOrdersBody');

    if (tbody) {
        tbody.innerHTML = '';
        userOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(order.created).toLocaleDateString()}</td>
                <td><span class="order-type ${order.type}">${order.type.toUpperCase()}</span></td>
                <td>${order.amount}g</td>
                <td>${Trading.formatPrice(order.limitPrice)}</td>
                <td>${Trading.formatPrice(order.amount * order.limitPrice)}</td>
                <td><span class="status-badge pending">Pending</span></td>
                <td>
                    <button class="btn-icon cancel-order" data-id="${order.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add cancel handlers
        document.querySelectorAll('.cancel-order').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.dataset.id;
                if (confirm('Cancel this order?')) {
                    Trading.cancelOrder(orderId);
                    loadOpenOrders();
                }
            });
        });
    }
}

// Load transaction history
function loadTransactionHistory() {
    const session = Auth.getCurrentUser();
    if (!session) return;

    const purchases = JSON.parse(localStorage.getItem('client_purchases')) || [];
    const orders = JSON.parse(localStorage.getItem('client_orders')) || [];
    
    const allTransactions = [
        ...purchases.filter(p => p.clientEmail === session.email),
        ...orders.filter(o => o.clientEmail === session.email && o.status === 'completed')
    ];
    
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('historyBody');
    if (tbody) {
        tbody.innerHTML = '';
        allTransactions.forEach(t => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td><span class="order-type ${t.type}">${t.type.toUpperCase()}</span></td>
                <td>${t.amount}g</td>
                <td>${Trading.formatPrice(t.price || t.limitPrice)}</td>
                <td>${Trading.formatPrice(t.total || (t.amount * t.price))}</td>
                <td><span class="status-badge completed">Completed</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Load portfolio
function loadPortfolio() {
    const session = Auth.getCurrentUser();
    if (!session) return;

    const summary = Trading.getPortfolioSummary(session.email);
    
    document.getElementById('portfolioTotalGold').textContent = summary.totalGold.toFixed(2) + 'g';
    document.getElementById('portfolioCurrentValue').textContent = Trading.formatPrice(summary.currentValue);
    document.getElementById('portfolioPnL').textContent = Trading.formatPrice(summary.pnl);
    document.getElementById('portfolioPnLPercent').textContent = summary.pnlPercent.toFixed(2) + '%';
    document.getElementById('portfolioAvgPrice').textContent = Trading.formatPrice(summary.avgBuyPrice);

    // Load holdings breakdown
    const holdings = Trading.getUserHoldingsDetails(session.email);
    const tbody = document.getElementById('holdingsBody');
    
    if (tbody) {
        tbody.innerHTML = '';
        holdings.forEach(h => {
            const currentPrice = Trading.getLivePrice();
            const currentValue = h.amount * currentPrice;
            const costBasis = h.subtotal || (h.amount * h.price);
            const pnl = currentValue - costBasis;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(h.date).toLocaleDateString()}</td>
                <td>${h.amount}g</td>
                <td>${h.purity || '99.99'}%</td>
                <td>${Trading.formatPrice(h.price)}</td>
                <td>${Trading.formatPrice(currentValue)}</td>
                <td class="${pnl >= 0 ? 'positive' : 'negative'}">
                    ${Trading.formatPrice(pnl)} (${((pnl / costBasis) * 100).toFixed(2)}%)
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Initialize portfolio chart
    initPortfolioChart(holdings);
}

// Initialize portfolio distribution chart
function initPortfolioChart(holdings) {
    const ctx = document.getElementById('portfolioChart')?.getContext('2d');
    if (!ctx || holdings.length === 0) return;

    // Group by purity
    const byPurity = {};
    holdings.forEach(h => {
        const purity = h.purity || '99.99';
        byPurity[purity] = (byPurity[purity] || 0) + h.amount;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(byPurity).map(p => p + '% Purity'),
            datasets: [{
                data: Object.values(byPurity),
                backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Make showClientTab global
window.showClientTab = showClientTab;