// trading.js - Enhanced Trading operations

const Trading = {
    // Get live gold price (simulated with realistic movements)
    getLivePrice: function() {
        const basePrice = 1945.30;
        // Simulate more realistic price movements
        const trend = Math.sin(Date.now() / 10000) * 5; // Slow sine wave
        const noise = (Math.random() - 0.5) * 2; // Small random noise
        return basePrice + trend + noise;
    },

    // Get bid/ask prices
    getBidAsk: function() {
        const price = this.getLivePrice();
        return {
            bid: price - 0.5,
            ask: price + 0.5,
            spread: 1.0
        };
    },

    // Format price
    formatPrice: function(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    },

    // Calculate total with fee
    calculateTotalWithFee: function(amount, price, type = 'buy') {
        const subtotal = amount * price;
        const fee = subtotal * 0.001; // 0.1% fee
        return {
            subtotal: subtotal,
            fee: fee,
            total: type === 'buy' ? subtotal + fee : subtotal - fee
        };
    },

    // Buy gold
    buyGold: function(clientEmail, amount, price) {
        const calculation = this.calculateTotalWithFee(amount, price, 'buy');
        
        // Check wallet balance
        const wallet = Storage.getClientWallet(clientEmail);
        if (wallet < calculation.total) {
            return { success: false, message: 'Insufficient funds' };
        }

        // Check available inventory
        const availableGold = this.getAvailableGold();
        if (availableGold < amount) {
            return { success: false, message: 'Insufficient inventory' };
        }

        // Create purchase
        const purchase = {
            clientEmail: clientEmail,
            type: 'buy',
            amount: amount,
            price: price,
            subtotal: calculation.subtotal,
            fee: calculation.fee,
            total: calculation.total,
            status: 'completed',
            date: new Date().toISOString(),
            dateStr: new Date().toISOString().split('T')[0]
        };

        // Save to storage
        const purchases = JSON.parse(localStorage.getItem('client_purchases')) || [];
        purchase.id = Date.now();
        purchases.push(purchase);
        localStorage.setItem('client_purchases', JSON.stringify(purchases));

        // Update wallet
        Storage.updateClientWallet(clientEmail, -calculation.total);

        // Record sale in admin system
        const sales = Storage.getSales();
        sales.push({
            id: Date.now() + 1,
            buyerName: clientEmail,
            weight: amount,
            purity: 99.99,
            pricePerGram: price,
            total: calculation.subtotal,
            date: new Date().toISOString().split('T')[0],
            type: 'market_sale'
        });
        localStorage.setItem('gold_sales', JSON.stringify(sales));

        // Reduce inventory
        this.reduceInventory(amount);

        return { success: true, purchase: purchase };
    },

    // Sell gold
    sellGold: function(clientEmail, amount, price) {
        const calculation = this.calculateTotalWithFee(amount, price, 'sell');
        
        // Check if user has enough gold
        const userGold = this.getUserGoldHoldings(clientEmail);
        if (userGold < amount) {
            return { success: false, message: 'Insufficient gold holdings' };
        }

        // Create sell order
        const sellOrder = {
            clientEmail: clientEmail,
            type: 'sell',
            amount: amount,
            price: price,
            subtotal: calculation.subtotal,
            fee: calculation.fee,
            total: calculation.total,
            status: 'completed',
            date: new Date().toISOString(),
            dateStr: new Date().toISOString().split('T')[0]
        };

        // Save to storage
        const orders = JSON.parse(localStorage.getItem('client_orders')) || [];
        sellOrder.id = Date.now();
        orders.push(sellOrder);
        localStorage.setItem('client_orders', JSON.stringify(orders));

        // Update wallet (add money)
        Storage.updateClientWallet(clientEmail, calculation.total);

        // Mark gold as sold in holdings
        this.markGoldAsSold(clientEmail, amount);

        return { success: true, order: sellOrder };
    },

    // Place limit order
    placeLimitOrder: function(clientEmail, type, amount, limitPrice) {
        const order = {
            clientEmail: clientEmail,
            type: type,
            amount: amount,
            limitPrice: limitPrice,
            status: 'pending',
            created: new Date().toISOString(),
            id: Date.now()
        };

        const orders = JSON.parse(localStorage.getItem('limit_orders')) || [];
        orders.push(order);
        localStorage.setItem('limit_orders', JSON.stringify(orders));

        return { success: true, order: order };
    },

    // Get user's gold holdings
    getUserGoldHoldings: function(clientEmail) {
        const purchases = JSON.parse(localStorage.getItem('client_purchases')) || [];
        const sells = JSON.parse(localStorage.getItem('client_orders')) || [];
        
        const bought = purchases
            .filter(p => p.clientEmail === clientEmail && p.type === 'buy')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const sold = sells
            .filter(s => s.clientEmail === clientEmail && s.type === 'sell' && s.status === 'completed')
            .reduce((sum, s) => sum + s.amount, 0);
        
        return bought - sold;
    },

    // Get user's holdings with details
    getUserHoldingsDetails: function(clientEmail) {
        const purchases = JSON.parse(localStorage.getItem('client_purchases')) || [];
        const sells = JSON.parse(localStorage.getItem('client_orders')) || [];
        
        // Get all buy orders
        const buys = purchases.filter(p => p.clientEmail === clientEmail && p.type === 'buy');
        
        // Get all completed sells
        const completedSells = sells.filter(s => s.clientEmail === clientEmail && s.type === 'sell' && s.status === 'completed');
        
        // Calculate remaining holdings using FIFO method
        let holdings = [];
        let remainingBuys = [...buys];
        
        completedSells.forEach(sell => {
            let remainingSellAmount = sell.amount;
            
            while (remainingSellAmount > 0 && remainingBuys.length > 0) {
                const buy = remainingBuys[0];
                const amountToTake = Math.min(buy.amount, remainingSellAmount);
                
                buy.amount -= amountToTake;
                remainingSellAmount -= amountToTake;
                
                if (buy.amount === 0) {
                    remainingBuys.shift();
                }
            }
        });
        
        return remainingBuys;
    },

    // Get user's portfolio summary
    getPortfolioSummary: function(clientEmail) {
        const holdings = this.getUserHoldingsDetails(clientEmail);
        const currentPrice = this.getLivePrice();
        
        let totalGold = 0;
        let totalCost = 0;
        let totalCurrentValue = 0;
        
        holdings.forEach(h => {
            totalGold += h.amount;
            totalCost += h.subtotal || (h.amount * h.price);
            totalCurrentValue += h.amount * currentPrice;
        });
        
        const avgBuyPrice = totalGold > 0 ? totalCost / totalGold : 0;
        const pnl = totalCurrentValue - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
        
        return {
            totalGold: totalGold,
            totalCost: totalCost,
            currentValue: totalCurrentValue,
            avgBuyPrice: avgBuyPrice,
            pnl: pnl,
            pnlPercent: pnlPercent
        };
    },

    // Get available gold in inventory
    getAvailableGold: function() {
        const inventory = Storage.getInventory();
        return inventory
            .filter(item => item.status === 'available')
            .reduce((sum, item) => sum + item.weight, 0);
    },

    // Reduce inventory
    reduceInventory: function(amount) {
        let inventory = Storage.getInventory();
        let remainingToReduce = amount;
        
        inventory = inventory.map(item => {
            if (remainingToReduce > 0 && item.status === 'available') {
                if (item.weight <= remainingToReduce) {
                    remainingToReduce -= item.weight;
                    item.status = 'sold';
                } else {
                    // Split the item
                    const newItem = {
                        id: Date.now() + Math.random(),
                        weight: item.weight - remainingToReduce,
                        purity: item.purity,
                        status: 'available',
                        date: item.date,
                        source: item.source
                    };
                    inventory.push(newItem);
                    item.weight = remainingToReduce;
                    item.status = 'sold';
                    remainingToReduce = 0;
                }
            }
            return item;
        });
        
        localStorage.setItem('gold_inventory', JSON.stringify(inventory));
    },

    // Mark gold as sold (for sell orders)
    markGoldAsSold: function(clientEmail, amount) {
        // This is handled by the FIFO logic in getUserHoldingsDetails
        // We just need to record the sell transaction
        const sells = JSON.parse(localStorage.getItem('client_orders')) || [];
        localStorage.setItem('client_orders', JSON.stringify(sells));
    },

    // Get order book
    getOrderBook: function() {
        const limitOrders = JSON.parse(localStorage.getItem('limit_orders')) || [];
        const currentPrice = this.getLivePrice();
        
        // Get pending limit orders
        const pendingOrders = limitOrders.filter(o => o.status === 'pending');
        
        // Separate bids (buy orders) and asks (sell orders)
        const bids = pendingOrders
            .filter(o => o.type === 'buy')
            .sort((a, b) => b.limitPrice - a.limitPrice)
            .slice(0, 5);
        
        const asks = pendingOrders
            .filter(o => o.type === 'sell')
            .sort((a, b) => a.limitPrice - b.limitPrice)
            .slice(0, 5);
        
        return { bids, asks, spread: 1.0 };
    },

    // Cancel order
    cancelOrder: function(orderId) {
        const orders = JSON.parse(localStorage.getItem('limit_orders')) || [];
        const index = orders.findIndex(o => o.id == orderId);
        
        if (index !== -1) {
            orders[index].status = 'cancelled';
            localStorage.setItem('limit_orders', JSON.stringify(orders));
            return { success: true };
        }
        
        return { success: false, message: 'Order not found' };
    }
};

