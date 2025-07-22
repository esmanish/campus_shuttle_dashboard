// Simplified Main Controller for NITK EGO Vehicle Platform
class MainController {
    constructor() {
        this.currentUser = null;
        this.currentMenu = 'landing';
        this.dataManager = null;
        this.vehicle3D = null;
        
        this.init();
    }

    async init() {
        if (!auth.requireAuth()) {
            return;
        }

        this.showLoading('Initializing Platform...');

        try {
            this.currentUser = auth.getCurrentUser();
            this.loadUserInterface();
            this.setupNavigation();
            this.setupEventListeners();
            
            if (typeof DataManager !== 'undefined') {
                this.dataManager = new DataManager();
            }
            
            setTimeout(() => this.hideLoading(), 1000);
            
        } catch (error) {
            console.error('Platform initialization failed:', error);
            this.showError('Failed to initialize platform');
        }
    }

    loadUserInterface() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userName) userName.textContent = this.currentUser.name;
        if (userRole) userRole.textContent = this.currentUser.role.replace('_', ' ').toUpperCase();
    }

    setupNavigation() {
        const mainNavItems = document.getElementById('mainNavItems');
        const allowedMenus = auth.getRoleMenus(this.currentUser.role);
        
        mainNavItems.innerHTML = '';
        
        // Add Home button
        const homeItem = document.createElement('div');
        homeItem.className = 'main-nav-item active';
        homeItem.setAttribute('data-menu', 'landing');
        homeItem.innerHTML = '🏠 Home';
        mainNavItems.appendChild(homeItem);
        
        // Add allowed menu items
        const menuConfigs = {
            'RESEARCH': { id: 'research', icon: '🔬' },
            'EGO-VEHICLE': { id: 'ego-vehicle', icon: '🚗' },
            'LEARN': { id: 'learn', icon: '📚' },
            'ADMINISTRATION': { id: 'administration', icon: '⚙️' },
            'THESIS': { id: 'thesis', icon: '📄' }
        };
        
        allowedMenus.forEach(menuName => {
            const config = menuConfigs[menuName];
            if (config) {
                const navItem = document.createElement('div');
                navItem.className = 'main-nav-item';
                navItem.setAttribute('data-menu', config.id);
                navItem.innerHTML = `${config.icon} ${menuName}`;
                mainNavItems.appendChild(navItem);
            }
        });
    }

    setupEventListeners() {
        // Main navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.main-nav-item')) {
                const menuItem = e.target.closest('.main-nav-item');
                const menuId = menuItem.getAttribute('data-menu');
                this.switchMenu(menuId);
            }
            
            if (e.target.closest('.submenu-item')) {
                const submenuItem = e.target.closest('.submenu-item');
                const submenuName = submenuItem.getAttribute('data-submenu');
                this.loadSubmenuContent(this.currentMenu, submenuName);
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    auth.logout();
                }
            });
        }

        // Window resize for 3D viewer
        window.addEventListener('resize', () => {
            if (this.vehicle3D) {
                this.vehicle3D.onWindowResize();
            }
        });
    }

    switchMenu(menuId) {
        // Update active nav item
        document.querySelectorAll('.main-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-menu="${menuId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Show content section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(menuId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        this.currentMenu = menuId;
        
        // Update submenu
        if (menuId === 'landing') {
            this.hideSubmenu();
        } else {
            this.updateSubmenu(menuId);
        }
        
        // Load content based on menu
        this.loadMenuContent(menuId);
    }

    updateSubmenu(menuId) {
        const submenuTitle = document.getElementById('submenuTitle');
        const submenuItems = document.getElementById('submenuItems');
        const submenuSidebar = document.getElementById('submenuSidebar');
        
        const submenus = this.getSubmenus(menuId, this.currentUser.role);
        
        if (submenus.length === 0) {
            this.hideSubmenu();
            return;
        }
        
        const menuNames = {
            'research': 'RESEARCH',
            'ego-vehicle': 'EGO-VEHICLE',
            'learn': 'LEARN',
            'administration': 'ADMINISTRATION',
            'thesis': 'THESIS'
        };
        
        submenuTitle.textContent = menuNames[menuId] || 'Menu';
        
        submenuItems.innerHTML = '';
        submenus.forEach(submenu => {
            const submenuItem = document.createElement('div');
            submenuItem.className = 'submenu-item';
            submenuItem.setAttribute('data-submenu', submenu);
            submenuItem.innerHTML = `<span>▸</span> ${submenu}`;
            submenuItems.appendChild(submenuItem);
        });
        
        submenuSidebar.style.display = 'block';
    }

    hideSubmenu() {
        const submenuSidebar = document.getElementById('submenuSidebar');
        submenuSidebar.style.display = 'none';
    }

    getSubmenus(menuId, role) {
        const submenus = {
            'research': {
                project_lead: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study', 'Publications', 'Data Analysis'],
                admin: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study', 'Publications'],
                engineer: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study'],
                intern: [],
                volunteer: []
            },
            'ego-vehicle': {
                project_lead: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', 'Performance', '3D Viewer'],
                admin: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', 'Performance', '3D Viewer'],
                engineer: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', '3D Viewer'],
                intern: ['Vehicle Overview', 'Technical Systems', '3D Viewer'],
                volunteer: ['Vehicle Overview', '3D Viewer']
            },
            'learn': {
                project_lead: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository', 'Resources'],
                admin: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository', 'Resources'],
                engineer: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository'],
                intern: ['Documentation', 'Tutorials', 'Code Repository'],
                volunteer: ['Documentation', 'Tutorials']
            },
            'administration': {
                project_lead: ['Bills', 'BOM', 'Expense Sheet', 'Official Letters', 'Team Management'],
                admin: ['Bills', 'BOM', 'Expense Sheet', 'Official Letters', 'Team Management'],
                engineer: [],
                intern: [],
                volunteer: []
            },
            'thesis': {
                project_lead: ['Proposal', 'Official Documents', 'Draft Chapters', 'Research Progress', 'Defense'],
                admin: [],
                engineer: [],
                intern: [],
                volunteer: []
            }
        };
        
        return submenus[menuId]?.[role] || [];
    }

    loadMenuContent(menuId) {
        switch (menuId) {
            case 'research':
                this.loadResearchContent();
                break;
            case 'ego-vehicle':
                this.loadEgoVehicleContent();
                break;
            case 'learn':
                this.loadLearnContent();
                break;
            case 'administration':
                this.loadAdministrationContent();
                break;
            case 'thesis':
                this.loadThesisContent();
                break;
        }
    }

    loadResearchContent() {
        const contentArea = document.getElementById('researchContent');
        const researchModules = [
            { title: 'Stochastic Modeling', description: 'Pedestrian behavior prediction using probabilistic models', status: 'active', progress: 75 },
            { title: 'Simulation Environment', description: 'RViz-based campus simulation with real-world data', status: 'complete', progress: 100 },
            { title: 'Steering Subsystem', description: 'Advanced steering control for autonomous navigation', status: 'planning', progress: 25 },
            { title: 'Braking System', description: 'Safety-critical braking system integration', status: 'planning', progress: 15 },
            { title: 'Pedestrian Study', description: 'Behavioral data collection and analysis', status: 'active', progress: 60 },
            { title: 'Sensor Fusion', description: 'Multi-modal sensor data fusion algorithms', status: 'active', progress: 80 }
        ];
        
        contentArea.innerHTML = researchModules.map(module => `
            <div class="research-card">
                <div class="card-header">
                    <h3>${module.title}</h3>
                    <span class="status-badge ${module.status}">${module.status.charAt(0).toUpperCase() + module.status.slice(1)}</span>
                </div>
                <p>${module.description}</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${module.progress}%"></div>
                    </div>
                    <span class="progress-text">${module.progress}%</span>
                </div>
            </div>
        `).join('');
    }

    loadEgoVehicleContent() {
        const contentArea = document.getElementById('egoVehicleContent');
        contentArea.innerHTML = `
            <div class="research-card">
                <h3>Vehicle Platform</h3>
                <p>Mahindra Reva i based autonomous vehicle platform</p>
            </div>
            <div class="research-card">
                <h3>Sensor Suite</h3>
                <p>LiDAR, cameras, IMU/GNSS integration</p>
            </div>
            <div class="research-card">
                <h3>Processing Unit</h3>
                <p>NVIDIA AGX Orin for real-time processing</p>
            </div>
        `;
    }

    loadLearnContent() {
        const contentArea = document.getElementById('learnContent');
        contentArea.innerHTML = `
            <div class="research-card">
                <h3>Documentation</h3>
                <p>Technical documentation and user guides</p>
            </div>
            <div class="research-card">
                <h3>Tutorials</h3>
                <p>Step-by-step learning materials</p>
            </div>
        `;
    }

    loadAdministrationContent() {
        const contentArea = document.getElementById('administrationContent');
        contentArea.innerHTML = `
            <div class="research-card">
                <h3>Project Management</h3>
                <p>Administrative tools and resources</p>
            </div>
        `;
    }

    loadThesisContent() {
        const contentArea = document.getElementById('thesisContent');
        contentArea.innerHTML = `
            <div class="research-card">
                <h3>Thesis Development</h3>
                <p>M.Tech thesis documentation and progress</p>
            </div>
        `;
    }

    loadSubmenuContent(mainMenu, submenu) {
        console.log(`Loading ${mainMenu} -> ${submenu}`);
        
        if (mainMenu === 'ego-vehicle' && submenu === '3D Viewer') {
            this.load3DViewer();
        }
    }

    load3DViewer() {
        const contentArea = document.getElementById('egoVehicleContent');
        contentArea.innerHTML = `
            <div class="vehicle-viewer-container" style="grid-column: 1 / -1;">
                <h3>3D Vehicle Viewer</h3>
                <div id="vehicle3d" class="vehicle-3d" style="height: 500px; background: #000; border-radius: 10px; margin: 20px 0;"></div>
                <div class="viewer-controls">
                    <button id="resetView">Reset View</button>
                    <button id="toggleWireframe">Wireframe</button>
                    <button id="showComponents">Components</button>
                </div>
            </div>
        `;
        
        if (typeof Vehicle3D !== 'undefined') {
            setTimeout(() => {
                this.vehicle3D = new Vehicle3D('vehicle3d');
                this.vehicle3D.init();
            }, 100);
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
        console.error('Platform Error:', message);
        alert('Error: ' + message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mainController = new MainController();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainController;
}