/**
 * Cockroach Run Game Engine
 * Core 3D game implementation using Three.js and Cannon.js physics
 * 
 * @version 1.0.0
 * @author Cockroach Run Development Team
 */

// Initialize the Game object in global scope for UI to access
window.Game = (function() {
    // Constants for gameplay fine-tuning
    const PHYSICS = {
        GRAVITY: -9.82,
        CLIMB_ANGLE: 0.7,        // Maximum angle for climbing (radians)
        JUMP_FORCE: 5,           // Force applied when jumping
        GROUND_FRICTION: 0.5,    // Friction against ground
        WALL_FRICTION: 0.8       // Friction against walls for climbing
    };
    
    // Private variables
    let canvas, gameContainer;
    let scene, camera, renderer;
    let cockroachModel, cockroachBody;
    let physicsWorld;
    let clock;
    let raycaster;
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
    
    // Initialize the game engine
    function init() {
        console.log('Game engine initializing...');
        
        // Create THREE.js scene
        if (!initThreeJS()) {
            console.error('Failed to initialize Three.js');
            return false;
        }
        
        // Create physics world
        if (!initPhysics()) {
            console.error('Failed to initialize physics');
            return false;
        }
        
        // Set up lighting
        addLights();
        
        // Create simple environment
        createEnvironment();
        
        // Set up input handlers
        setupInputHandlers();
        
        // Create clock for animation
        clock = new THREE.Clock();
        
        // Start animation loop
        animate();
        
        console.log('Game engine initialized successfully');
        return true;
    }
    
    // Initialize Three.js scene, camera and renderer
    function initThreeJS() {
        console.log('Initializing Three.js...');
        
        // Get the canvas element
        canvas = document.getElementById('game-canvas');
        gameContainer = document.getElementById('game-container');
        
        if (!canvas || !gameContainer) {
            console.error('Canvas or container not found!');
            return false;
        }
        
        // Ensure the game container is visible
        gameContainer.style.display = 'block';
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '0';
        gameContainer.style.left = '0';
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.zIndex = '100';
        console.log('Game container configured');
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212); // Dark background
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
        
        // Handle window resizing
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        return true;
    }
    
    // Initialize physics system
    function initPhysics() {
        if (typeof CANNON === 'undefined') {
            console.error('CANNON physics library not found!');
            return false;
        }
        
        try {
            // Create physics world
            physicsWorld = new CANNON.World();
            physicsWorld.gravity.set(0, PHYSICS.GRAVITY, 0);
            physicsWorld.broadphase = new CANNON.NaiveBroadphase();
            physicsWorld.solver.iterations = 10;
            
            // Create ground plane
            const groundShape = new CANNON.Plane();
            const groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            physicsWorld.addBody(groundBody);
            
            return true;
        } catch (error) {
            console.error('Error initializing physics:', error);
            return false;
        }
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
    }
    
    // Create a simple environment
    function createEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = -0.5;
        groundMesh.receiveShadow = true;
        scene.add(groundMesh);
        
        // Grid helper
        const gridHelper = new THREE.GridHelper(100, 100, 0x555555, 0x333333);
        scene.add(gridHelper);
    }
    
    // Set up keyboard and touch input handlers
    function setupInputHandlers() {
        // Keyboard events
        window.addEventListener('keydown', function(event) {
            handleKeyDown(event.code);
        });
        
        window.addEventListener('keyup', function(event) {
            handleKeyUp(event.code);
        });
        
        // Touch controls can be added here
    }
    
    // Handle key down events
    function handleKeyDown(code) {
        switch (code) {
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
    }
    
    // Handle key up events
    function handleKeyUp(code) {
        switch (code) {
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
    }
    
    // Create and load the cockroach character
    function createCharacter() {
        console.log('Creating character:', selectedCharacter);
        
        // Create a temporary cockroach representation (colored box)
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa5500 });
        cockroachModel = new THREE.Mesh(geometry, material);
        cockroachModel.position.y = 0.25;
        cockroachModel.castShadow = true;
        scene.add(cockroachModel);
        
        // Try to load the GLTF model if possible
        loadCockroachModel();
        
        // Create physics body for cockroach
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1));
        cockroachBody = new CANNON.Body({ mass: 1 });
        cockroachBody.addShape(shape);
        cockroachBody.position.set(0, 1, 0);
        physicsWorld.addBody(cockroachBody);
        
        console.log('Character created');
    }
    
    // Load the cockroach GLTF model
    function loadCockroachModel() {
        let loader;
        
        // Try to get the GLTFLoader (browser might have it in different places)
        if (THREE.GLTFLoader) {
            loader = new THREE.GLTFLoader();
        } else if (window.GLTFLoader) {
            loader = new window.GLTFLoader();
        } else if (typeof GLTFLoader !== 'undefined') {
            loader = new GLTFLoader();
        } else {
            console.error('GLTFLoader not found, using placeholder cockroach');
            return;
        }
        
        // Load the model
        const modelPath = 'assets/models/cockroach.glb';
        loader.load(
            modelPath,
            function(gltf) {
                // Model loaded successfully
                console.log('Cockroach model loaded successfully');
                
                // Remove placeholder
                if (cockroachModel) {
                    scene.remove(cockroachModel);
                }
                
                // Add the new model
                cockroachModel = gltf.scene;
                cockroachModel.scale.set(0.5, 0.5, 0.5);
                cockroachModel.castShadow = true;
                scene.add(cockroachModel);
            },
            function(xhr) {
                // Loading progress
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function(error) {
                // Error loading model
                console.error('Error loading cockroach model:', error);
                console.log('Using placeholder cockroach');
            }
        );
    }
    
    // Update cockroach movement based on input
    function updateCockroachMovement(delta) {
        if (!cockroachModel || !cockroachBody) return;
        
        // Apply movement forces based on input
        const force = 10;
        const torque = 3;
        
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
        if (keys.jump && cockroachBody.position.y < 0.6) {
            cockroachBody.applyImpulse(new CANNON.Vec3(0, PHYSICS.JUMP_FORCE, 0), cockroachBody.position);
        }
        
        // Update visual model to match physics body
        cockroachModel.position.copy(cockroachBody.position);
        cockroachModel.quaternion.copy(cockroachBody.quaternion);
    }
    
    // Update camera to follow cockroach
    function updateCamera() {
        if (!cockroachModel || !camera) return;
        
        // Use offset for third-person camera view
        const offset = new THREE.Vector3(0, 2, 5);
        offset.applyQuaternion(cockroachModel.quaternion);
        
        // Set camera position
        const cameraPosition = cockroachModel.position.clone().add(offset);
        camera.position.copy(cameraPosition);
        
        // Look at cockroach
        camera.lookAt(cockroachModel.position);
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
        
        // Update cockroach movement based on input
        updateCockroachMovement(delta);
        
        // Update camera to follow cockroach
        updateCamera();
        
        // Render scene - this is critical
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Cleanup resources to prevent memory leaks
    function dispose() {
        // Remove event listeners
        window.removeEventListener('resize', null);
        window.removeEventListener('keydown', null);
        window.removeEventListener('keyup', null);
        
        // Dispose Three.js resources
        if (renderer) {
            renderer.dispose();
        }
        
        // Clear scene
        if (scene) {
            while (scene.children.length > 0) {
                const object = scene.children[0];
                scene.remove(object);
            }
        }
    }
    
    // Return public API
    return {
        // Start the game with the given mode and character
        startGame: function(mode, character) {
            console.log('Game.startGame called with mode:', mode, 'character:', character);
            
            // Set game parameters
            selectedMode = mode || 'free-world';
            selectedCharacter = character || 'american';
            
            // Make sure the canvas container is visible before initializing
            const gameContainer = document.getElementById('game-container');
            const canvas = document.getElementById('game-canvas');
            
            if (gameContainer) {
                gameContainer.style.display = 'block';
                gameContainer.style.position = 'fixed';
                gameContainer.style.top = '0';
                gameContainer.style.left = '0';
                gameContainer.style.width = '100vw';
                gameContainer.style.height = '100vh';
                gameContainer.style.zIndex = '100';
                console.log('Game container made visible via startGame');
            }
            
            // Initialize if not already done
            if (!scene) {
                console.log('First time initialization in startGame');
                if (!init()) {
                    console.error('Failed to initialize game engine');
                    return;
                }
            } else {
                // If already initialized, make sure renderer is properly sized
                if (renderer) {
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    console.log('Resized existing renderer');
                }
            }
            
            // Create character (cockroach) and start animation loop
            createCharacter();
            
            // Force a render to make sure the scene appears immediately
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
                console.log('Forced initial render');
            }
            
            // Start game loop
            isRunning = true;
            
            console.log('Game started successfully');
        },
        
        // Pause the game
        pauseGame: function() {
            isRunning = false;
            console.log('Game paused');
        },
        
        // Resume the game
        resumeGame: function() {
            isRunning = true;
            console.log('Game resumed');
        },
        
        // Stop the game and clean up resources
        stopGame: function() {
            isRunning = false;
            dispose();
            console.log('Game stopped and resources disposed');
        }
    };
})();

// Log that the game engine is loaded
console.log('Game engine loaded and ready');
