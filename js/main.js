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
        homeItem.innerHTML = 'Home';
        mainNavItems.appendChild(homeItem);
        
        // Add allowed menu items
        const menuConfigs = {
            'RESEARCH': { id: 'research' },
            'EGO-VEHICLE': { id: 'ego-vehicle' },
            'LEARN': { id: 'learn' },
            'ADMINISTRATION': { id: 'administration' },
            'THESIS': { id: 'thesis' }
        };
        
        allowedMenus.forEach(menuName => {
            const config = menuConfigs[menuName];
            if (config) {
                const navItem = document.createElement('div');
                navItem.className = 'main-nav-item';
                navItem.setAttribute('data-menu', config.id);
                navItem.innerHTML = menuName;
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
            submenuItem.innerHTML = submenu;
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
                student_lead: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study', 'Publications', 'Data Analysis'],
                admin: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study', 'Publications'],
                engineer: ['Simulation', 'Stochastic Modeling', 'Pedestrian Study'],
                guest: []
            },
            'ego-vehicle': {
                student_lead: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', 'Performance', '3D Viewer'],
                admin: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', 'Performance', '3D Viewer'],
                engineer: ['Vehicle Overview', 'Technical Systems', 'Sensors', 'Control Systems', '3D Viewer'],
                guest: ['Vehicle Overview', '3D Viewer']
            },
            'learn': {
                student_lead: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository', 'Resources'],
                admin: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository', 'Resources'],
                engineer: ['Documentation', 'Tutorials', 'Best Practices', 'Code Repository'],
                guest: ['Documentation', 'Tutorials']
            },
            'administration': {
                student_lead: ['Bills', 'BOM', 'Expense Sheet', 'Official Letters', 'Team Management'],
                admin: ['Bills', 'BOM', 'Expense Sheet', 'Official Letters', 'Team Management'],
                engineer: [],
                guest: []
            },
            'thesis': {
                student_lead: ['Proposal', 'Official Documents', 'Draft Chapters', 'Research Progress', 'Defense'],
                admin: [],
                engineer: [],
                guest: []
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
            <div class="ego-vehicle-layout">
                <!-- Main 3D Viewer and Component Panel -->
                <div class="main-display">
                    <div class="vehicle-3d-container">
                        <div class="viewer-header">
                            <h3>MAHINDRA REVA i - EGO PLATFORM</h3>
                            <div class="view-controls">
                                <button class="view-btn active" data-view="exterior">EXTERIOR</button>
                                <button class="view-btn" data-view="sensors">SENSORS</button>
                                <button class="view-btn" data-view="wireframe">WIREFRAME</button>
                            </div>
                        </div>
                        <div id="egoVehicle3D" class="vehicle-3d-viewer"></div>
                        <div class="viewer-controls">
                            <button id="resetView3D">RESET VIEW</button>
                            <button id="toggleWireframe3D">WIREFRAME</button>
                            <button id="showHotspots">HOTSPOTS</button>
                        </div>
                    </div>
                    
                    <div class="component-panel">
                        <div class="panel-header">
                            <h4 id="componentTitle">VEHICLE OVERVIEW</h4>
                            <div class="component-status" id="componentStatus">
                                <span class="status-dot active"></span>
                                <span>OPERATIONAL</span>
                            </div>
                        </div>
                        <div class="component-content" id="componentContent">
                            <div class="overview-stats">
                                <div class="stat-item">
                                    <label>STATUS</label>
                                    <value>READY</value>
                                </div>
                                <div class="stat-item">
                                    <label>SENSORS</label>
                                    <value>15 ACTIVE</value>
                                </div>
                                <div class="stat-item">
                                    <label>PROCESSING</label>
                                    <value>275 TOPS</value>
                                </div>
                                <div class="stat-item">
                                    <label>BATTERY</label>
                                    <value>78%</value>
                                </div>
                            </div>
                            <div class="component-description">
                                <p>Advanced autonomous vehicle platform based on Mahindra Reva i with comprehensive sensor suite and NVIDIA AGX Orin processing unit.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Tech Specifications -->
                <div class="tech-specs-section">
                    <div class="specs-header">
                        <h3>TECHNICAL SPECIFICATIONS</h3>
                        <div class="spec-tabs">
                            <button class="spec-tab active" data-tab="vehicle">VEHICLE</button>
                            <button class="spec-tab" data-tab="sensors">SENSORS</button>
                            <button class="spec-tab" data-tab="processing">PROCESSING</button>
                            <button class="spec-tab" data-tab="software">SOFTWARE</button>
                        </div>
                    </div>
                    <div class="specs-content" id="specsContent">
                        <!-- Specs table will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        // Initialize 3D viewer and interactions
        this.initEgoVehicle3D();
        this.setupEgoVehicleEvents();
        this.loadTechSpecs('vehicle');
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
        
        if (mainMenu === 'ego-vehicle') {
            this.loadEgoVehicleSubmenu(submenu);
        }
    }

    loadEgoVehicleSubmenu(submenu) {
        const componentContent = document.getElementById('componentContent');
        const componentTitle = document.getElementById('componentTitle');
        
        if (!componentContent || !componentTitle) return;
        
        switch (submenu) {
            case 'Vehicle Overview':
                this.loadVehicleOverview();
                break;
            case 'Sensor Suite':
                this.loadSensorSuite();
                break;
            case 'Technical Systems':
                this.loadTechnicalSystems();
                break;
            case 'Control Systems':
                this.loadControlSystems();
                break;
            case 'Performance':
                this.loadPerformanceMetrics();
                break;
            case '3D Viewer':
                this.focusOn3DViewer();
                break;
        }
    }

    loadVehicleOverview() {
        document.getElementById('componentTitle').textContent = 'VEHICLE OVERVIEW';
        document.getElementById('componentContent').innerHTML = `
            <div class="overview-stats">
                <div class="stat-item">
                    <label>STATUS</label>
                    <value>READY</value>
                </div>
                <div class="stat-item">
                    <label>SENSORS</label>
                    <value>15 ACTIVE</value>
                </div>
                <div class="stat-item">
                    <label>PROCESSING</label>
                    <value>275 TOPS</value>
                </div>
                <div class="stat-item">
                    <label>BATTERY</label>
                    <value>78%</value>
                </div>
            </div>
            <div class="component-description">
                <p>Advanced autonomous vehicle platform based on Mahindra Reva i with comprehensive sensor suite and NVIDIA AGX Orin processing unit.</p>
            </div>
        `;
    }

    loadSensorSuite() {
        document.getElementById('componentTitle').textContent = 'SENSOR SUITE';
        document.getElementById('componentContent').innerHTML = `
            <div class="sensor-grid">
                <div class="sensor-item">
                    <h5>ROBOSENSE RS-LIDAR-16</h5>
                    <div class="sensor-specs">
                        <span>Range: 150m</span>
                        <span>Channels: 16</span>
                        <span>FOV: 360°</span>
                    </div>
                </div>
                <div class="sensor-item">
                    <h5>IMX490 CAMERAS (4x)</h5>
                    <div class="sensor-specs">
                        <span>Resolution: 1920x1536</span>
                        <span>FPS: 30</span>
                        <span>HDR: Yes</span>
                    </div>
                </div>
                <div class="sensor-item">
                    <h5>MTI-680G IMU/GNSS</h5>
                    <div class="sensor-specs">
                        <span>Gyro: ±2000°/s</span>
                        <span>GPS: Multi-constellation</span>
                        <span>Frequency: 100Hz</span>
                    </div>
                </div>
            </div>
        `;
    }

    loadTechnicalSystems() {
        document.getElementById('componentTitle').textContent = 'TECHNICAL SYSTEMS';
        document.getElementById('componentContent').innerHTML = `
            <div class="system-status">
                <div class="system-item">
                    <label>PERCEPTION</label>
                    <div class="status-bar">
                        <div class="status-fill" style="width: 95%"></div>
                    </div>
                    <value>95%</value>
                </div>
                <div class="system-item">
                    <label>PROCESSING</label>
                    <div class="status-bar">
                        <div class="status-fill" style="width: 87%"></div>
                    </div>
                    <value>87%</value>
                </div>
                <div class="system-item">
                    <label>CONTROL</label>
                    <div class="status-bar">
                        <div class="status-fill" style="width: 92%"></div>
                    </div>
                    <value>92%</value>
                </div>
            </div>
        `;
    }

    loadControlSystems() {
        document.getElementById('componentTitle').textContent = 'CONTROL SYSTEMS';
        document.getElementById('componentContent').innerHTML = `
            <div class="control-systems">
                <div class="control-item">
                    <h5>STEERING CONTROL</h5>
                    <p>Electric power steering with autonomous override capability</p>
                </div>
                <div class="control-item">
                    <h5>BRAKING SYSTEM</h5>
                    <p>Regenerative braking with emergency stop functionality</p>
                </div>
                <div class="control-item">
                    <h5>SAFETY SYSTEMS</h5>
                    <p>Multi-layer safety protocols with manual override</p>
                </div>
            </div>
        `;
    }

    loadPerformanceMetrics() {
        document.getElementById('componentTitle').textContent = 'PERFORMANCE METRICS';
        document.getElementById('componentContent').innerHTML = `
            <div class="performance-metrics">
                <div class="metric-item">
                    <label>MAX SPEED</label>
                    <value>80 KMH</value>
                </div>
                <div class="metric-item">
                    <label>RANGE</label>
                    <value>120 KM</value>
                </div>
                <div class="metric-item">
                    <label>ACCELERATION</label>
                    <value>0-60 KMH in 12s</value>
                </div>
                <div class="metric-item">
                    <label>EFFICIENCY</label>
                    <value>6.2 KM/KWH</value>
                </div>
            </div>
        `;
    }

    focusOn3DViewer() {
        document.getElementById('componentTitle').textContent = '3D VIEWER';
        document.getElementById('componentContent').innerHTML = `
            <div class="viewer-info">
                <p>Interactive 3D model of the EGO vehicle platform. Use mouse to rotate, zoom, and explore different components.</p>
                <div class="viewer-tips">
                    <div class="tip">Click components for details</div>
                    <div class="tip">Use hotspots button to show sensors</div>
                    <div class="tip">Switch view modes in header</div>
                </div>
            </div>
        `;
    }

    initEgoVehicle3D() {
        if (typeof Vehicle3D !== 'undefined') {
            setTimeout(() => {
                this.vehicle3D = new Vehicle3D('egoVehicle3D');
                this.vehicle3D.init();
            }, 100);
        }
    }

    setupEgoVehicleEvents() {
        // View mode buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn')) {
                document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const viewMode = e.target.getAttribute('data-view');
                this.switchViewMode(viewMode);
            }
            
            if (e.target.classList.contains('spec-tab')) {
                document.querySelectorAll('.spec-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                
                const tabName = e.target.getAttribute('data-tab');
                this.scrollToSpecSection(tabName);
            }
        });
    }

    switchViewMode(mode) {
        console.log(`Switching to ${mode} view`);
        // This will be implemented with 3D viewer
    }

    loadTechSpecs(category = 'vehicle') {
        const specsContent = document.getElementById('specsContent');
        if (!specsContent) return;
        
        const allSpecs = {
            vehicle: this.getTechSpecsData('vehicle'),
            sensors: this.getTechSpecsData('sensors'), 
            processing: this.getTechSpecsData('processing'),
            software: this.getTechSpecsData('software')
        };
        
        specsContent.innerHTML = `
            <div class="specs-long-table">
                <div id="vehicle-section" class="spec-section">
                    <h4>VEHICLE SPECIFICATIONS</h4>
                    <div class="specs-table">
                        ${allSpecs.vehicle.map(spec => `
                            <div class="spec-row">
                                <div class="spec-label">${spec.label}</div>
                                <div class="spec-value">${spec.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div id="sensors-section" class="spec-section">
                    <h4>SENSOR SPECIFICATIONS</h4>
                    <div class="specs-table">
                        ${allSpecs.sensors.map(spec => `
                            <div class="spec-row">
                                <div class="spec-label">${spec.label}</div>
                                <div class="spec-value">${spec.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div id="processing-section" class="spec-section">
                    <h4>PROCESSING SPECIFICATIONS</h4>
                    <div class="specs-table">
                        ${allSpecs.processing.map(spec => `
                            <div class="spec-row">
                                <div class="spec-label">${spec.label}</div>
                                <div class="spec-value">${spec.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div id="software-section" class="spec-section">
                    <h4>SOFTWARE SPECIFICATIONS</h4>
                    <div class="specs-table">
                        ${allSpecs.software.map(spec => `
                            <div class="spec-row">
                                <div class="spec-label">${spec.label}</div>
                                <div class="spec-value">${spec.value}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Scroll to initial section
        setTimeout(() => this.scrollToSpecSection(category), 100);
    }

    scrollToSpecSection(category) {
        const sectionId = `${category}-section`;
        const section = document.getElementById(sectionId);
        
        if (section) {
            const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - 150;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    getTechSpecsData(category) {
        const specsData = {
            vehicle: [
                { label: 'PLATFORM', value: 'Mahindra Reva i' },
                { label: 'MOTOR', value: '15KW PMSM 6-phase' },
                { label: 'CONTROLLER', value: '72V Controller Kit' },
                { label: 'BATTERY', value: '72V Li-ion 20kWh' },
                { label: 'WEIGHT', value: '665 kg' },
                { label: 'DIMENSIONS', value: '3.1m × 1.5m × 1.6m' },
                { label: 'WHEELBASE', value: '2.23m' },
                { label: 'MAX SPEED', value: '80 kmph' },
                { label: 'RANGE', value: '120 km' },
                { label: 'CHARGING TIME', value: '8 hours' }
            ],
            sensors: [
                { label: 'LIDAR', value: 'RoboSense RS-LiDAR-16' },
                { label: 'LIDAR RANGE', value: '150m' },
                { label: 'LIDAR CHANNELS', value: '16' },
                { label: 'CAMERAS', value: 'IMX490 (4x)' },
                { label: 'CAMERA RESOLUTION', value: '1920×1536' },
                { label: 'CAMERA FPS', value: '30' },
                { label: 'IMU/GNSS', value: 'MTi-680G' },
                { label: 'GPS ACCURACY', value: '<1m' },
                { label: 'IMU FREQUENCY', value: '100Hz' }
            ],
            processing: [
                { label: 'MAIN UNIT', value: 'NVIDIA AGX Orin' },
                { label: 'CPU', value: '12-core ARM Cortex-A78AE' },
                { label: 'GPU', value: '2048-core NVIDIA Ampere' },
                { label: 'MEMORY', value: '64GB LPDDR5' },
                { label: 'STORAGE', value: '64GB eUFS + 1TB NVMe SSD' },
                { label: 'AI PERFORMANCE', value: '275 TOPS' },
                { label: 'POWER CONSUMPTION', value: '60W' },
                { label: 'TENSORRT SUPPORT', value: 'Yes' }
            ],
            software: [
                { label: 'FRAMEWORK', value: 'Autoware 2.0.1' },
                { label: 'OS', value: 'Ubuntu 20.04' },
                { label: 'ROS VERSION', value: 'ROS2 Humble' },
                { label: 'PERCEPTION', value: 'Custom + Autoware' },
                { label: 'PLANNING', value: 'Stochastic Model' },
                { label: 'CONTROL', value: 'Autoware Stack' },
                { label: 'SIMULATION', value: 'RViz + Custom' },
                { label: 'DEVELOPMENT', value: 'Python/C++' }
            ]
        };
        
        return specsData[category] || [];
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