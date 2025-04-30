/**
 * Cockroach Run - Game Engine
 * Direct implementation based on working test-free-world-simple.html
 */

window.Game = (function() {
    // Game instance variables
    let scene, camera, renderer;
    let canvas, gameContainer;
    let clock;
    let physicsWorld;
    let cockroachModel, cockroachBody;
    let isRunning = false;
    let selectedCharacter = 'american';
    let selectedMode = 'free-world';
    
    // Input state
    const keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    };
    
    // Initialize game engine
    function initGame() {
        console.log("Initializing game engine...");
        
        try {
            // Get canvas and container
            canvas = document.getElementById('game-canvas');
            gameContainer = document.getElementById('game-container');
            
            if (!canvas || !gameContainer) {
                console.error("Canvas or container not found!");
                return false;
            }
            
            // Make container visible
            gameContainer.style.display = 'block';
            gameContainer.style.position = 'fixed';
            gameContainer.style.top = '0';
            gameContainer.style.left = '0';
            gameContainer.style.width = '100%';
            gameContainer.style.height = '100%';
            gameContainer.style.zIndex = '100';
            
            // Set canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Initialize THREE.js exactly like in the working test file
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x121212);
            
            camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.set(0, 5, 10);
            camera.lookAt(0, 0, 0);
            
            // Initialize physics
            initPhysics();
            
            // Setup environment
            createEnvironment();
            
            // Setup input handlers
            setupInputHandlers();
            
            // Create clock for animation
            clock = new THREE.Clock();
            
            // Handle window resize
            window.addEventListener('resize', function() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // Start animation loop
            animate();
            
            console.log("Game engine initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing game:", error);
            return false;
        }
    }
    
    // Initialize physics
    function initPhysics() {
        if (typeof CANNON === 'undefined') {
            console.error("CANNON.js physics library not found!");
            return false;
        }
        
        // Create physics world
        physicsWorld = new CANNON.World();
        physicsWorld.gravity.set(0, -9.82, 0);
        physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        physicsWorld.solver.iterations = 10;
        
        // Create ground plane
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        physicsWorld.addBody(groundBody);
        
        return true;
    }
    
    // Create environment
    function createEnvironment() {
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Add ground
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
        
        // Add neon lights for cyberpunk feel
        const purpleLight = new THREE.PointLight(0x9333EA, 1, 50);
        purpleLight.position.set(5, 5, 5);
        scene.add(purpleLight);
        
        const greenLight = new THREE.PointLight(0x00FF66, 1, 50);
        greenLight.position.set(-5, 3, -5);
        scene.add(greenLight);
    }
    
    // Create cockroach character
    function createCockroach(type) {
        console.log("Creating cockroach:", type);
        
        // Create temp box
        const geometry = new THREE.BoxGeometry(1, 0.5, 2);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa5500 });
        cockroachModel = new THREE.Mesh(geometry, material);
        cockroachModel.position.set(0, 1, 0);
        cockroachModel.castShadow = true;
        scene.add(cockroachModel);
        
        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.25, 1));
        cockroachBody = new CANNON.Body({ mass: 1 });
        cockroachBody.addShape(shape);
        cockroachBody.position.set(0, 1, 0);
        physicsWorld.addBody(cockroachBody);
        
        // Try to load model
        loadModel(type);
    }
    
    // Load cockroach model
    function loadModel(type) {
        // Find GLTFLoader
        let loader;
        if (typeof THREE.GLTFLoader !== 'undefined') {
            loader = new THREE.GLTFLoader();
        } else if (typeof window.GLTFLoader !== 'undefined') {
            loader = new window.GLTFLoader(); 
        } else {
            console.warn("GLTFLoader not found, using placeholder cockroach");
            return;
        }
        
        // Determine model path
        const modelPath = type === 'american' ? 
            'assets/models/american-cockroach.glb' : 
            'assets/models/cockroach.glb';
        
        // Load the model
        loader.load(
            modelPath,
            function(gltf) {
                // Success
                console.log("Model loaded successfully");
                scene.remove(cockroachModel);
                cockroachModel = gltf.scene;
                cockroachModel.scale.set(0.5, 0.5, 0.5);
                cockroachModel.castShadow = true;
                scene.add(cockroachModel);
            },
            function(xhr) {
                // Progress
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function(error) {
                // Error
                console.error("Error loading model:", error);
            }
        );
    }
    
    // Setup input handlers
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
    
    // Update cockroach movement
    function updateCockroach(delta) {
        if (!cockroachModel || !cockroachBody) return;
        
        // Apply forces based on input
        const force = 10;
        const torque = 5;
        
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
        if (keys.jump && cockroachBody.position.y < 1.1) {
            cockroachBody.applyImpulse(new CANNON.Vec3(0, 5, 0), cockroachBody.position);
        }
        
        // Update visual model position
        cockroachModel.position.copy(cockroachBody.position);
        cockroachModel.quaternion.copy(cockroachBody.quaternion);
    }
    
    // Update camera to follow cockroach
    function updateCamera() {
        if (!cockroachModel || !camera) return;
        
        // Set camera position behind cockroach
        const offset = new THREE.Vector3(0, 3, 6);
        offset.applyQuaternion(cockroachModel.quaternion);
        
        const targetPosition = new THREE.Vector3().copy(cockroachModel.position).add(offset);
        camera.position.copy(targetPosition);
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
        
        // Update cockroach
        updateCockroach(delta);
        
        // Update camera
        updateCamera();
        
        // Render scene
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Clean up resources
    function cleanup() {
        window.removeEventListener('resize', null);
        window.removeEventListener('keydown', null);
        window.removeEventListener('keyup', null);
        
        if (renderer) {
            renderer.dispose();
        }
        
        if (scene) {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        }
    }
    
    // Public API
    return {
        startGame: function(mode, character) {
            console.log("Starting game with mode:", mode || 'free-world', "and character:", character || 'american');
            
            // Store selections
            selectedMode = mode || 'free-world';
            selectedCharacter = character || 'american';
            
            // Initialize if needed
            if (!scene) {
                const success = initGame();
                if (!success) {
                    console.error("Failed to initialize game engine");
                    alert("Sorry, there was an error initializing the game.");
                    return;
                }
            }
            
            // Create cockroach
            createCockroach(selectedCharacter);
            
            // Force initial render
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
            isRunning = false;
            cleanup();
        }
    };
})();

console.log("Game engine loaded successfully");
