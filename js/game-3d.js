/**
 * Cockroach Run - 3D Game Engine
 * Direct implementation matching the working test-free-world-simple.html
 */

window.Game = (function() {
    // Main components
    let canvas = null;
    let renderer = null;
    let scene = null;
    let camera = null;
    let clock = null;
    
    // Physics
    let world = null;
    let cockroachBody = null;
    
    // Models
    let cockroachModel = null;
    let debugCubeBody = null;
    let debugCube = null;
    
    // Game state
    let isRunning = false;
    let debugMode = false;
    let orbitControls = null;
    
    // Character selection
    let selectedCharacter = 'american';
    
    // Input state
    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    };
    
    // Initialize game
    function init() {
        console.log("Initializing 3D game engine...");
        
        try {
            // Verify container exists
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) {
                console.error("Game container not found!");
                return false;
            }
            
            // Make sure container is visible and styled like the test page
            gameContainer.style.position = 'absolute';
            gameContainer.style.top = '0';
            gameContainer.style.left = '0';
            gameContainer.style.width = '100vw';
            gameContainer.style.height = '100vh';
            gameContainer.style.boxSizing = 'border-box';
            gameContainer.style.border = '3px dashed #9333EA';
            gameContainer.style.zIndex = '10';
            gameContainer.style.display = 'block';
            
            // Get canvas or create it if it doesn't exist
            canvas = document.getElementById('game-canvas');
            if (!canvas) {
                console.error("Canvas not found!");
                return false;
            }
            
            // Style canvas to match test page
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            canvas.style.background = '#121212';
            
            // Initialize Three.js - EXACTLY like test page
            initThreeJS();
            
            // Initialize physics - EXACTLY like test page
            initPhysicsWorld();
            
            // Create environment
            createEnvironment();
            
            // Set up input handling
            setupInputHandlers();
            
            // Add resize handler
            window.addEventListener('resize', onWindowResize);
            
            // Create clock
            clock = new THREE.Clock();
            
            // Start animation loop
            animate();
            
            console.log("3D game engine initialized successfully!");
            return true;
        } catch (error) {
            console.error("Error initializing game:", error);
            return false;
        }
    }
    
    // Initialize Three.js - EXACTLY matching test page
    function initThreeJS() {
        console.log("Initializing Three.js...");
        
        // Create renderer - EXACT same configuration as test page
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        
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
        
        // Add debug orbit controls (toggled with 'T' key)
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControls.enabled = false;
    }
    
    // Initialize physics world
    function initPhysicsWorld() {
        console.log("Initializing physics world...");
        
        // Create world with Earth gravity
        world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.NaiveBroadphase();
        world.solver.iterations = 10;
        
        // Create ground plane - physics
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.addBody(groundBody);
    }
    
    // Create environment (ground, lights, grid)
    function createEnvironment() {
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Add cyberpunk colored lights
        const purpleLight = new THREE.PointLight(0x9333EA, 1, 50);
        purpleLight.position.set(5, 5, 5);
        scene.add(purpleLight);
        
        const greenLight = new THREE.PointLight(0x00FF66, 1, 50);
        greenLight.position.set(-5, 3, -5);
        scene.add(greenLight);
        
        // Add ground - visual
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
        
        // Add grid for cyberpunk aesthetic
        const gridHelper = new THREE.GridHelper(100, 100, 0x00FF66, 0x444444);
        scene.add(gridHelper);
        
        // Add debug axes helper
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    }
    
    // Create cockroach with physics body
    function createCockroach(character) {
        console.log("Creating cockroach:", character);
        
        // Create placeholder box
        const boxGeometry = new THREE.BoxGeometry(1, 0.5, 2);
        const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xaa5500 });
        cockroachModel = new THREE.Mesh(boxGeometry, boxMaterial);
        cockroachModel.castShadow = true;
        scene.add(cockroachModel);
        
        // Create cockroach physics body
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1));
        cockroachBody = new CANNON.Body({ mass: 1 });
        cockroachBody.addShape(shape);
        cockroachBody.position.set(0, 1, 0);
        world.addBody(cockroachBody);
        
        // Try to load the actual model
        loadCockroachModel(character);
    }
    
    // Load GLTF cockroach model
    function loadCockroachModel(character) {
        // Determine which loader instance to use
        let loader;
        if (typeof THREE.GLTFLoader !== 'undefined') {
            loader = new THREE.GLTFLoader();
        } else if (typeof GLTFLoader !== 'undefined') {
            loader = new GLTFLoader();
        } else {
            console.warn("GLTFLoader not found - using placeholder box");
            return;
        }
        
        // Determine model path based on character
        let modelPath;
        switch(character) {
            case 'american':
                modelPath = 'assets/models/american-cockroach.glb';
                break;
            case 'german':
                modelPath = 'assets/models/german-cockroach.glb';
                break;
            default:
                modelPath = 'assets/models/cockroach.glb';
        }
        
        // Load the model
        loader.load(
            modelPath,
            function(gltf) {
                console.log("Cockroach model loaded successfully!");
                
                // Remove placeholder
                if (cockroachModel) {
                    scene.remove(cockroachModel);
                }
                
                // Use the loaded model
                cockroachModel = gltf.scene;
                cockroachModel.scale.set(0.5, 0.5, 0.5);
                cockroachModel.castShadow = true;
                scene.add(cockroachModel);
            },
            function(xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function(error) {
                console.error('Error loading cockroach model:', error);
            }
        );
    }
    
    // Set up input handlers
    function setupInputHandlers() {
        // Keyboard down
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
                case 'KeyT': // Toggle debug mode
                    debugMode = !debugMode;
                    if (orbitControls) {
                        orbitControls.enabled = debugMode;
                    }
                    console.log("Debug mode:", debugMode);
                    break;
            }
        });
        
        // Keyboard up
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
    
    // Handle window resize
    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    // Update cockroach position and rotation based on input
    function updateCockroach() {
        if (!cockroachBody || !cockroachModel) return;
        
        // Movement parameters
        const force = 10;
        const torque = 5;
        
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
        if (keys.jump && Math.abs(cockroachBody.velocity.y) < 0.1) {
            cockroachBody.applyImpulse(new CANNON.Vec3(0, 5, 0), cockroachBody.position);
        }
        
        // Update model position and rotation to match physics body
        cockroachModel.position.copy(cockroachBody.position);
        cockroachModel.quaternion.copy(cockroachBody.quaternion);
    }
    
    // Update camera to follow cockroach
    function updateCamera() {
        if (!cockroachModel || !camera || debugMode) return;
        
        // Third-person camera offset
        const offset = new THREE.Vector3(0, 3, 6);
        offset.applyQuaternion(cockroachModel.quaternion);
        
        // Position camera
        const targetPosition = new THREE.Vector3()
            .copy(cockroachModel.position)
            .add(offset);
        camera.position.copy(targetPosition);
        camera.lookAt(cockroachModel.position);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isRunning) return;
        
        // Get delta time
        const delta = clock.getDelta();
        
        // Update physics world
        if (world) {
            world.step(1/60, delta, 3);
        }
        
        // Update cockroach
        updateCockroach();
        
        // Update camera
        updateCamera();
        
        // Update debug controls if needed
        if (debugMode && orbitControls) {
            orbitControls.update();
        }
        
        // Render scene
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Clean up resources
    function cleanup() {
        window.removeEventListener('resize', onWindowResize);
        
        if (renderer) {
            renderer.dispose();
        }
        
        if (scene) {
            while(scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        }
        
        isRunning = false;
    }
    
    // Public API
    return {
        startGame: function(mode, character) {
            console.log("Starting game with mode:", mode || "free-world", "and character:", character || "american");
            
            // Store selection
            selectedCharacter = character || "american";
            
            // Initialize game if needed
            if (!scene) {
                if (!init()) {
                    console.error("Failed to initialize 3D game");
                    return;
                }
            }
            
            // Create cockroach
            createCockroach(selectedCharacter);
            
            // Make sure we render at least once
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
            
            // Start running
            isRunning = true;
        },
        
        pauseGame: function() {
            isRunning = false;
        },
        
        resumeGame: function() {
            isRunning = true;
        },
        
        stopGame: function() {
            cleanup();
        }
    };
})();

console.log("3D game engine loaded");
