// 3D Vehicle Viewer for NITK EGO Vehicle Tracker
class Vehicle3D {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.vehicle = null;
        this.sensors = [];
        this.components = [];
        
        // Animation and interaction
        this.animationId = null;
        this.isWireframe = false;
        this.showComponents = false;
        this.rotationSpeed = 0.005;
        this.autoRotate = true;
        
        // Lighting
        this.ambientLight = null;
        this.directionalLights = [];
        
        // Materials
        this.materials = {
            vehicle: null,
            sensor: null,
            highlight: null,
            wireframe: null
        };
        
        this.isInitialized = false;
    }

    async init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                console.error(`Container ${this.containerId} not found`);
                return false;
            }

            // Initialize Three.js components
            this.initScene();
            this.initCamera();
            this.initRenderer();
            this.initLighting();
            this.initMaterials();
            
            // Create vehicle and components
            await this.createVehicle();
            this.createSensors();
            this.createEnvironment();
            
            // Setup controls and events
            this.setupControls();
            this.setupEventListeners();
            
            // Start animation loop
            this.animate();
            
            this.isInitialized = true;
            console.log('3D Vehicle Viewer initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize 3D viewer:', error);
            this.showFallbackContent();
            return false;
        }
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    }

    initCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100);
        this.camera.position.set(5, 3, 5);
        this.camera.lookAt(0, 0, 0);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
    }

    initLighting() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // Main directional light (key light)
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(10, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        this.scene.add(keyLight);
        this.directionalLights.push(keyLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        this.directionalLights.push(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
        rimLight.position.set(0, -5, -10);
        this.scene.add(rimLight);
        this.directionalLights.push(rimLight);
    }

    initMaterials() {
        // Vehicle body material
        this.materials.vehicle = new THREE.MeshPhysicalMaterial({
            color: 0x2c3e50,
            metalness: 0.7,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9
        });
        
        // Sensor material
        this.materials.sensor = new THREE.MeshPhysicalMaterial({
            color: 0x00D4FF,
            metalness: 0.8,
            roughness: 0.1,
            emissive: 0x001122,
            emissiveIntensity: 0.2
        });
        
        // Highlight material
        this.materials.highlight = new THREE.MeshBasicMaterial({
            color: 0x00FF88,
            transparent: true,
            opacity: 0.6,
            wireframe: false
        });
        
        // Wireframe material
        this.materials.wireframe = new THREE.MeshBasicMaterial({
            color: 0x00D4FF,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
    }

    async createVehicle() {
        try {
            // Create vehicle group
            this.vehicle = new THREE.Group();
            this.vehicle.name = 'EgoVehicle';
            
            // Load GLTF model
            const loader = new THREE.GLTFLoader();
            const cacheBuster = '?v=' + Date.now();
            
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    `assets/models/ego.gltf${cacheBuster}`,
                    resolve,
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    reject
                );
            });
            
            // Add loaded model to vehicle group
            const model = gltf.scene;
            model.name = 'EgoVehicleModel';
            
            // Scale and position the model if needed
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            
            // Enable shadows for all meshes in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.vehicle.add(model);
            
            // Add vehicle to scene
            this.scene.add(this.vehicle);
            
            console.log('GLTF Vehicle model loaded successfully');
            
        } catch (error) {
            console.error('Failed to load GLTF model:', error);
            this.createFallbackVehicle();
        }
    }

    createSensors() {
        // LiDAR sensor on roof
        const lidarGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
        const lidar = new THREE.Mesh(lidarGeometry, this.materials.sensor);
        lidar.position.set(0, 1.8, 0);
        lidar.castShadow = true;
        lidar.name = 'RoboSense_RS_LiDAR_16';
        lidar.userData = {
            type: 'sensor',
            category: 'perception',
            specs: 'Range: 150m, Channels: 16, FOV: 360°'
        };
        this.vehicle.add(lidar);
        this.sensors.push(lidar);
        
        // Camera array
        const cameraGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.08);
        const cameraMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const cameraPositions = [
            [1.5, 1.0, 0],     // Front
            [-1.5, 1.0, 0],    // Rear
            [0.5, 1.0, -0.9],  // Left
            [0.5, 1.0, 0.9]    // Right
        ];
        
        cameraPositions.forEach((position, index) => {
            const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
            camera.position.set(position[0], position[1], position[2]);
            camera.castShadow = true;
            camera.name = `IMX490_Camera_${index + 1}`;
            camera.userData = {
                type: 'sensor',
                category: 'perception',
                specs: 'Resolution: 1920x1536, FPS: 30, HDR: Yes'
            };
            this.vehicle.add(camera);
            this.sensors.push(camera);
        });
        
        // IMU/GNSS unit
        const imuGeometry = new THREE.BoxGeometry(0.12, 0.08, 0.15);
        const imu = new THREE.Mesh(imuGeometry, this.materials.sensor);
        imu.position.set(-0.5, 1.5, 0);
        imu.castShadow = true;
        imu.name = 'MTi_680G_IMU_GNSS';
        imu.userData = {
            type: 'sensor',
            category: 'localization',
            specs: 'Gyro: ±2000°/s, Accelerometer: ±16g, GNSS: GPS/GLONASS/Galileo'
        };
        this.vehicle.add(imu);
        this.sensors.push(imu);
        
        // NVIDIA AGX Orin (inside vehicle)
        const agxGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.2);
        const agxMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x76b900, // NVIDIA green
            metalness: 0.7,
            roughness: 0.3,
            emissive: 0x001100,
            emissiveIntensity: 0.1
        });
        const agx = new THREE.Mesh(agxGeometry, agxMaterial);
        agx.position.set(0.5, 0.3, -0.5);
        agx.name = 'NVIDIA_AGX_Orin';
        agx.userData = {
            type: 'processing',
            category: 'compute',
            specs: 'CPU: 12-core ARM Cortex-A78AE, GPU: 2048-core Ampere, AI: 275 TOPS'
        };
        this.vehicle.add(agx);
        this.components.push(agx);
        
        console.log(`Created ${this.sensors.length} sensors and ${this.components.length} components`);
    }

    createEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        ground.name = 'Ground';
        this.scene.add(ground);
        
        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 40, 0x444444, 0x222222);
        gridHelper.position.y = -0.49;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
        
        // Reference axes
        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.position.set(5, 0, 5);
        this.scene.add(axesHelper);
    }

    createFallbackVehicle() {
        // Simple fallback vehicle if main creation fails
        const geometry = new THREE.BoxGeometry(3, 1, 1.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x444444 });
        this.vehicle = new THREE.Mesh(geometry, material);
        this.vehicle.position.y = 0.5;
        this.vehicle.name = 'FallbackVehicle';
        this.scene.add(this.vehicle);
    }

    setupControls() {
        // Mouse controls for orbit camera
        this.controls = {
            mouseX: 0,
            mouseY: 0,
            isMouseDown: false,
            targetRotationX: 0,
            targetRotationY: 0,
            rotationX: 0,
            rotationY: 0
        };
    }

    setupEventListeners() {
        const canvas = this.renderer.domElement;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
        canvas.addEventListener('wheel', (e) => this.onMouseWheel(e), false);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), false);
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
        
        // Click events for component interaction
        canvas.addEventListener('click', (e) => this.onCanvasClick(e), false);
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onMouseDown(event) {
        this.controls.isMouseDown = true;
        this.controls.mouseX = event.clientX;
        this.controls.mouseY = event.clientY;
        this.autoRotate = false;
    }

    onMouseMove(event) {
        if (!this.controls.isMouseDown) return;
        
        const deltaX = event.clientX - this.controls.mouseX;
        const deltaY = event.clientY - this.controls.mouseY;
        
        this.controls.targetRotationY += deltaX * 0.01;
        this.controls.targetRotationX += deltaY * 0.01;
        
        // Limit vertical rotation
        this.controls.targetRotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.controls.targetRotationX));
        
        this.controls.mouseX = event.clientX;
        this.controls.mouseY = event.clientY;
    }

    onMouseUp(event) {
        this.controls.isMouseDown = false;
    }

    onMouseWheel(event) {
        event.preventDefault();
        const distance = this.camera.position.length();
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
        const newDistance = Math.max(2, Math.min(15, distance * factor));
        
        const direction = this.camera.position.clone().normalize();
        this.camera.position.copy(direction.multiplyScalar(newDistance));
    }

    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
            this.controls.isMouseDown = true;
            this.autoRotate = false;
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.controls.isMouseDown) {
            const deltaX = event.touches[0].clientX - this.controls.mouseX;
            const deltaY = event.touches[0].clientY - this.controls.mouseY;
            
            this.controls.targetRotationY += deltaX * 0.01;
            this.controls.targetRotationX += deltaY * 0.01;
            
            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
        }
    }

    onTouchEnd(event) {
        event.preventDefault();
        this.controls.isMouseDown = false;
    }

    onCanvasClick(event) {
        // Raycast to detect clicked components
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.vehicle.children, true);
        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            this.highlightComponent(clicked);
            this.showComponentInfo(clicked);
        }
    }

    onWindowResize() {
        if (!this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Auto rotation
        if (this.autoRotate && this.vehicle) {
            this.controls.targetRotationY += this.rotationSpeed;
        }
        
        // Smooth camera movement
        this.controls.rotationX += (this.controls.targetRotationX - this.controls.rotationX) * 0.05;
        this.controls.rotationY += (this.controls.targetRotationY - this.controls.rotationY) * 0.05;
        
        // Update camera position
        const radius = this.camera.position.length();
        this.camera.position.x = radius * Math.sin(this.controls.rotationY) * Math.cos(this.controls.rotationX);
        this.camera.position.y = radius * Math.sin(this.controls.rotationX);
        this.camera.position.z = radius * Math.cos(this.controls.rotationY) * Math.cos(this.controls.rotationX);
        this.camera.lookAt(0, 0, 0);
        
        // Animate sensor indicators
        this.animateSensors();
        
        this.renderer.render(this.scene, this.camera);
    }

    animateSensors() {
        const time = Date.now() * 0.001;
        this.sensors.forEach((sensor, index) => {
            // Subtle pulsing effect for active sensors
            const pulse = Math.sin(time * 2 + index) * 0.1 + 1;
            sensor.scale.setScalar(pulse);
            
            // Color animation for LiDAR
            if (sensor.name.includes('LiDAR')) {
                const hue = (time * 0.5 + index * 0.3) % 1;
                sensor.material.emissive.setHSL(hue, 0.5, 0.1);
            }
        });
    }

    // Control methods
    resetView() {
        this.controls.targetRotationX = 0;
        this.controls.targetRotationY = 0;
        this.camera.position.set(5, 3, 5);
        this.autoRotate = true;
    }

    toggleWireframe() {
        this.isWireframe = !this.isWireframe;
        
        if (this.vehicle) {
            this.vehicle.traverse((child) => {
                if (child.isMesh && child.name !== 'Ground') {
                    if (this.isWireframe) {
                        child.material = this.materials.wireframe;
                    } else {
                        // Restore original materials (this may need adjustment for GLTF materials)
                        if (child.name.includes('Sensor') || child.name.includes('LiDAR') || child.name.includes('Camera') || child.name.includes('IMU')) {
                            child.material = this.materials.sensor;
                        }
                    }
                }
            });
        }
    }

    highlightComponents() {
        this.showComponents = !this.showComponents;
        
        [...this.sensors, ...this.components].forEach(component => {
            if (this.showComponents) {
                component.material = this.materials.highlight;
            } else {
                component.material = this.materials.sensor;
            }
        });
    }

    highlightComponent(component) {
        // Reset all highlights first
        [...this.sensors, ...this.components].forEach(comp => {
            comp.material = this.materials.sensor;
        });
        
        // Highlight selected component
        if (component) {
            component.material = this.materials.highlight;
        }
    }

    showComponentInfo(component) {
        if (component && component.userData) {
            const info = component.userData;
            const name = component.name.replace(/_/g, ' ');
            
            alert(`Component: ${name}\nType: ${info.type}\nCategory: ${info.category}\nSpecs: ${info.specs}`);
        }
    }

    showFallbackContent() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: #888;">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">3D Vehicle Viewer</div>
                    <div style="font-size: 0.9rem; color: #666;">Mahindra Reva i EGO Vehicle</div>
                    <div style="font-size: 0.8rem; margin-top: 15px; color: #555;">Model failed to load</div>
                </div>
            `;
        }
    }

    // Cleanup
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.isInitialized = false;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Vehicle3D;
} else {
    window.Vehicle3D = Vehicle3D;
}