/**
 * Cockroach Run - Game Engine
 * Using Three.js for 3D rendering and Cannon.js for physics
 * With cyberpunk aesthetic and optimized performance
 */

// Create Game object in global scope for UI access
window.Game = (function() {
    // Private variables
    let scene, camera, renderer;
    let canvas, gameContainer;
    let physicsWorld;
    let cockroach, cockroachBody;
    let clock;
    let isRunning = false;
    let selectedMode = 'free-world';
    let selectedCharacter = 'american';
    
    // Input state
    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    };
    
    // Initialize main game engine
    function init() {
        console.log("Initializing game engine...");
        
        // Initialize three.js
        if (!initRenderer()) {
            console.error("Failed to initialize renderer");
            return false;
        }
        
        // Initialize physics
        if (!initPhysics()) {
            console.error("Failed to initialize physics");
            return false;
        }
        
        // Add environment
        createEnvironment();
        
        // Setup input handlers
        setupInputHandlers();
        
        // Create clock for animation timing
        clock = new THREE.Clock();
        
        // Start animation loop
        animate();
        
        return true;
    }
    
    // Initialize renderer, canvas, scene and camera
    function initRenderer() {
        try {
            // Check for WebGL support
            if (!hasWebGLSupport()) {
                console.error("WebGL not supported");
                return false;
            }
            
            // Get canvas element
            canvas = document.getElementById('game-canvas');
            gameContainer = document.getElementById('game-container');
            
            if (!canvas) {
                console.error("Game canvas not found");
                return false;
            }
            
            if (!gameContainer) {
                console.error("Game container not found");
                return false;
            }
            
            // Configure container
            gameContainer.style.display = 'block';
            gameContainer.style.position = 'fixed';
            gameContainer.style.top = '0';
            gameContainer.style.left = '0';
            gameContainer.style.width = '100%';
            gameContainer.style.height = '100%';
            gameContainer.style.zIndex = '100';
            
            // Configure canvas
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x121212); // Dark background, cyberpunk style
            
            // Create camera
            camera = new THREE.PerspectiveCamera(
                75, 
                window.innerWidth / window.innerHeight, 
                0.1, 
                1000
            );
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
            renderer.shadowMap.enabled = true;
            
            // Add resize handler
            window.addEventListener('resize', onWindowResize);
            
            // Add lights
            addLights();
            
            return true;
        } catch (error) {
            console.error("Error initializing renderer:", error);
            return false;
        }
    }
    
    // Check for WebGL support
    function hasWebGLSupport() {
        try {
            const testCanvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext && 
                (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }
    
    // Handle window resize
    function onWindowResize() {
        if (!camera || !renderer) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Add lights to the scene
    function addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Cyberpunk neon accent light
        const purpleLight = new THREE.PointLight(0x9333EA, 1, 50);
        purpleLight.position.set(5, 5, 5);
        scene.add(purpleLight);
        
        const greenLight = new THREE.PointLight(0x00FF66, 1, 50);
        greenLight.position.set(-5, 3, -5);
        scene.add(greenLight);
    }
    
    // Initialize physics
    function initPhysics() {
        try {
            // Check if Cannon.js is available
            if (typeof CANNON === 'undefined') {
                console.error("CANNON physics library not found");
                return false;
            }
            
            // Create physics world
            physicsWorld = new CANNON.World();
            physicsWorld.gravity.set(0, -9.82, 0); // Earth gravity
            physicsWorld.broadphase = new CANNON.NaiveBroadphase();
            physicsWorld.solver.iterations = 10;
            
            return true;
        } catch (error) {
            console.error("Error initializing physics:", error);
            return false;
        }
    }
    
    // Create environment (ground, grid, etc)
    function createEnvironment() {
        // Ground plane - visual
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Grid helper for cyberpunk aesthetic
        const grid = new THREE.GridHelper(100, 100, 0x00FF66, 0x444444);
        scene.add(grid);
        
        // Ground plane - physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        physicsWorld.addBody(groundBody);
    }
    
    // Set up input handlers for keyboard controls
    function setupInputHandlers() {
        // Keyboard down events
        window.addEventListener('keydown', function(e) {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = true;
                    break;
                case 'Space':
                    keys.jump = true;
                    break;
            }
        });
        
        // Keyboard up events
        window.addEventListener('keyup', function(e) {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    keys.right = false;
                    break;
                case 'Space':
                    keys.jump = false;
                    break;
            }
        });
    }
    
    // Create cockroach character
    function createCockroach(type) {
        type = type || 'american';
        console.log("Creating cockroach character:", type);
        
        // Create temporary box as placeholder
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa5500 });
        cockroach = new THREE.Mesh(geometry, material);
        cockroach.position.set(0, 0.5, 0);
        cockroach.castShadow = true;
        scene.add(cockroach);
        
        // Add physics body
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1));
        cockroachBody = new CANNON.Body({ mass: 1 });
        cockroachBody.addShape(shape);
        cockroachBody.position.set(0, 0.5, 0);
        physicsWorld.addBody(cockroachBody);
        
        // Try to load actual model
        loadModel(type);
    }
    
    // Load cockroach model
    function loadModel(type) {
        let loader;
        
        // Find GLTFLoader (could be in multiple places)
        if (typeof THREE.GLTFLoader !== 'undefined') {
            loader = new THREE.GLTFLoader();
        } else if (typeof window.GLTFLoader !== 'undefined') {
            loader = new window.GLTFLoader();
        } else if (typeof GLTFLoader !== 'undefined') {
            loader = new GLTFLoader();
        } else {
            console.error("GLTFLoader not found - using placeholder");
            return;
        }
        
        // Determine model path
        let modelPath;
        switch (type) {
            case 'american':
                modelPath = 'assets/models/american-cockroach.glb';
                break;
            case 'german':
                modelPath = 'assets/models/german-cockroach.glb';
                break;
            case 'oriental':
                modelPath = 'assets/models/oriental-cockroach.glb';
                break;
            default:
                modelPath = 'assets/models/cockroach.glb';
        }
        
        // Load model
        loader.load(
            modelPath,
            function(gltf) {
                // Success
                if (cockroach) {
                    scene.remove(cockroach);
                }
                
                // Use loaded model
                cockroach = gltf.scene;
                cockroach.scale.set(0.5, 0.5, 0.5);
                cockroach.castShadow = true;
                scene.add(cockroach);
                console.log("Cockroach model loaded successfully");
            },
            function(xhr) {
                // Progress
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function(error) {
                // Error
                console.error("Error loading cockroach model:", error);
            }
        );
    }
    
    // Update cockroach movement
    function updateCockroach() {
        if (!cockroach || !cockroachBody) return;
        
        // Movement parameters
        const force = 10;
        const torque = 3;
        
        // Apply forces based on input
        if (keys.forward) {
            cockroachBody.applyLocalForce(new CANNON.Vec3(0, 0, -force), new CANNON.Vec3(0, 0, 0));
        }
        if (keys.backward) {
            cockroachBody.applyLocalForce(new CANNON.Vec3(0, 0, force), new CANNON.Vec3(0, 0, 0));
        }
        if (keys.left) {
            cockroachBody.applyTorque(new CANNON.Vec3(0, torque, 0));
        }
        if (keys.right) {
            cockroachBody.applyTorque(new CANNON.Vec3(0, -torque, 0));
        }
        if (keys.jump && cockroachBody.position.y < 1) {
            cockroachBody.applyImpulse(new CANNON.Vec3(0, 5, 0), cockroachBody.position);
        }
        
        // Update visual model position to match physics
        cockroach.position.copy(cockroachBody.position);
        cockroach.quaternion.copy(cockroachBody.quaternion);
    }
    
    // Update camera to follow cockroach
    function updateCamera() {
        if (!cockroach || !camera) return;
        
        // Third-person camera offset
        const offset = new THREE.Vector3(0, 3, 6);
        offset.applyQuaternion(cockroach.quaternion);
        
        // Position camera
        const targetPosition = new THREE.Vector3().copy(cockroach.position).add(offset);
        camera.position.copy(targetPosition);
        camera.lookAt(cockroach.position);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isRunning) return;
        
        // Get time delta
        const delta = clock.getDelta();
        
        // Update physics
        if (physicsWorld) {
            physicsWorld.step(1/60, delta, 3);
        }
        
        // Update cockroach
        updateCockroach();
        
        // Update camera
        updateCamera();
        
        // Render
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Cleanup resources
    function cleanup() {
        // Remove event listeners
        window.removeEventListener('resize', onWindowResize);
        
        // Dispose Three.js resources
        if (renderer) {
            renderer.dispose();
        }
        
        // Clear scene
        if (scene) {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        }
    }
    
    // Public API
    return {
        // Start the game
        startGame: function(mode, character) {
            // Use defaults if not provided
            selectedMode = mode || 'free-world';
            selectedCharacter = character || 'american';
            
            console.log("Starting game mode:", selectedMode, "with character:", selectedCharacter);
            
            // Initialize if needed
            if (!scene) {
                if (!init()) {
                    console.error("Failed to initialize game engine");
                    return;
                }
            }
            
            // Create cockroach character
            createCockroach(selectedCharacter);
            
            // Make sure we're visible
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            
            // Start the game loop
            isRunning = true;
        },
        
        // Pause the game
        pauseGame: function() {
            isRunning = false;
        },
        
        // Resume the game
        resumeGame: function() {
            isRunning = true;
        },
        
        // Stop the game and clean up
        stopGame: function() {
            isRunning = false;
            cleanup();
        }
    };
})();

// Log when loaded
console.log("Cockroach Run Game Engine loaded successfully");
