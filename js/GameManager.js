/**
 * Game Manager handles the game logic and rendering
 */
const GameManager = (function() {
    // Private variables
    let scene, camera, renderer;
    let cockroach, environment;
    let gameMode, characterType;
    let isRunning = false;
    let isPaused = false;
    let score = 0;
    let lastTime = 0;
    let gameSettings = {};
    
    // Quality presets
    const qualityPresets = {
        low: {
            shadowMapEnabled: false,
            antialiasing: false,
            particleCount: 100,
            drawDistance: 500,
            textureQuality: 'low'
        },
        medium: {
            shadowMapEnabled: true,
            antialiasing: false,
            particleCount: 300,
            drawDistance: 1000,
            textureQuality: 'medium'
        },
        high: {
            shadowMapEnabled: true,
            antialiasing: true,
            particleCount: 600,
            drawDistance: 2000,
            textureQuality: 'high'
        },
        ultra: {
            shadowMapEnabled: true,
            antialiasing: true,
            particleCount: 1000,
            drawDistance: 3000,
            textureQuality: 'ultra'
        }
    };
    
    // Character abilities
    const characterAbilities = {
        default: {
            speedBoost: true,
            invisibility: false,
            glide: false
        },
        stealth: {
            speedBoost: false,
            invisibility: true,
            glide: false
        },
        glider: {
            speedBoost: false,
            invisibility: false,
            glide: true
        }
    };
    
    // Private methods
    function initThreeJS() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, gameSettings.drawDistance || 1000);
        camera.position.set(0, 5, 10);
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: gameSettings.antialiasing || false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Enable shadows if needed
        if (gameSettings.shadowMapEnabled) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = gameSettings.shadowMapEnabled;
        scene.add(directionalLight);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    function loadCockroach() {
        // This is a placeholder for loading the 3D cockroach model
        // In a real implementation, you would load a GLTF model here
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = new THREE.MeshPhongMaterial({ color: 0x663300 });
        cockroach = new THREE.Mesh(geometry, material);
        cockroach.castShadow = gameSettings.shadowMapEnabled;
        cockroach.receiveShadow = gameSettings.shadowMapEnabled;
        scene.add(cockroach);
        
        // Add abilities based on character type
        if (characterType && characterAbilities[characterType]) {
            cockroach.abilities = characterAbilities[characterType];
        } else {
            cockroach.abilities = characterAbilities.default;
        }
    }
    
    function loadEnvironment(environmentType = 'kitchen') {
        // This is a placeholder for loading the environment
        // In a real implementation, you would load a GLTF model here
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = gameSettings.shadowMapEnabled;
        scene.add(plane);
        
        environment = {
            type: environmentType,
            objects: [plane]
        };
        
        // Add walls, obstacles, etc. depending on the environment type
        switch(environmentType) {
            case 'kitchen':
                // Add kitchen-specific elements
                break;
            case 'bathroom':
                // Add bathroom-specific elements
                break;
            case 'sewer':
                // Add sewer-specific elements
                break;
            case 'street':
                // Add street-specific elements
                break;
        }
    }
    
    function setupControls() {
        // Set up keyboard controls for the cockroach
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        
        // Set up touch controls for mobile
        setupTouchControls();
    }
    
    function handleKeyDown(event) {
        if (!isRunning || isPaused) return;
        
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
                // Move forward
                break;
            case 'ArrowDown':
            case 's':
                // Move backward
                break;
            case 'ArrowLeft':
            case 'a':
                // Turn left
                break;
            case 'ArrowRight':
            case 'd':
                // Turn right
                break;
            case ' ':
                // Jump
                AudioManager.playSound('jump');
                break;
            case 'Shift':
                // Sprint or use ability
                if (cockroach.abilities.speedBoost) {
                    AudioManager.playSound('powerupActivate');
                    // Activate speed boost
                } else if (cockroach.abilities.invisibility) {
                    AudioManager.playSound('powerupActivate');
                    // Activate invisibility
                } else if (cockroach.abilities.glide) {
                    AudioManager.playSound('powerupActivate');
                    // Activate gliding
                }
                break;
        }
    }
    
    function handleKeyUp(event) {
        if (!isRunning || isPaused) return;
        
        // Handle key up events
    }
    
    function setupTouchControls() {
        // Implement touch controls for mobile devices
    }
    
    function update(time) {
        if (!isRunning || isPaused) return;
        
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        
        // Update cockroach position, animation, etc.
        
        // Update environment, obstacles, collectibles, etc.
        
        // Update game logic based on game mode
        if (gameMode === 'runner') {
            updateRunnerMode(deltaTime);
        } else if (gameMode === 'free-world') {
            updateFreeWorldMode(deltaTime);
        }
        
        // Check for collisions
        
        // Update UI elements (score, health, etc.)
    }
    
    function updateRunnerMode(deltaTime) {
        // Update endless runner logic
        
        // Increase difficulty over time
        
        // Generate new obstacles and collectibles
        
        // Update score
        score += deltaTime * 10;
        
        // Check for game over conditions
    }
    
    function updateFreeWorldMode(deltaTime) {
        // Update free world exploration logic
        
        // Handle environment transitions
        
        // Update quest/objective progress
    }
    
    function render() {
        renderer.render(scene, camera);
    }
    
    function gameLoop(time) {
        if (!isRunning) return;
        
        requestAnimationFrame(gameLoop);
        
        update(time);
        render();
        
        // Display FPS if enabled
        if (UIManager.settings.showFps) {
            updateFPS(time);
        }
    }
    
    let frameCount = 0;
    let lastFpsUpdate = 0;
    let fps = 0;
    
    function updateFPS(time) {
        frameCount++;
        
        if (time - lastFpsUpdate >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsUpdate = time;
        }
    }
    
    function applyQualitySettings(quality) {
        if (!qualityPresets[quality]) {
            quality = 'medium';
        }
        
        gameSettings = qualityPresets[quality];
        
        // Apply quality settings to existing game elements
        if (renderer) {
            renderer.shadowMap.enabled = gameSettings.shadowMapEnabled;
            // You can't change antialias after renderer creation, would need to recreate renderer
        }
    }
    
    // Public methods
    return {
        startGame: function(mode, character, settings) {
            gameMode = mode || 'free-world';
            characterType = character || 'default';
            
            // Apply quality settings
            applyQualitySettings(settings.quality);
            
            // Initialize Three.js
            initThreeJS();
            
            // Load game assets
            loadCockroach();
            loadEnvironment('kitchen'); // Default environment
            
            // Set up controls
            setupControls();
            
            // Start game loop
            isRunning = true;
            isPaused = false;
            score = 0;
            lastTime = performance.now();
            gameLoop(lastTime);
            
            console.log(`Game started: Mode=${gameMode}, Character=${characterType}`);
        },
        
        pauseGame: function() {
            isPaused = true;
            console.log('Game paused');
        },
        
        resumeGame: function() {
            isPaused = false;
            lastTime = performance.now();
            console.log('Game resumed');
        },
        
        restartGame: function() {
            score = 0;
            isPaused = false;
            
            // Reset cockroach position
            if (cockroach) {
                cockroach.position.set(0, 0, 0);
            }
            
            console.log('Game restarted');
        },
        
        stopGame: function() {
            isRunning = false;
            isPaused = false;
            
            // Clean up Three.js resources
            if (scene) {
                // Dispose of geometries, materials, textures, etc.
                // This is important to prevent memory leaks
            }
            
            console.log('Game stopped');
        },
        
        setQuality: function(quality) {
            applyQualitySettings(quality);
            console.log(`Quality set to ${quality}`);
        },
        
        getScore: function() {
            return Math.floor(score);
        },
        
        getFPS: function() {
            return fps;
        }
    };
})();