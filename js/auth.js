// auth.js - Authentication management

const Auth = {
    // Client login
    clientLogin: function(email, password) {
        console.log('Attempting client login:', email, password);
        
        const users = Storage.getUsers();
        console.log('Users in system:', users);
        
        // Case-insensitive email comparison
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password && 
            u.role === 'client'
        );
        
        if (user) {
            const sessionUser = { email: user.email, role: user.role };
            Storage.setSession(sessionUser);
            return { success: true, user: sessionUser };
        }
        
        return { success: false, message: 'Invalid email or password' };
    },

    // Admin login
    adminLogin: function(email, password) {
        console.log('Attempting admin login:', email, password);
        
        const users = Storage.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password && 
            u.role === 'admin'
        );
        
        if (user) {
            const sessionUser = { email: user.email, role: user.role };
            Storage.setSession(sessionUser);
            return { success: true, user: sessionUser };
        }
        
        return { success: false, message: 'Invalid admin credentials' };
    },

    // Logout
    logout: function() {
        Storage.clearSession();
        window.location.href = 'index.html';
    },

    // Get current user
    getCurrentUser: function() {
        return Storage.getSession();
    },

    // Check if logged in
    isLoggedIn: function() {
        return Storage.getSession() !== null;
    },

    // Require authentication
    requireAuth: function(role) {
        const session = Storage.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return false;
        }
        if (role && session.role !== role) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Setup login forms
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded');
    
    // Client login form
    const clientLoginForm = document.getElementById('clientLoginForm');
    if (clientLoginForm) {
        clientLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMessage');
            
            const result = Auth.clientLogin(email, password);
            
            if (result.success) {
                if (errorMsg) errorMsg.style.display = 'none';
                window.location.href = 'client-dashboard.html';
            } else {
                if (errorMsg) {
                    errorMsg.textContent = result.message;
                    errorMsg.style.display = 'block';
                } else {
                    alert(result.message);
                }
            }
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            const errorMsg = document.getElementById('errorMessage');
            
            const result = Auth.adminLogin(email, password);
            
            if (result.success) {
                if (errorMsg) errorMsg.style.display = 'none';
                window.location.href = 'admin-dashboard.html';
            } else {
                if (errorMsg) {
                    errorMsg.textContent = result.message;
                    errorMsg.style.display = 'block';
                } else {
                    alert(result.message);
                }
            }
        });
    }

    // Logout buttons
    const logoutBtns = document.querySelectorAll('#logoutBtn, #adminLogoutBtn');
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                Auth.logout();
            });
        }
    });
});