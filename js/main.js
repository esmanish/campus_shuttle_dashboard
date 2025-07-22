// Main Dashboard Controller for NITK EGO Vehicle Tracker
class DashboardController {
    constructor() {
        this.currentSection = 'dashboard';
        this.userPermissions = {};
        this.dataManager = null;
        this.vehicle3D = null;
        
        this.init();
    }

    async init() {
        // Check authentication first
        if (!auth.requireAuth()) {
            return;
        }

        // Show loading overlay
        this.showLoading('Initializing System...');

        try {
            // Initialize components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load user interface
            this.loadUserInterface();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize 3D viewer
            this.init3DViewer();
            
            // Hide loading overlay
            setTimeout(() => this.hideLoading(), 1500);
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async initializeComponents() {
        // Initialize data manager
        if (typeof DataManager !== 'undefined') {
            this.dataManager = new DataManager();
        }
        
        // Initialize 3D viewer
        if (typeof Vehicle3D !== 'undefined') {
            this.vehicle3D = new Vehicle3D('vehicle3d');
        }

        // Get user permissions
        const user = auth.getCurrentUser();
        this.userPermissions = this.getUserPermissions(user.role);
    }

    setupEventListeners() {
        // Navigation events
        this.setupNavigationEvents();
        
        // Header events
        this.setupHeaderEvents();
        
        // Section events
        this.setupSectionEvents();
        
        // Global events
        this.setupGlobalEvents();
    }

    setupNavigationEvents() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    }

    setupHeaderEvents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Mobile menu toggle (for responsive)
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }

    setupSectionEvents() {
        // Dashboard events
        this.setupDashboardEvents();
        
        // Technical section events
        this.setupTechnicalEvents();
        
        // Gallery events
        this.setupGalleryEvents();
    }