// Start price updates
function startPriceUpdates() {
    setInterval(() => {
        const price = Trading.getLivePrice();
        const bidAsk = Trading.getBidAsk();
        
        // Update all price displays
        const priceElements = document.querySelectorAll('#liveGoldPrice, #dashboardGoldPrice, #clientLiveGold, #tradeCurrentPrice, #currentPrice, #spotGoldPrice');
        priceElements.forEach(el => {
            if (el) el.textContent = Trading.formatPrice(price);
        });

        // Update bid/ask
        const bidEl = document.getElementById('bidPrice');
        const askEl = document.getElementById('askPrice');
        const spreadEl = document.getElementById('spread');
        if (bidEl) bidEl.textContent = Trading.formatPrice(bidAsk.bid);
        if (askEl) askEl.textContent = Trading.formatPrice(bidAsk.ask);
        if (spreadEl) spreadEl.textContent = Trading.formatPrice(bidAsk.spread);

        // Update change
        const change = ((price - 1945.30) / 1945.30 * 100).toFixed(2);
        const changeElements = document.querySelectorAll('#goldChange, #dailyChange, #spotGoldChange, #tradePriceChange');
        changeElements.forEach(el => {
            if (el) {
                el.textContent = (change > 0 ? '+' : '') + change + '%';
                el.className = change >= 0 ? 'positive' : 'negative';
            }
        });

        // Update high/low
        const dailyHigh = price + (Math.random() * 10);
        const dailyLow = price - (Math.random() * 10);
        const highEl = document.getElementById('dailyHigh');
        const lowEl = document.getElementById('dailyLow');
        if (highEl) highEl.textContent = Trading.formatPrice(dailyHigh);
        if (lowEl) lowEl.textContent = Trading.formatPrice(dailyLow);

        // Update last update time
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            const now = new Date();
            lastUpdateEl.textContent = `Just now (${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')})`;
        }

        // Trigger chart updates if available
        if (typeof updateTradingChart === 'function') {
            updateTradingChart(price);
        }
    }, 3000);
}

// Start updates when page loads
document.addEventListener('DOMContentLoaded', startPriceUpdates);