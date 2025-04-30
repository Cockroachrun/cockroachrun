/**
 * Cockroach Run - Direct Game Implementation 
 * Using the working test-free-world-simple.html as a template
 */

// Create the Game object in the global scope for UI access
window.Game = (function() {
    // Game state
    let scene, camera, renderer;
    let cockroach, cockroachBody;
    let physicsWorld;
    let clock;
    let isRunning = false;
    let canvas, gameContainer;
    let debugMode = false;
    let orbitControls;
    
    // Constants
    const GRAVITY = -9.82;
    
    // Input state
    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    };
    
    // Initialize the game
    function init() {
        console.log("Initializing game engine...");
        
        // Get canvas and container
        canvas = document.getElementById('game-canvas');
        gameContainer = document.getElementById('game-container');
        
        if (!canvas || !gameContainer) {
            console.error("Canvas or container not found!");
            return false;
        }
        
        // Make sure container is visible
        gameContainer.style.display = 'block';
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '0';
        gameContainer.style.left = '0';
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.zIndex = '100';
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212);
        
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
            antialias: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        
        // Set up physics
        setupPhysics();
        
        // Add lights
        setupLights();
        
        // Add grid and ground
        createEnvironment();
        
        // Set up keyboard
        setupInputHandlers();
        
        // Create clock for animation timing
        clock = new THREE.Clock();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start animation loop
        animate();
        
        console.log("Game engine initialized successfully");
        return true;
    }
    
    // Set up physics
    function setupPhysics() {
        if (typeof CANNON === 'undefined') {
            console.error("CANNON.js not loaded!");
            return;
        }
        
        // Create world
        physicsWorld = new CANNON.World();
        physicsWorld.gravity.set(0, GRAVITY, 0);
        physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        
        // Create ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        physicsWorld.addBody(groundBody);
    }
    
    // Set up lights
    function setupLights() {
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
    }
    
    // Create environment
    function createEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Grid helper
        const grid = new THREE.GridHelper(100, 100, 0x00ff00, 0x444444);
        scene.add(grid);
    }
    
    // Create cockroach character
    function createCockroach(type) {
        console.log("Creating cockroach:", type);
        
        // Create visual representation (temporary box)
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa5500 });
        cockroach = new THREE.Mesh(geometry, material);
        cockroach.position.set(0, 0.5, 0);
        cockroach.castShadow = true;
        scene.add(cockroach);
        
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1));
        cockroachBody = new CANNON.Body({ mass: 1 });
        cockroachBody.addShape(shape);
        cockroachBody.position.set(0, 0.5, 0);
        physicsWorld.addBody(cockroachBody);
        
        // Try to load real model
        loadCockroachModel(type);
    }
    
    // Load the GLTF model for cockroach
    function loadCockroachModel(type) {
        let loader;
        
        // Try to find the GLTFLoader (might be in different places)
        if (THREE.GLTFLoader) {
            loader = new THREE.GLTFLoader();
        } else if (window.GLTFLoader) {
            loader = new window.GLTFLoader();
        } else {
            console.error("GLTFLoader not found, using placeholder");
            return;
        }
        
        // Determine model path based on type
        const modelPath = `assets/models/${type}-cockroach.glb`;
        
        // Load the model
        loader.load(
            modelPath,
            function(gltf) {
                // Success - replace placeholder with actual model
                scene.remove(cockroach);
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
                console.error("Error loading model:", error);
                console.log("Using placeholder cockroach");
            }
        );
    }
    
    // Set up keyboard input
    function setupInputHandlers() {
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
                case 'KeyT':
                    toggleDebugMode();
                    break;
            }
        });
        
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
    
    // Toggle debug camera mode
    function toggleDebugMode() {
        debugMode = !debugMode;
        if (debugMode) {
            // Create orbit controls for debug
            orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        } else {
            // Remove orbit controls
            if (orbitControls) {
                orbitControls.dispose();
                orbitControls = null;
            }
        }
    }
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Update cockroach movement
    function updateCockroach() {
        if (!cockroach || !cockroachBody) return;
        
        // Movement variables
        const force = 10;
        const rotationForce = 5;
        const jumpForce = 5;
        
        // Apply forces based on input
        if (keys.forward) {
            cockroachBody.applyLocalForce(new CANNON.Vec3(0, 0, -force), new CANNON.Vec3(0, 0, 0));
        }
        if (keys.backward) {
            cockroachBody.applyLocalForce(new CANNON.Vec3(0, 0, force), new CANNON.Vec3(0, 0, 0));
        }
        if (keys.left) {
            cockroachBody.applyTorque(new CANNON.Vec3(0, rotationForce, 0));
        }
        if (keys.right) {
            cockroachBody.applyTorque(new CANNON.Vec3(0, -rotationForce, 0));
        }
        if (keys.jump && cockroachBody.position.y < 0.6) {
            cockroachBody.applyImpulse(new CANNON.Vec3(0, jumpForce, 0), cockroachBody.position);
        }
        
        // Update mesh position
        cockroach.position.copy(cockroachBody.position);
        cockroach.quaternion.copy(cockroachBody.quaternion);
    }
    
    // Update camera position
    function updateCamera() {
        if (debugMode || !cockroach) return;
        
        // Set offset for third-person view
        const offset = new THREE.Vector3(0, 3, 6);
        offset.applyQuaternion(cockroach.quaternion);
        
        // Position camera
        camera.position.copy(cockroach.position).add(offset);
        camera.lookAt(cockroach.position);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isRunning) return;
        
        const delta = clock.getDelta();
        
        // Update physics
        if (physicsWorld) {
            physicsWorld.step(1/60, delta, 3);
        }
        
        // Update cockroach
        updateCockroach();
        
        // Update camera
        updateCamera();
        
        // Update debug controls
        if (debugMode && orbitControls) {
            orbitControls.update();
        }
        
        // Render
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Clean up resources
    function cleanup() {
        // Remove event listeners
        window.removeEventListener('resize', onWindowResize);
        window.removeEventListener('keydown', null);
        window.removeEventListener('keyup', null);
        
        // Dispose of resources
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
        startGame: function(mode, character) {
            console.log("Starting game... Mode:", mode, "Character:", character);
            
            // Show game container
            const container = document.getElementById('game-container');
            if (container) {
                container.style.display = 'block';
                container.style.zIndex = '100';
            }
            
            // Initialize engine if needed
            if (!scene) {
                if (!init()) {
                    console.error("Failed to initialize game engine");
                    return;
                }
            }
            
            // Create cockroach
            createCockroach(character || 'american');
            
            // Force render
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            
            // Start game
            isRunning = true;
            console.log("Game started!");
        },
        
        pauseGame: function() {
            isRunning = false;
            console.log("Game paused");
        },
        
        resumeGame: function() {
            isRunning = true;
            console.log("Game resumed");
        },
        
        stopGame: function() {
            isRunning = false;
            cleanup();
            console.log("Game stopped");
        }
    };
})();

console.log("Game engine loaded!");
