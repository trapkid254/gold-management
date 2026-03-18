// reports.js - Reports and charts

let salesChart, expenseChart, profitChart;

const Reports = {
    initCharts: function() {
        const ctx1 = document.getElementById('salesChart')?.getContext('2d');
        const ctx2 = document.getElementById('expenseChart')?.getContext('2d');
        const ctx3 = document.getElementById('profitChart')?.getContext('2d');

        if (ctx1) {
            salesChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Sales',
                        data: [],
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#e5e7eb' }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        }
                    }
                }
            });
        }

        if (ctx2) {
            expenseChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Expenses',
                        data: [],
                        backgroundColor: '#ef4444',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#e5e7eb' }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        }
                    }
                }
            });
        }

        if (ctx3) {
            profitChart = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Profit',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#e5e7eb' }
                        }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#e5e7eb' }
                        }
                    }
                }
            });
        }
    },

    updateCharts: function(period) {
        const sales = Storage.getSales();
        const expenses = Storage.getExpenses();
        
        let labels = [];
        let salesData = [];
        let expensesData = [];
        let profitData = [];

        const now = new Date();
        
        if (period === 'daily') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                labels.push(dateStr);
                
                const daySales = sales
                    .filter(s => s.date === dateStr)
                    .reduce((sum, s) => sum + (s.total || 0), 0);
                salesData.push(daySales);
                
                const dayExpenses = expenses
                    .filter(e => e.date === dateStr)
                    .reduce((sum, e) => sum + (e.amount || 0), 0);
                expensesData.push(dayExpenses);
                
                profitData.push(daySales - dayExpenses);
            }
        } else if (period === 'weekly') {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                labels.push(`Week ${4-i}`);
                
                const weekSales = sales
                    .filter(s => {
                        const d = new Date(s.date);
                        return d >= weekStart && d <= weekEnd;
                    })
                    .reduce((sum, s) => sum + (s.total || 0), 0);
                salesData.push(weekSales);
                
                const weekExpenses = expenses
                    .filter(e => {
                        const d = new Date(e.date);
                        return d >= weekStart && d <= weekEnd;
                    })
                    .reduce((sum, e) => sum + (e.amount || 0), 0);
                expensesData.push(weekExpenses);
                
                profitData.push(weekSales - weekExpenses);
            }
        } else if (period === 'monthly') {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now);
                month.setMonth(month.getMonth() - i);
                const monthStr = month.toLocaleString('default', { month: 'short' });
                labels.push(monthStr);
                
                const monthSales = sales
                    .filter(s => {
                        const d = new Date(s.date);
                        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                    })
                    .reduce((sum, s) => sum + (s.total || 0), 0);
                salesData.push(monthSales);
                
                const monthExpenses = expenses
                    .filter(e => {
                        const d = new Date(e.date);
                        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                    })
                    .reduce((sum, e) => sum + (e.amount || 0), 0);
                expensesData.push(monthExpenses);
                
                profitData.push(monthSales - monthExpenses);
            }
        }

        // Update charts
        if (salesChart) {
            salesChart.data.labels = labels;
            salesChart.data.datasets[0].data = salesData;
            salesChart.update();
        }

        if (expenseChart) {
            expenseChart.data.labels = labels;
            expenseChart.data.datasets[0].data = expensesData;
            expenseChart.update();
        }

        if (profitChart) {
            profitChart.data.labels = labels;
            profitChart.data.datasets[0].data = profitData;
            profitChart.update();
        }
    },

    exportToCSV: function(type) {
        let data = [];
        let headers = [];
        
        switch(type) {
            case 'sales':
                data = Storage.getSales();
                headers = ['Date', 'Buyer', 'Weight', 'Purity', 'Price/g', 'Total'];
                break;
            case 'expenses':
                data = Storage.getExpenses();
                headers = ['Date', 'Type', 'Amount', 'Notes'];
                break;
            case 'inventory':
                data = Storage.getInventory();
                headers = ['ID', 'Weight', 'Purity', 'Status'];
                break;
        }

        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        let csv = headers.join(',') + '\n';
        
        data.forEach(item => {
            const row = headers.map(header => {
                const key = header.toLowerCase().replace(/[^a-z]/g, '');
                return item[key] || item[header.toLowerCase()] || '';
            });
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        alert('Export started');
    }
};

// Initialize charts on admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('reportsTab')) {
        Reports.initCharts();
        Reports.updateCharts('daily');
    }
});

// Make export function global
window.exportToCSV = Reports.exportToCSV;