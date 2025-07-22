// Data Management System for NITK EGO Vehicle Tracker
class DataManager {
    constructor() {
        this.data = {
            team: null,
            timeline: null,
            components: null,
            research: null,
            financial: null
        };
        
        this.cache = new Map();
        this.lastUpdated = {};
    }

    // Generic data loader with caching
    async loadData(filename, cacheKey) {
        try {
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                const now = Date.now();
                // Cache for 5 minutes
                if (now - cached.timestamp < 300000) {
                    return cached.data;
                }
            }

            // Fetch from file
            const response = await fetch(`data/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            this.lastUpdated[cacheKey] = new Date().toISOString();
            return data;

        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            
            // Return fallback data
            return this.getFallbackData(cacheKey);
        }
    }

    // Load team data
    async loadTeamData() {
        try {
            this.data.team = await this.loadData('team.json', 'team');
            return this.data.team;
        } catch (error) {
            console.error('Failed to load team data:', error);
            this.data.team = this.getFallbackTeamData();
            return this.data.team;
        }
    }

    // Load timeline data
    async loadTimelineData() {
        try {
            this.data.timeline = await this.loadData('timeline.json', 'timeline');
            return this.data.timeline;
        } catch (error) {
            console.error('Failed to load timeline data:', error);
            this.data.timeline = this.getFallbackTimelineData();
            return this.data.timeline;
        }
    }

    // Load components data
    async loadComponentsData() {
        try {
            this.data.components = await this.loadData('components.json', 'components');
            return this.data.components;
        } catch (error) {
            console.error('Failed to load components data:', error);
            this.data.components = this.getFallbackComponentsData();
            return this.data.components;
        }
    }

    // Load research data
    async loadResearchData() {
        try {
            this.data.research = await this.loadData('research.json', 'research');
            return this.data.research;
        } catch (error) {
            console.error('Failed to load research data:', error);
            this.data.research = this.getFallbackResearchData();
            return this.data.research;
        }
    }

    // Load financial data
    async loadFinancialData() {
        try {
            this.data.financial = await this.loadData('financial.json', 'financial');
            return this.data.financial;
        } catch (error) {
            console.error('Failed to load financial data:', error);
            this.data.financial = this.getFallbackFinancialData();
            return this.data.financial;
        }
    }

    // Getter methods
    getTeamData() {
        return this.data.team || this.getFallbackTeamData();
    }

    getTimelineData() {
        return this.data.timeline || this.getFallbackTimelineData();
    }

    getComponentsData() {
        return this.data.components || this.getFallbackComponentsData();
    }

    getResearchData() {
        return this.data.research || this.getFallbackResearchData();
    }

    getFinancialData() {
        return this.data.financial || this.getFallbackFinancialData();
    }

    // Fallback data methods
    getFallbackData(type) {
        switch (type) {
            case 'team':
                return this.getFallbackTeamData();
            case 'timeline':
                return this.getFallbackTimelineData();
            case 'components':
                return this.getFallbackComponentsData();
            case 'research':
                return this.getFallbackResearchData();
            case 'financial':
                return this.getFallbackFinancialData();
            default:
                return null;
        }
    }

    getFallbackTeamData() {
        return [
            {
                id: 1,
                name: "Manish ES",
                role: "Project Lead & Research Scholar",
                department: "Mechatronics",
                email: "manish.es@nitk.edu.in",
                status: "active",
                expertise: ["Autonomous Systems", "Stochastic Modeling", "ROS"],
                currentTask: "Stochastic model development",
                avatar: "assets/images/team/manish.jpg"
            },
            {
                id: 2,
                name: "Dr. K.V Gangadharan",
                role: "Research Supervisor",
                department: "Mechanical Engineering",
                email: "kvg@nitk.edu.in",
                status: "active",
                expertise: ["Robotics", "Control Systems", "Research Guidance"],
                currentTask: "Research supervision",
                avatar: "assets/images/team/prof-kvg.jpg"
            },
            {
                id: 3,
                name: "Dr. Pruthviraj U",
                role: "Co-Supervisor",
                department: "Mechanical Engineering",
                email: "pruthviraj@nitk.edu.in",
                status: "active",
                expertise: ["Mechatronics", "Automation", "Vehicle Dynamics"],
                currentTask: "Technical guidance",
                avatar: "assets/images/team/prof-pruthvi.jpg"
            },
            {
                id: 4,
                name: "Electronics Team",
                role: "Hardware Engineers",
                department: "Electronics",
                status: "active",
                expertise: ["Sensor Integration", "PCB Design", "Embedded Systems"],
                currentTask: "Sensor calibration",
                avatar: "assets/images/team/electronics.jpg"
            },
            {
                id: 5,
                name: "Software Team",
                role: "Software Engineers",
                department: "Computer Science",
                status: "active",
                expertise: ["ROS2", "Python", "Computer Vision", "Autoware"],
                currentTask: "Autoware integration",
                avatar: "assets/images/team/software.jpg"
            }
        ];
    }

    getFallbackTimelineData() {
        return [
            {
                id: 1,
                date: "2024-08-01",
                title: "Project Initiation",
                description: "Project proposal approved and team formation",
                phase: "Planning",
                status: "completed",
                milestone: true,
                images: ["assets/images/timeline/initiation.jpg"]
            },
            {
                id: 2,
                date: "2024-09-15",
                title: "Vehicle Platform Selection",
                description: "Mahindra Reva i selected as EGO vehicle platform",
                phase: "Design",
                status: "completed",
                milestone: true,
                images: ["assets/images/timeline/vehicle-selection.jpg"]
            },
            {
                id: 3,
                date: "2024-10-30",
                title: "Sensor Integration",
                description: "LiDAR, cameras, and IMU installation completed",
                phase: "Fabrication",
                status: "completed",
                milestone: false,
                images: ["assets/images/timeline/sensor-integration.jpg"]
            },
            {
                id: 4,
                date: "2024-12-10",
                title: "NVIDIA AGX Orin Setup",
                description: "Processing unit installation and configuration",
                phase: "Fabrication",
                status: "completed",
                milestone: false,
                images: ["assets/images/timeline/agx-setup.jpg"]
            },
            {
                id: 5,
                date: "2025-01-15",
                title: "Stochastic Model Development",
                description: "Pedestrian prediction model development in progress",
                phase: "Development",
                status: "in-progress",
                milestone: false,
                images: ["assets/images/timeline/model-dev.jpg"]
            },
            {
                id: 6,
                date: "2025-02-28",
                title: "Campus Testing Phase",
                description: "Real-world testing in NITK campus environment",
                phase: "Testing",
                status: "scheduled",
                milestone: true,
                images: []
            },
            {
                id: 7,
                date: "2025-04-15",
                title: "Integration & Validation",
                description: "Complete system integration and validation",
                phase: "Integration",
                status: "scheduled",
                milestone: true,
                images: []
            }
        ];
    }

    getFallbackComponentsData() {
        return {
            perception: {
                lidar: {
                    name: "RoboSense RS-LiDAR-16",
                    status: "online",
                    specifications: {
                        channels: 16,
                        range: "150m",
                        accuracy: "±2cm",
                        fov: "360°"
                    },
                    lastUpdate: "2025-01-20T10:30:00Z",
                    health: 95
                },
                cameras: {
                    name: "IMX490 Camera Array",
                    status: "online",
                    specifications: {
                        resolution: "1920x1536",
                        fps: 30,
                        count: 4,
                        hdr: true
                    },
                    lastUpdate: "2025-01-20T09:15:00Z",
                    health: 98
                },
                imu: {
                    name: "MTi-680G IMU/GNSS",
                    status: "online",
                    specifications: {
                        gyro: "±2000°/s",
                        accelerometer: "±16g",
                        gnss: "GPS/GLONASS/Galileo",
                        frequency: "100Hz"
                    },
                    lastUpdate: "2025-01-20T11:45:00Z",
                    health: 92
                }
            },
            processing: {
                agx: {
                    name: "NVIDIA AGX Orin",
                    status: "active",
                    specifications: {
                        cpu: "12-core ARM Cortex-A78AE",
                        gpu: "2048-core NVIDIA Ampere GPU",
                        memory: "64GB LPDDR5",
                        ai_performance: "275 TOPS"
                    },
                    lastUpdate: "2025-01-20T12:00:00Z",
                    health: 87,
                    temperature: 65,
                    utilization: {
                        cpu: 45,
                        gpu: 62,
                        memory: 38
                    }
                }
            },
            vehicle: {
                platform: {
                    name: "Mahindra Reva i",
                    status: "ready",
                    specifications: {
                        motor: "15KW PMSM 6-phase",
                        controller: "72V Controller Kit",
                        battery: "72V Li-ion",
                        weight: "665kg"
                    },
                    lastUpdate: "2025-01-19T16:20:00Z",
                    health: 90
                }
            },
            software: {
                autoware: {
                    name: "Autoware Framework",
                    status: "running",
                    version: "2.0",
                    modules: ["perception", "localization", "planning", "control"],
                    lastUpdate: "2025-01-20T08:30:00Z",
                    health: 85
                },
                stochastic_model: {
                    name: "Pedestrian Prediction Model",
                    status: "development",
                    version: "0.8.2",
                    accuracy: 78.5,
                    lastUpdate: "2025-01-20T14:15:00Z",
                    health: 75
                }
            }
        };
    }

    getFallbackResearchData() {
        return {
            currentResearch: {
                title: "Stochastic Pedestrian Behavior Modeling for Autonomous Vehicles",
                description: "Development of probabilistic models for predicting pedestrian crossing intentions in unstructured campus environments",
                status: "in-progress",
                progress: 68,
                startDate: "2024-08-01",
                expectedCompletion: "2025-06-30"
            },
            publications: [
                {
                    title: "Autonomous Driving in Unstructured Environments: A Campus Case Study",
                    status: "draft",
                    authors: ["Manish ES", "Dr. K.V Gangadharan", "Dr. Pruthviraj U"],
                    targetJournal: "IEEE Transactions on Intelligent Transportation Systems",
                    submissionDate: "2025-03-15"
                },
                {
                    title: "Stochastic Modeling for Pedestrian Prediction in Autonomous Vehicles",
                    status: "in-review",
                    authors: ["Manish ES", "Dr. K.V Gangadharan"],
                    targetConference: "IEEE ICRA 2025",
                    submissionDate: "2024-12-01"
                }
            ],
            experiments: [
                {
                    name: "Campus Environment Mapping",
                    status: "completed",
                    description: "3D point cloud mapping of NITK campus roads and pathways",
                    completionDate: "2024-11-30",
                    results: "High-fidelity digital twin created"
                },
                {
                    name: "Pedestrian Behavior Data Collection",
                    status: "ongoing",
                    description: "Collection of pedestrian movement patterns in campus environment",
                    startDate: "2024-12-01",
                    expectedCompletion: "2025-02-28",
                    progress: 45
                },
                {
                    name: "Sensor Fusion Validation",
                    status: "scheduled",
                    description: "Validation of multi-sensor data fusion algorithms",
                    scheduledDate: "2025-02-01"
                }
            ],
            metrics: {
                dataCollectionHours: 156,
                testMilesAutonomous: 23.7,
                modelAccuracy: 78.5,
                publicationsInProgress: 2,
                experimentsCompleted: 4
            }
        };
    }

    getFallbackFinancialData() {
        return {
            budget: {
                total: 500000,
                spent: 375000,
                remaining: 125000,
                currency: "INR"
            },
            categories: {
                hardware: {
                    allocated: 300000,
                    spent: 245000,
                    items: [
                        { name: "RoboSense RS-LiDAR-16", cost: 180000 },
                        { name: "NVIDIA AGX Orin", cost: 85000 },
                        { name: "IMX490 Cameras (4x)", cost: 60000 },
                        { name: "MTi-680G IMU/GNSS", cost: 45000 }
                    ]
                },
                software: {
                    allocated: 50000,
                    spent: 25000,
                    items: [
                        { name: "Development Tools License", cost: 15000 },
                        { name: "Cloud Computing", cost: 10000 }
                    ]
                },
                fabrication: {
                    allocated: 100000,
                    spent: 75000,
                    items: [
                        { name: "Vehicle Modifications", cost: 45000 },
                        { name: "Mounting Hardware", cost: 20000 },
                        { name: "Electrical Components", cost: 10000 }
                    ]
                },
                research: {
                    allocated: 50000,
                    spent: 30000,
                    items: [
                        { name: "Conference Fees", cost: 15000 },
                        { name: "Publication Costs", cost: 10000 },
                        { name: "Research Materials", cost: 5000 }
                    ]
                }
            },
            purchaseOrders: [
                {
                    id: "PO-001",
                    vendor: "RoboSense",
                    item: "RS-LiDAR-16",
                    amount: 180000,
                    status: "delivered",
                    orderDate: "2024-09-01",
                    deliveryDate: "2024-09-15"
                },
                {
                    id: "PO-002",
                    vendor: "NVIDIA",
                    item: "AGX Orin Developer Kit",
                    amount: 85000,
                    status: "delivered",
                    orderDate: "2024-10-01",
                    deliveryDate: "2024-10-10"
                },
                {
                    id: "PO-003",
                    vendor: "Sony Semiconductor",
                    item: "IMX490 Cameras",
                    amount: 60000,
                    status: "pending",
                    orderDate: "2024-11-15",
                    expectedDelivery: "2024-12-01"
                }
            ],
            monthlyExpenses: [
                { month: "2024-08", amount: 15000 },
                { month: "2024-09", amount: 195000 },
                { month: "2024-10", amount: 95000 },
                { month: "2024-11", amount: 45000 },
                { month: "2024-12", amount: 25000 }
            ]
        };
    }

    // Data manipulation methods
    addTeamMember(member) {
        if (!this.data.team) this.data.team = this.getFallbackTeamData();
        member.id = this.getNextId(this.data.team);
        this.data.team.push(member);
        this.updateLocalStorage('team', this.data.team);
    }

    updateTeamMember(id, updatedMember) {
        if (!this.data.team) return false;
        const index = this.data.team.findIndex(member => member.id === id);
        if (index !== -1) {
            this.data.team[index] = { ...this.data.team[index], ...updatedMember };
            this.updateLocalStorage('team', this.data.team);
            return true;
        }
        return false;
    }

    addTimelineEvent(event) {
        if (!this.data.timeline) this.data.timeline = this.getFallbackTimelineData();
        event.id = this.getNextId(this.data.timeline);
        this.data.timeline.push(event);
        this.data.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.updateLocalStorage('timeline', this.data.timeline);
    }

    updateComponentStatus(category, component, status) {
        if (!this.data.components) this.data.components = this.getFallbackComponentsData();
        if (this.data.components[category] && this.data.components[category][component]) {
            this.data.components[category][component].status = status;
            this.data.components[category][component].lastUpdate = new Date().toISOString();
            this.updateLocalStorage('components', this.data.components);
        }
    }

    // Utility methods
    getNextId(array) {
        if (!array || array.length === 0) return 1;
        return Math.max(...array.map(item => item.id || 0)) + 1;
    }

    updateLocalStorage(key, data) {
        try {
            localStorage.setItem(`nitk-ego-${key}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to update local storage:', error);
        }
    }

    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`nitk-ego-${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load from local storage:', error);
            return null;
        }
    }

    // Search functionality
    searchData(query, dataType) {
        const data = this.data[dataType];
        if (!data) return [];

        const searchQuery = query.toLowerCase();
        
        switch (dataType) {
            case 'team':
                return data.filter(member => 
                    member.name.toLowerCase().includes(searchQuery) ||
                    member.role.toLowerCase().includes(searchQuery) ||
                    member.department.toLowerCase().includes(searchQuery)
                );
            case 'timeline':
                return data.filter(event =>
                    event.title.toLowerCase().includes(searchQuery) ||
                    event.description.toLowerCase().includes(searchQuery)
                );
            default:
                return [];
        }
    }

    // Data validation
    validateData(data, type) {
        const validators = {
            team: (member) => member.name && member.role && member.department,
            timeline: (event) => event.title && event.date && event.description,
            components: (component) => component.name && component.status,
            research: (research) => research.title && research.status,
            financial: (financial) => financial.budget && financial.categories
        };

        const validator = validators[type];
        if (!validator) return false;

        if (Array.isArray(data)) {
            return data.every(validator);
        } else {
            return validator(data);
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        this.lastUpdated = {};
    }

    // Get data statistics
    getDataStats() {
        return {
            cacheSize: this.cache.size,
            lastUpdated: this.lastUpdated,
            dataLoaded: Object.keys(this.data).filter(key => this.data[key] !== null).length
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} else {
    window.DataManager = DataManager;
}