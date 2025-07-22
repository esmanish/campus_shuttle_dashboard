// Authentication system for NITK EGO Vehicle Tracker
class AuthSystem {
    constructor() {
        this.users = {
            // Engineers
            'manish.es': { password: 'ego2025', role: 'engineer', name: 'Manish ES', department: 'Mechatronics' },
            'engineer1': { password: 'nitk123', role: 'engineer', name: 'Engineering Team', department: 'Electronics' },
            'engineer2': { password: 'nitk123', role: 'engineer', name: 'Engineering Team', department: 'Software' },
            
            // Professors
            'prof.gangadharan': { password: 'prof2025', role: 'professor', name: 'Dr. K.V Gangadharan', department: 'Mechanical' },
            'prof.pruthviraj': { password: 'prof2025', role: 'professor', name: 'Dr. Pruthviraj U', department: 'Mechanical' },
            
            // Project Lead
            'lead.manish': { password: 'lead2025', role: 'lead', name: 'Project Lead', department: 'All Departments' }
        };
        
        this.currentUser = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEvents());
        } else {
            this.setupEvents();
        }
    }

    setupEvents() {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Add enter key support for better UX
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin(e);
                }
            });
        });

        // Check if user is already logged in
        this.checkExistingSession();
    }

    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        const errorMessage = document.getElementById('errorMessage');
        
        // Clear previous error
        this.hideError();
        
        // Validate inputs
        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Authenticate user
        const user = this.authenticateUser(username, password, selectedRole);
        
        if (user) {
            this.loginSuccess(user);
        } else {
            this.showError('Invalid credentials or incorrect role');
            this.addShakeAnimation();
        }
    }

    authenticateUser(username, password, selectedRole) {
        const user = this.users[username];
        
        if (user && user.password === password && user.role === selectedRole) {
            return user;
        }
        
        return null;
    }

    loginSuccess(user) {
        // Store user session
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        // Show success animation
        this.showLoginAnimation();
        
        // Redirect to dashboard after animation
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showLoginAnimation() {
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        
        loginBtn.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 16px; height: 16px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                Accessing System...
            </span>
        `;
        
        loginBtn.style.background = 'linear-gradient(135deg, #00FF88, #00CC66)';
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto hide error after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.style.display = 'none';
    }

    addShakeAnimation() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        
        // Add shake keyframes if not exists
        if (!document.querySelector('#shake-styles')) {
            const style = document.createElement('style');
            style.id = 'shake-styles';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove animation after completion
        setTimeout(() => {
            loginCard.style.animation = 'slideUp 0.8s ease-out';
        }, 500);
    }

    checkExistingSession() {
        // Check if on login page and user is already logged in
        if (window.location.pathname.includes('login.html')) {
            const user = sessionStorage.getItem('currentUser');
            if (user) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'index.html';
            }
        }
    }

    // Method to check authentication status (for other pages)
    isAuthenticated() {
        const user = sessionStorage.getItem('currentUser');
        const loginTime = sessionStorage.getItem('loginTime');
        
        if (!user || !loginTime) {
            return false;
        }
        
        // Check session timeout (24 hours)
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > 24) {
            this.logout();
            return false;
        }
        
        this.currentUser = JSON.parse(user);
        return true;
    }

    // Get current user info
    getCurrentUser() {
        if (this.isAuthenticated()) {
            return this.currentUser;
        }
        return null;
    }

    // Logout method
    logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // Method to require authentication (call from other pages)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Get user role-based permissions
    hasPermission(action) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const permissions = {
            engineer: ['view_technical', 'view_timeline', 'view_gallery', 'update_progress'],
            professor: ['view_all', 'view_research', 'view_financial', 'generate_reports'],
            lead: ['full_access', 'manage_team', 'edit_all', 'financial_control']
        };
        
        const userPermissions = permissions[user.role] || [];
        return userPermissions.includes(action) || userPermissions.includes('full_access');
    }
}

// Initialize authentication system
const auth = new AuthSystem();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
} else {
    window.AuthSystem = AuthSystem;
    window.auth = auth;
}