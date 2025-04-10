/**
 * Cockroach Run - Main Entry Point
 * Initialize Three.js, canvas, and game logic
 */

// Game state and initialization
const Game = {
    // Core game properties
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    isRunning: false,
    currentScreen: 'loading-screen',
    activeGameMode: null,
    selectedCharacter: null,
    
    // Game objects collections
    objects: [],
    lights: [],
    
    // Asset loading tracking
    assetsLoaded: false,
    loadingProgress: 0,
    
    /**
     * Initialize the game
     */
    init() {
        console.log('Game.init() started');
        console.log(`Initializing Cockroach Run v${CONFIG.VERSION}`);
        
        // Initialize Three.js
        this.initThreeJS();
        
        // Initialize UI components
        this.initUI();
        
        // Start asset loading
        this.loadAssets();
        
        // Start the game loop
        this.gameLoop();
    },
    
    /**
     * Initialize Three.js renderer, scene, and camera
     */
    initThreeJS() {
        // Create canvas
        this.canvas = document.getElementById('game-canvas');
        
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: CONFIG.GRAPHICS.ANTIALIAS,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(CONFIG.GRAPHICS.PIXEL_RATIO, 2));
        this.renderer.shadowMap.enabled = CONFIG.GRAPHICS.SHADOW_ENABLED;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Initialize scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121212);
        
        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.GRAPHICS.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.GRAPHICS.NEAR_PLANE,
            CONFIG.GRAPHICS.FAR_PLANE
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Initialize clock for time-based animations
        this.clock = new THREE.Clock();
        
        // Add window resize handler
        window.addEventListener('resize', () => {
            // Update sizes
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Update camera
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            
            // Update renderer
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
        
        // Add basic lighting
        this.setupBasicLighting();
    },
    
    /**
     * Set up basic lighting for the scene
     */
    setupBasicLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Directional light (with shadows)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = CONFIG.GRAPHICS.SHADOW_ENABLED;
        
        // Configure shadow properties
        if (CONFIG.GRAPHICS.SHADOW_ENABLED) {
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
        }
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
    },
    
    /**
     * Initialize UI components and event listeners
     */
    initUI() {
        // Set active screen
        this.showScreen('loading-screen');
        
        // Add UI event listeners
        document.getElementById('play-button').addEventListener('click', () => {
            this.showScreen('mode-selection-screen');
        });
        
        document.getElementById('settings-button').addEventListener('click', () => {
            console.log('Settings button clicked (not implemented yet)');
        });
        
        document.getElementById('credits-button').addEventListener('click', () => {
            console.log('Credits button clicked (not implemented yet)');
        });
        
        document.getElementById('wallet-button').addEventListener('click', () => {
            console.log('Wallet button clicked (not implemented yet)');
        });
        
        // Mode selection handlers
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.getAttribute('data-mode');
                this.activeGameMode = mode;
                console.log(`Selected game mode: ${mode}`);
                this.showScreen('character-selection-screen');
            });
        });
        
        // Back buttons
        document.getElementById('back-from-mode').addEventListener('click', () => {
            this.showScreen('start-screen');
        });
        
        document.getElementById('back-from-character').addEventListener('click', () => {
            this.showScreen('mode-selection-screen');
        });
        
        // Character selection
        document.querySelectorAll('.character-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                // Remove selected class from all cards
                document.querySelectorAll('.character-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Add selected class to clicked card
                card.classList.add('selected');
                
                // Store selected character
                this.selectedCharacter = card.getAttribute('data-character');
                console.log(`Selected character: ${this.selectedCharacter}`);
            });
        });
        
        // Start game button
        document.getElementById('start-game-button').addEventListener('click', () => {
            if (this.selectedCharacter) {
                this.startGame();
            } else {
                alert('Please select a character first');
            }
        });
        
        // Pause game
        document.getElementById('pause-button').addEventListener('click', () => {
            this.pauseGame();
        });
        
        // Resume game
        document.getElementById('resume-button').addEventListener('click', () => {
            this.resumeGame();
        });
        
        // Restart game
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Quit game
        document.getElementById('quit-button').addEventListener('click', () => {
            this.quitGame();
        });
        
        // Try again (game over)
        document.getElementById('try-again-button').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Main menu (game over)
        document.getElementById('main-menu-button').addEventListener('click', () => {
            this.quitGame();
        });
    },
    
    /**
     * Show a specific screen and hide others
     */
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    },
    
    /**
     * Load game assets
     */
    loadAssets() {
        // Simulate asset loading for now
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += 1;
            this.updateLoadingProgress(progress);
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                this.assetsLoaded = true;
                
                // Proceed to start screen
                setTimeout(() => {
                    this.showScreen('start-screen');
                }, 500);
            }
        }, 50);
        
        // Cycle through loading messages
        let messageIndex = 0;
        const flavorText = document.querySelector('.flavor-text');
        setInterval(() => {
            messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
            if (flavorText) {
                flavorText.textContent = CONFIG.UI.LOADING_MESSAGES[messageIndex];
            }
        }, 3000);
    },
    
    /**
     * Update loading progress bar and text
     */
    updateLoadingProgress(progress) {
        this.loadingProgress = progress;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update progress text
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `Loading... ${progress}%`;
        }
    },
    
    /**
     * Start the game
     */
    startGame() {
        // Hide UI screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show game HUD
        document.getElementById('game-hud').classList.remove('hidden');
        
        // Initialize the selected game mode
        if (this.activeGameMode === 'free-world') {
            this.initFreeWorldMode();
        } else if (this.activeGameMode === 'cockroach-runner') {
            this.initCockroachRunnerMode();
        }
        
        this.isRunning = true;
    },
    
    /**
     * Pause the game
     */
    pauseGame() {
        this.isRunning = false;
        this.showScreen('pause-screen');
    },
    
    /**
     * Resume the game
     */
    resumeGame() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        this.isRunning = true;
    },
    
    /**
     * Restart the current game mode
     */
    restartGame() {
        // Clear current game objects
        this.clearScene();
        
        // Start game again
        this.startGame();
    },
    
    /**
     * Quit the current game and return to main menu
     */
    quitGame() {
        // Clear game objects
        this.clearScene();
        
        // Hide game HUD
        document.getElementById('game-hud').classList.add('hidden');
        
        // Show start screen
        this.showScreen('start-screen');
        
        this.isRunning = false;
    },
    
    /**
     * Initialize Free World game mode
     */
    initFreeWorldMode() {
        console.log('Initializing Free World mode');
        
        // Create placeholder ground
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Create placeholder character
        this.createPlaceholderCharacter();
    },
    
    /**
     * Initialize Cockroach Runner game mode
     */
    initCockroachRunnerMode() {
        console.log('Initializing Cockroach Runner mode');
        
        // Create placeholder ground
        const groundGeometry = new THREE.PlaneGeometry(100, 10);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.position.z = -45;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.objects.push(ground);
        
        // Create placeholder character
        this.createPlaceholderCharacter();
    },
    
    /**
     * Create a placeholder character cube
     */
    createPlaceholderCharacter() {
        // Create a simple cube as placeholder
        const geometry = new THREE.BoxGeometry(1, 0.5, 1.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0x663300,
            roughness: 0.7,
            metalness: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = 0.25;
        cube.castShadow = true;
        cube.receiveShadow = false;
        this.scene.add(cube);
        this.objects.push(cube);
    },
    
    /**
     * Clear all game objects from the scene
     */
    clearScene() {
        // Remove all objects except lights
        for (const object of this.objects) {
            this.scene.remove(object);
        }
        
        // Reset objects array
        this.objects = [];
    },
    
    /**
     * Main game loop
     */
    gameLoop() {
        // Get delta time
        const delta = this.clock.getDelta();
        
        // Update game state if running
        if (this.isRunning) {
            // Update game objects
            
            // Handle input
            
            // Apply physics
            
            // Update animations
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Call next frame
        requestAnimationFrame(() => this.gameLoop());
    }
};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired, calling Game.init()');
    Game.init();
});