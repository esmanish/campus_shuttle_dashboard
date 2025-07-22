// Simplified Authentication for NITK EGO Vehicle Platform
class AuthSystem {
    constructor() {
        this.users = {
            // Student Lead (Manish ES)
            'manish.es': { 
                password: '7410', 
                role: 'student_lead', 
                name: 'Manish ES', 
                department: 'Mechatronics'
            },
            
            // Admin accounts
            'admin': { 
                password: 'admin2025', 
                role: 'admin', 
                name: 'System Administrator', 
                department: 'Administration'
            },
            
            // Engineers
            'engineer1': { 
                password: 'eng2025', 
                role: 'engineer', 
                name: 'Arjun Kumar', 
                department: 'Electronics'
            },
            'engineer2': { 
                password: 'eng2025', 
                role: 'engineer', 
                name: 'Priya Sharma', 
                department: 'Computer Science'
            },
            
            // Guests (Interns/Volunteers)
            'guest1': { 
                password: 'guest2025', 
                role: 'guest', 
                name: 'Sneha Reddy', 
                department: 'Information Technology'
            },
            'guest2': { 
                password: 'guest2025', 
                role: 'guest', 
                name: 'Volunteer User', 
                department: 'General'
            }
        };
        
        this.currentUser = null;
        this.initializeEventListeners();
    }

    // Define which menus each role can see
    getRoleMenus(role) {
        const roleMenus = {
            student_lead: ['RESEARCH', 'EGO-VEHICLE', 'LEARN', 'ADMINISTRATION', 'THESIS'],
            admin: ['RESEARCH', 'EGO-VEHICLE', 'LEARN', 'ADMINISTRATION'],
            engineer: ['RESEARCH', 'EGO-VEHICLE', 'LEARN'],
            guest: ['EGO-VEHICLE', 'LEARN']
        };
        return roleMenus[role] || ['EGO-VEHICLE', 'LEARN'];
    }

    initializeEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEvents());
        } else {
            this.setupEvents();
        }
    }

    setupEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin(e);
                }
            });
        });

        this.checkExistingSession();
    }

    handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        
        this.hideError();
        
        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

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
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        this.showLoginAnimation();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showLoginAnimation() {
        const loginBtn = document.querySelector('.login-btn');
        
        loginBtn.innerHTML = `
            <span style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 16px; height: 16px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                Accessing System...
            </span>
        `;
        
        loginBtn.style.background = 'linear-gradient(135deg, #00FF88, #00CC66)';
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    addShakeAnimation() {
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        
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
        
        setTimeout(() => {
            loginCard.style.animation = 'slideUp 0.8s ease-out';
        }, 500);
    }

    checkExistingSession() {
        if (window.location.pathname.includes('login.html')) {
            const user = sessionStorage.getItem('currentUser');
            if (user) {
                window.location.href = 'index.html';
            }
        }
    }

    isAuthenticated() {
        const user = sessionStorage.getItem('currentUser');
        const loginTime = sessionStorage.getItem('loginTime');
        
        if (!user || !loginTime) {
            return false;
        }
        
        this.currentUser = JSON.parse(user);
        return true;
    }

    getCurrentUser() {
        if (this.isAuthenticated()) {
            return this.currentUser;
        }
        return null;
    }

    logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('loginTime');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
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