    setupDashboardEvents() {
        // 3D viewer controls
        const resetViewBtn = document.getElementById('resetView');
        const wireframeBtn = document.getElementById('toggleWireframe');
        const componentsBtn = document.getElementById('showComponents');

        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                if (this.vehicle3D) {
                    this.vehicle3D.resetView();
                }
            });
        }

        if (wireframeBtn) {
            wireframeBtn.addEventListener('click', () => {
                if (this.vehicle3D) {
                    this.vehicle3D.toggleWireframe();
                }
            });
        }

        if (componentsBtn) {
            componentsBtn.addEventListener('click', () => {
                if (this.vehicle3D) {
                    this.vehicle3D.highlightComponents();
                }
            });
        }
    }

    setupTechnicalEvents() {
        // Component cards interaction
        document.addEventListener('click', (e) => {
            if (e.target.closest('.component-card')) {
                const card = e.target.closest('.component-card');
                this.showComponentDetails(card);
            }
        });
    }

    setupGalleryEvents() {
        // Gallery filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterGallery(filter);
                
                // Update active filter
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupGlobalEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchSection('technical');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchSection('team');
                        break;
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.vehicle3D) {
                this.vehicle3D.onWindowResize();
            }
        });
    }

    loadUserInterface() {
        const user = auth.getCurrentUser();
        if (!user) return;

        // Update header
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userRole').textContent = user.role.toUpperCase();

        // Filter navigation based on permissions
        this.filterNavigationByRole(user.role);
    }

    filterNavigationByRole(role) {
        const navItems = document.querySelectorAll('.nav-item');
        
        const rolePermissions = {
            engineer: ['dashboard', 'technical', 'timeline', 'gallery'],
            professor: ['dashboard', 'technical', 'team', 'timeline', 'research', 'financial'],
            lead: ['dashboard', 'technical', 'team', 'timeline', 'gallery', 'research', 'financial']
        };

        const allowedSections = rolePermissions[role] || [];

        navItems.forEach(item => {
            const section = item.getAttribute('data-section');
            if (!allowedSections.includes(section)) {
                item.style.display = 'none';
            }
        });
    }

    async loadInitialData() {
        try {
            if (this.dataManager) {
                // Load all required data
                await Promise.all([
                    this.dataManager.loadTeamData(),
                    this.dataManager.loadTimelineData(),
                    this.dataManager.loadComponentsData(),
                    this.dataManager.loadResearchData(),
                    this.dataManager.loadFinancialData()
                ]);

                // Update UI with loaded data
                this.updateDashboardStats();
                this.updateRecentActivities();
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    init3DViewer() {
        try {
            if (this.vehicle3D) {
                this.vehicle3D.init();
            } else {
                // Fallback for missing 3D viewer
                const viewer = document.getElementById('vehicle3d');
                if (viewer) {
                    viewer.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: #888;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🚗</div>
                            <div>3D Vehicle Viewer</div>
                            <div style="font-size: 0.8rem; margin-top: 10px;">Loading vehicle model...</div>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('3D viewer initialization failed:', error);
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Load section data if needed
            this.loadSectionData(sectionName);
        }
    }

    async loadSectionData(sectionName) {
        const contentElement = document.querySelector(`#${sectionName}Content`);
        if (!contentElement) return;

        switch (sectionName) {
            case 'team':
                await this.loadTeamSection();
                break;
            case 'timeline':
                await this.loadTimelineSection();
                break;
            case 'gallery':
                await this.loadGallerySection();
                break;
            case 'research':
                await this.loadResearchSection();
                break;
            case 'financial':
                await this.loadFinancialSection();
                break;
        }
    }

    async loadTeamSection() {
        const teamContent = document.getElementById('teamContent');
        if (!teamContent || !this.dataManager) return;

        try {
            const teamData = this.dataManager.getTeamData();
            if (teamData && teamData.length > 0) {
                teamContent.innerHTML = this.generateTeamHTML(teamData);
            } else {
                teamContent.innerHTML = '<div class="loading">No team data available</div>';
            }
        } catch (error) {
            teamContent.innerHTML = '<div class="loading">Failed to load team data</div>';
        }
    }

    async loadTimelineSection() {
        const timelineContent = document.getElementById('timelineContent');
        if (!timelineContent || !this.dataManager) return;

        try {
            const timelineData = this.dataManager.getTimelineData();
            if (timelineData && timelineData.length > 0) {
                timelineContent.innerHTML = this.generateTimelineHTML(timelineData);
            } else {
                timelineContent.innerHTML = '<div class="loading">No timeline data available</div>';
            }
        } catch (error) {
            timelineContent.innerHTML = '<div class="loading">Failed to load timeline data</div>';
        }
    }

    async loadGallerySection() {
        const galleryContent = document.getElementById('galleryContent');
        if (!galleryContent) return;

        // Placeholder gallery content
        galleryContent.innerHTML = `
            <div class="gallery-item">
                <div class="placeholder-image">📷</div>
                <div class="gallery-title">Vehicle Assembly</div>
            </div>
            <div class="gallery-item">
                <div class="placeholder-image">🎥</div>
                <div class="gallery-title">Sensor Testing</div>
            </div>
            <div class="gallery-item">
                <div class="placeholder-image">📊</div>
                <div class="gallery-title">3D CAD Model</div>
            </div>
        `;
    }

    async loadResearchSection() {
        const researchContent = document.getElementById('researchContent');
        if (!researchContent || !this.dataManager) return;

        try {
            const researchData = this.dataManager.getResearchData();
            if (researchData) {
                researchContent.innerHTML = this.generateResearchHTML(researchData);
            } else {
                researchContent.innerHTML = '<div class="loading">No research data available</div>';
            }
        } catch (error) {
            researchContent.innerHTML = '<div class="loading">Failed to load research data</div>';
        }
    }

    async loadFinancialSection() {
        const financialContent = document.getElementById('financialContent');
        if (!financialContent || !this.dataManager) return;

        try {
            const financialData = this.dataManager.getFinancialData();
            if (financialData) {
                financialContent.innerHTML = this.generateFinancialHTML(financialData);
            } else {
                financialContent.innerHTML = '<div class="loading">No financial data available</div>';
            }
        } catch (error) {
            financialContent.innerHTML = '<div class="loading">Failed to load financial data</div>';
        }
    }

    updateDashboardStats() {
        // Update progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            const progress = progressBar.getAttribute('data-progress');
            progressBar.style.width = `${progress}%`;
        }
    }

    updateRecentActivities() {
        // Activities are already in HTML, but could be dynamic
        const activities = [
            { time: '2 hours ago', desc: 'LiDAR calibration completed' },
            { time: '5 hours ago', desc: 'Stochastic model training updated' },
            { time: '1 day ago', desc: 'Campus mapping data collected' },
            { time: '2 days ago', desc: 'NVIDIA AGX Orin integration tested' }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-time">${activity.time}</div>
                    <div class="activity-desc">${activity.desc}</div>
                </div>
            `).join('');
        }
    }

    generateTeamHTML(teamData) {
        return teamData.map(member => `
            <div class="team-card">
                <h4>${member.name}</h4>
                <div class="team-role">${member.role}</div>
                <div class="team-department">${member.department}</div>
                <div class="team-status ${member.status}">${member.status}</div>
            </div>
        `).join('');
    }

    generateTimelineHTML(timelineData) {
        return `
            <div class="timeline">
                ${timelineData.map(event => `
                    <div class="timeline-item">
                        <div class="timeline-date">${event.date}</div>
                        <div class="timeline-content">
                            <h4>${event.title}</h4>
                            <p>${event.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateResearchHTML(researchData) {
        return `
            <div class="research-grid">
                <div class="research-card">
                    <h4>Current Research</h4>
                    <p>${researchData.current || 'Stochastic pedestrian behavior modeling'}</p>
                </div>
                <div class="research-card">
                    <h4>Publications</h4>
                    <p>${researchData.publications || '2 papers in progress'}</p>
                </div>
                <div class="research-card">
                    <h4>Experiments</h4>
                    <p>${researchData.experiments || 'Campus environment testing'}</p>
                </div>
            </div>
        `;
    }

    generateFinancialHTML(financialData) {
        return `
            <div class="financial-card">
                <h4>Budget Overview</h4>
                <div class="budget-item">
                    <span>Total Budget:</span>
                    <span>₹${financialData.totalBudget || '500,000'}</span>
                </div>
                <div class="budget-item">
                    <span>Spent:</span>
                    <span>₹${financialData.spent || '375,000'}</span>
                </div>
                <div class="budget-item">
                    <span>Remaining:</span>
                    <span>₹${financialData.remaining || '125,000'}</span>
                </div>
            </div>
        `;
    }

    getUserPermissions(role) {
        const permissions = {
            engineer: ['view_technical', 'view_timeline', 'view_gallery'],
            professor: ['view_all', 'view_research', 'view_financial'],
            lead: ['full_access', 'manage_team', 'edit_all']
        };
        return permissions[role] || [];
    }

    showComponentDetails(card) {
        const title = card.querySelector('h4').textContent;
        alert(`Component: ${title}\n\nDetailed information would be shown here.`);
    }

    filterGallery(filter) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            if (filter === 'all' || item.classList.contains(filter)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.querySelector('.loading-text');
        
        if (overlay) {
            if (text) text.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '1';
            }, 500);
        }
    }

    showError(message) {
        alert('Error: ' + message);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardController();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardController;
}