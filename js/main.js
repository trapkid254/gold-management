// main.js - Main initialization file

document.addEventListener('DOMContentLoaded', function() {
    console.log('AURUM GOLD Trading System initialized');
    
    // Initialize storage (will only create if not exists)
    Storage.init();
    
    // Setup navigation
    setupNavigation();
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
        });

        // Load saved theme
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    // Mobile menu
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Load homepage products
    if (document.getElementById('productsGrid')) {
        loadHomepageProducts();
    }
});

function setupNavigation() {
    // Client login buttons
    const clientLoginBtn = document.getElementById('clientLoginBtn');
    const heroClientBtn = document.getElementById('heroClientBtn');
    
    if (clientLoginBtn) {
        clientLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'client-login.html';
        });
    }
    
    if (heroClientBtn) {
        heroClientBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'client-login.html';
        });
    }

    // Market button
    const marketBtn = document.getElementById('marketBtn');
    if (marketBtn) {
        marketBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('market').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function loadHomepageProducts() {
    const inventory = Storage.getInventory();
    const availableItems = inventory.filter(item => item.status === 'available').slice(0, 4);
    const grid = document.getElementById('productsGrid');

    if (grid) {
        if (availableItems.length === 0) {
            grid.innerHTML = '<p>No products available</p>';
            return;
        }
        
        grid.innerHTML = '';
        availableItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>${item.weight}g Gold Bar</h3>
                <p>Purity: ${item.purity}%</p>
                <p class="price gold-text">${Trading.formatPrice(item.weight * Trading.getLivePrice())}</p>
                <p class="price-per-gram">${Trading.formatPrice(Trading.getLivePrice())}/g</p>
            `;
            grid.appendChild(card);
        });
    }

    // Update total inventory
    const totalEl = document.getElementById('totalInventory');
    if (totalEl) {
        const total = availableItems.reduce((sum, i) => sum + i.weight, 0);
        totalEl.textContent = total.toFixed(2) + 'g';
    }
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Page is visible again, refresh data if needed
        if (typeof loadClientDashboard === 'function' && document.getElementById('clientInventory')) {
            loadClientDashboard();
        }
        if (typeof loadAdminDashboard === 'function' && document.getElementById('salesTable')) {
            loadAdminDashboard();
        }
    }
});