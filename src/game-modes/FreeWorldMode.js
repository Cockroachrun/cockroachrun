/**
 * FreeWorldMode - Physics-based 3D environment for cockroach movement
 * 
 * Implements character controls, camera following, and physics interactions
 * in a Three.js/Cannon.js environment
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameStateManager } from '../core/GameStateManager.js';

// Import physics engine with fallback support
import * as CANNON_ES from 'cannon-es';

// Constants
const DEBUG = true;
const DEFAULT_CHARACTER = 'american';
const DEFAULT_SPEEDS = {
  movement: 2,
  rotation: 2
};
const DEFAULT_CAMERA_OFFSET = { x: 0, y: 2, z: 4 };

/**
 * Resolve Cannon.js module - uses global instance if available, otherwise ES module
 * This enables compatibility with both bundled and script tag environments
 */
const CANNON = (typeof window !== 'undefined' && window.CANNON) ? window.CANNON : CANNON_ES;

// Log initialization status only in debug mode
if (DEBUG) {
  console.log('Cannon.js initialized:', CANNON ? 'YES' : 'NO');
}

export class FreeWorldMode {
  /**
   * Creates a new FreeWorldMode instance
   * 
   * @param {Object} params - Configuration parameters
   * @param {THREE.Scene} [params.scene] - Three.js scene
   * @param {THREE.Camera} [params.camera] - Three.js camera
   * @param {THREE.WebGLRenderer} [params.renderer] - Three.js renderer
   * @param {CANNON.World} [params.physicsWorld] - Cannon.js physics world
   * @param {HTMLElement} [params.canvas] - Canvas element for rendering
   * @param {string} [params.selectedCharacter] - Selected cockroach type
   */
  constructor(params) {
    if (DEBUG) console.log('FreeWorldMode constructor called');
    
    this.initializeComponents(params);
    this.initializeEntityState();
    this.initializeControls();
    this.initializeCamera();
  }
  
  /**
   * Initialize core rendering and physics components
   * Supports both component-based and legacy initialization patterns
   */
  initializeComponents(params) {
    // Handle modern component-based initialization
    if (params.scene) {
      this.scene = params.scene;
      this.camera = params.camera;
      this.renderer = params.renderer;
      this.clock = params.clock || new THREE.Clock();
      this.physicsWorld = params.physicsWorld;
      this.canvas = params.canvas;
      this.selectedCharacter = params.selectedCharacter || DEFAULT_CHARACTER;
      
      if (DEBUG) console.log('Using component-based initialization');
    } 
    // Handle legacy game object initialization
    else {
      this.game = params;
      if (DEBUG) console.log('Using legacy game object initialization');
    }
  }
  
  /**
   * Initialize entity state properties
   */
  initializeEntityState() {
    // Scene objects collection
    this.objects = [];
    
    // Character representations
    this.cockroachModel = null;   // Visual model (Three.js)
    this.cockroachBody = null;    // Physics body (Cannon.js)
    this.isModelLoaded = false;
    
    // Animation system
    this.mixer = null;
    this.animations = {};
    
    // Debug state
    this.debugMode = true;
  }
  
  /**
   * Initialize control and movement properties
   */
  initializeControls() {
    // Movement configuration
    this.moveSpeed = DEFAULT_SPEEDS.movement;
    this.rotationSpeed = DEFAULT_SPEEDS.rotation;
    
    // Input state tracking
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    // Bound methods for event listeners (prevents memory leaks during removal)
    this._handleKeyDown = this.handleKeyDown.bind(this);
    this._handleKeyUp = this.handleKeyUp.bind(this);
  }
  
  /**
   * Initialize camera settings
   */
  initializeCamera() {
    // Camera following configuration
    this.cameraOffset = new THREE.Vector3(
      DEFAULT_CAMERA_OFFSET.x,
      DEFAULT_CAMERA_OFFSET.y,
      DEFAULT_CAMERA_OFFSET.z
    );
    this.cameraTarget = new THREE.Vector3();
  }

  init() {
    if (DEBUG) console.log('Initializing Free World mode - ' + new Date().toISOString());
    
    // Basic scene setup
    this.setupScene();
    
    // Create a simple environment
    this.createEnvironment();
    
    // Add debug helpers like grid and axis
    this.addHelpers();
    
    // Position camera to see the scene
    if (this.camera) {
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(0, 0, 0);
      if (DEBUG) console.log('Camera positioned at:', this.camera.position);
    } else {
      console.error('Camera not available in FreeWorldMode');
    }
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Load and create character based on the selected character in GameStateManager
    this.createCharacter();
    
    // Create camera controls for debugging
    if (this.debugMode) {
      this.setupDebugControls();
    }
    
    if (DEBUG) console.log('Free World mode initialization complete');
    
    return this;
  }
  
  setupScene() {
    if (DEBUG) console.log('Setting up scene in FreeWorldMode');
    
    // Initialize or get reference to Three.js components if not already set
    if (this.game) {
      // Legacy format - get from game object
      this.scene = this.game.scene;
      this.camera = this.game.camera;
      this.renderer = this.game.renderer;
      this.physicsWorld = this.game.physicsWorld;
      console.log('Got scene components from game object');
    }
    
    if (!this.scene || !this.camera || !this.renderer) {
      console.error('Required components not available');
      return false;
    }
    
    // Set a skybox or background color
    this.scene.background = new THREE.Color(0x121212); // Dark background
    
    // Add lights
    this.addLights();
    
    if (DEBUG) console.log('Scene setup completed successfully');
    return true;
  }
  
  addLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light (mimics sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    
    // Optimize shadow settings
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    
    this.scene.add(directionalLight);
    
    // Add cyberpunk-style accent lights
    const purpleLight = new THREE.PointLight(0x9333EA, 1, 10);
    purpleLight.position.set(-5, 1, 0);
    this.scene.add(purpleLight);
    
    const greenLight = new THREE.PointLight(0x00FF66, 1, 10);
    greenLight.position.set(5, 1, 0);
    this.scene.add(greenLight);
  }

  createEnvironment() {
    // Create a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Add a few simple obstacles to test collision/movement
    this.addObstacle(-5, 0.5, -5, 1, 1, 1, 0x9333EA); // Purple box
    this.addObstacle(5, 0.5, -3, 1, 1, 1, 0x00FF66);  // Green box
  }
  
  addObstacle(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.3
    });
    
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, y, z);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    
    this.scene.add(obstacle);
    this.objects.push(obstacle);
    
    return obstacle;
  }

  createCharacter() {
    try {
      // Check if GameStateManager exists and get selected character
      let selectedCharacter = 'american'; // Default to American cockroach
      try {
        if (GameStateManager && GameStateManager.getState) {
          selectedCharacter = GameStateManager.getState('selectedCharacter') || 'american';
        }
      } catch (e) {
        console.warn('GameStateManager not available, using default character');
      }
      
      // Determine which model to load based on selection
      this.createPlaceholderCockroach();
      
      // Attempt to load the real model if GLTFLoader is available
      if (GLTFLoader) {
        // Get model path based on selected character
        let modelPath;
        switch (this.selectedCharacter) {
          case 'american':
            modelPath = './assets/models/American Cockroach.glb';
            break;
          case 'german':
            modelPath = './assets/models/German Cockroach.glb';
            break;
          case 'oriental':
            modelPath = './assets/models/Oriental Cockroach.glb';
            break;
          default:
            modelPath = './assets/models/American Cockroach.glb'; // Default
        }
        
        console.log('Loading model from path:', modelPath);
        const loader = new GLTFLoader();
        
        // Start loading the model
        loader.load(
          modelPath,
          (gltf) => {
            if (DEBUG) console.log('Model loaded successfully:', gltf);
            
            // Remove placeholder if it exists
            if (this.placeholder && this.scene) {
              this.scene.remove(this.placeholder);
              if (DEBUG) console.log('Placeholder removed');
            }
            
            // Process model - set properties, scale, etc.
            const model = gltf.scene;
            model.position.set(0, 0.5, 0); // Position at origin, slightly above ground
            model.scale.set(0.1, 0.1, 0.1); // Scale appropriately
            
            // Enable shadows
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            // Add to scene
            if (this.scene) {
              this.scene.add(model);
              if (DEBUG) console.log('Model added to scene at position:', model.position);
              
              // Update reference to the loaded model
              this.cockroachModel = model;
              this.isModelLoaded = true;
              
              // Setup animations if available
              if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model);
                
                // Map animations by name
                gltf.animations.forEach((clip) => {
                  this.animations[clip.name] = this.mixer.clipAction(clip);
                  if (DEBUG) console.log(`Animation found: ${clip.name}`);
                });
                
                // Play idle animation if available
                if (this.animations['Idle']) {
                  this.animations['Idle'].play();
                  if (DEBUG) console.log('Playing idle animation');
                }
              } else {
                console.log('No animations found in model');
              }
              
              // Create physics body for the model
              this.createPhysicsBody();
            } else {
              console.error('Scene not available for model');
            }
          },
          (progress) => {
            // Model loading progress
            if (progress.lengthComputable) {
              const percentage = (progress.loaded / progress.total) * 100;
              if (DEBUG && Math.floor(percentage) % 10 === 0) {
                console.log(`Loading model: ${Math.floor(percentage)}%`);
              }
            }
          },
          (error) => {
            console.error('Error loading model, using placeholder only:', error);
          }
        );
      } else {
        console.warn('GLTFLoader not available, using placeholder cockroach only');
      }
    } catch (e) {
      console.error('Error in createCharacter:', e);
    }
  }
  
  createPlaceholderCockroach() {
    if (DEBUG) console.log('Creating placeholder cockroach');
    
    try {
      // Create a simple placeholder using basic shapes
      const group = new THREE.Group();
      
      // Body
      // Use CylinderGeometry for compatibility with Three.js r128 (CapsuleGeometry is r139+)
      const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x663300,
        roughness: 0.8
      });
      
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.z = Math.PI / 2;
      body.position.y = 0.2;
      group.add(body);
      
      // Add legs
      for (let i = 0; i < 3; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.3);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(0.2, 0.15, 0.2 - (i * 0.2));
        leftLeg.rotation.z = Math.PI / 4;
        group.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(-0.2, 0.15, 0.2 - (i * 0.2));
        rightLeg.rotation.z = -Math.PI / 4;
        group.add(rightLeg);
      }
      
      // Position the placeholder at appropriate height
      group.position.set(0, 0.5, 0); // Slightly above ground
      this.placeholder = group;
      
      // Add to scene
      if (this.scene) {
        this.scene.add(this.placeholder);
        console.log('Placeholder cockroach added to scene at position:', this.placeholder.position);
      } else {
        console.error('Scene not available for placeholder');
      }
      
      // CRITICAL: Ensure placeholder is treated as the current cockroach model
      // so the rest of the logic works even before the real model is loaded
      this.cockroachModel = this.placeholder;
      
      // Create physics body for placeholder immediately
      this.createPhysicsBody();
      
      return true;
    } catch (e) {
      console.error('Error creating placeholder:', e);
      return false;
    }
  }
  
  createPhysicsBody() {
    try {
      if (!this.cockroachModel) {
        console.error("Cannot create physics body: no visual model available");
        return false;
      }

      if (DEBUG) console.log("Creating physics body for cockroach");

      // Define a simple physics shape (sphere for simplicity and stability)
      let shapeRadius = 0.2; // Default radius if bounding box fails
      
      try {
        // Try to get size from bounding box
        const boundingBox = new THREE.Box3().setFromObject(this.cockroachModel);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        
        // Use the largest dimension for the sphere radius
        if (size.x > 0 && size.y > 0 && size.z > 0) {
          shapeRadius = Math.max(size.x, size.y, size.z) / 2 * 0.8; // 80% of half the largest dimension
          if (DEBUG) console.log(`Using bounding box size for physics: x=${size.x.toFixed(2)}, y=${size.y.toFixed(2)}, z=${size.z.toFixed(2)}`);
        }
      } catch (e) {
        console.warn('Error calculating bounding box, using default radius', e);
      }
      
      // Ensure radius is reasonable (not too small or large)
      shapeRadius = Math.max(0.1, Math.min(shapeRadius, 1.0));
      
      if (DEBUG) console.log(`Physics body radius: ${shapeRadius.toFixed(2)}`);
      
      // Create the physics shape
      const physicsShape = new CANNON.Sphere(shapeRadius);

      // Get current position and rotation from the visual model
      const worldPosition = new THREE.Vector3();
      this.cockroachModel.getWorldPosition(worldPosition);
      
      // Ensure position is above ground to prevent initial penetration
      worldPosition.y = Math.max(worldPosition.y, shapeRadius);
      
      const initialPosition = new CANNON.Vec3(
        worldPosition.x, 
        worldPosition.y, 
        worldPosition.z
      );
      
      // Create the physics body with appropriate properties
      this.cockroachBody = new CANNON.Body({
        mass: 1.0,               // Mass in kg
        position: initialPosition, 
        shape: physicsShape,
        linearDamping: 0.9,      // High damping to prevent sliding
        angularDamping: 0.9      // High damping to prevent spinning
      });

      // Add the body to the physics world
      if (this.game && this.game.physicsWorld) {
        this.game.physicsWorld.addBody(this.cockroachBody);
        console.log('Physics body added to world at position:', initialPosition);
        return true;
      } else {
        console.error('Physics world not found!');
        return false;
      }
    } catch (e) {
      console.error('Error creating physics body:', e);
      return false;
    }
  }
  
  /**
   * Set up input handlers for character control
   * Uses bound methods for proper cleanup and memory management
   */
  setupInputHandlers() {
    // Use the pre-bound handler methods from initializeControls()
    // to avoid creating new functions with each bind() call
    window.addEventListener('keydown', this._handleKeyDown);
    window.addEventListener('keyup', this._handleKeyUp);
    
    if (DEBUG) console.log('Input handlers initialized');
  }
  
  handleKeyDown(event) {
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        break;
      case 'KeyT': // Toggle debug mode
        if (this.debugMode) {
          this.disableDebugControls();
          this.debugMode = false;
        } else {
          this.setupDebugControls();
          this.debugMode = true;
        }
        break;
    }
  }
  
  handleKeyUp(event) {
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
    }
  }
  
  setupDebugControls() {
    // Create orbit controls for debugging
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    console.log('Debug controls enabled (press T to toggle)');
  }
  
  disableDebugControls() {
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
      console.log('Debug controls disabled');
    }
  }

  // Add helper objects for visual debugging
  addHelpers() {
    // Add axis helper (red=X, green=Y, blue=Z)
    const axisHelper = new THREE.AxesHelper(5);
    this.scene.add(axisHelper);
    
    // Add grid helper (20x20 grid on the XZ plane)
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.scene.add(gridHelper);
    
    // Add a simple ground plane with a distinct material
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x888888,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    groundMesh.receiveShadow = true;
    groundMesh.position.y = -0.01; // Slightly below the physics ground to avoid z-fighting
    
    this.scene.add(groundMesh);
    this.objects.push(groundMesh);
    
    if (DEBUG) console.log('Helpers and ground plane added to scene');
  }
  
  update(delta) {
    // If using the debug orbit controls
    if (this.debugMode && this.controls) {
      this.controls.update();
      // Note: Physics simulation should still continue in debug mode
      // if (this.game.physicsWorld) this.game.physicsWorld.step(1/60, delta, 3);
      return;
    }
    
    // ASSUMPTION: The main game loop calls physicsWorld.step() globally
    // Example: this.game.physicsWorld.step(1/60, delta, 3);
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }
    
    // Update character movement logic (applies forces/torques)
    this.updateCharacterMovement(delta);
    
    // Sync visual model to physics body
    if (this.cockroachModel && this.cockroachBody) {
      this.cockroachModel.position.copy(this.cockroachBody.position);
      this.cockroachModel.quaternion.copy(this.cockroachBody.quaternion);
      console.log('Synced cockroach model to physics body at position:', this.cockroachModel.position);
    } else if (this.cockroachBody && !this.cockroachModel && this.placeholder) {
      // Sync placeholder if model not loaded yet
      this.placeholder.position.copy(this.cockroachBody.position);
      this.placeholder.quaternion.copy(this.cockroachBody.quaternion);
      console.log('Synced placeholder to physics body at position:', this.placeholder.position);
    }
    
    // Update camera position to follow character
    this.updateCamera();
    console.log('Updated camera to follow character at position:', this.camera.position);
  }
  
  /**
   * Updates character movement based on player input and applies physics
   * 
   * @param {number} delta - Time elapsed since last frame in seconds
   */
  updateCharacterMovement(delta) {
    // Exit early if physics body isn't ready
    if (!this.cockroachBody) return;
    
    // Apply movement forces and update model position
    this.applyMovementForces();
    this.syncModelWithPhysics();
    this.updateAnimationState();
  }
  
  /**
   * Apply movement forces based on player input
   */
  applyMovementForces() {
    // Force and torque configuration
    const moveForceMagnitude = 5;     // Forward/backward force
    const rotationTorqueMagnitude = 0.5; // Turning force
    
    // --- Calculate forward/backward force ---
    let localForceZ = 0;
    if (this.keys.forward && !this.keys.backward) {
      localForceZ = -moveForceMagnitude; // Negative Z is forward in typical GLTF models
    } else if (this.keys.backward && !this.keys.forward) {
      localForceZ = moveForceMagnitude;  // Positive Z is backward
    }
    
    // --- Calculate turning torque ---
    let worldTorqueY = 0;
    if (this.keys.left && !this.keys.right) {
      worldTorqueY = rotationTorqueMagnitude;
    } else if (this.keys.right && !this.keys.left) {
      worldTorqueY = -rotationTorqueMagnitude;
    }
    
    // Apply forward/backward force if needed
    if (localForceZ !== 0) {
      // Convert local force to world space
      const localForce = new CANNON.Vec3(0, 0, localForceZ);
      const worldForce = new CANNON.Vec3();
      this.cockroachBody.vectorToWorldFrame(localForce, worldForce);
      
      // Apply the force at the center of mass
      this.cockroachBody.applyForce(worldForce, this.cockroachBody.position);
      
      if (DEBUG) console.log('Applied movement force:', worldForce);
    }
    
    // Apply turning torque if needed
    if (worldTorqueY !== 0) {
      const torque = new CANNON.Vec3(0, worldTorqueY, 0);
      this.cockroachBody.applyTorque(torque);
      
      if (DEBUG) console.log('Applied rotation torque:', worldTorqueY);
    }
  }
  
  /**
   * Synchronize the visual model with the physics body
   */
  syncModelWithPhysics() {
    // Skip if we don't have both a model and physics body
    if (!this.cockroachBody || !this.cockroachModel) return;
    
    // Get position and rotation from physics
    const { position, quaternion } = this.cockroachBody;
    
    // Update the visual model
    this.cockroachModel.position.set(position.x, position.y, position.z);
    this.cockroachModel.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }
  
  /**
   * Update animation based on current movement state
   */
  updateAnimationState() {
    // Skip if no animations available
    if (!this.animations || Object.keys(this.animations).length === 0) return;
    
    // Determine if the cockroach is moving
    const isTryingToMove = this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;
    const isActuallyMoving = this.cockroachBody && this.cockroachBody.velocity.lengthSquared() > 0.01;
    const isMoving = isTryingToMove || isActuallyMoving;
    
    // Play appropriate animation
    if (isMoving) {
      this.playAnimation('walk');
    } else {
      this.playAnimation('idle');
    }
  }
  
  /**
   * Play the specified animation with smooth transitions
   * @param {string} animationName - Name of animation to play ('idle', 'walk', etc.)
   */
  playAnimation(animationName) {
    // Convert to lowercase for case-insensitive comparison
    animationName = animationName.toLowerCase();
    
    // Get the target animation - try exact match first, then similar names
    let targetAnim = this.animations[animationName];
    
    // If exact animation not found, try similar ones (e.g., 'walk' might be 'Walking')
    if (!targetAnim) {
      const animKey = Object.keys(this.animations).find(key => 
        key.toLowerCase().includes(animationName));
      if (animKey) targetAnim = this.animations[animKey];
    }
    
    // If we found a target animation and it's not already running
    if (targetAnim && !targetAnim.isRunning()) {
      // Fade out all currently running animations
      Object.values(this.animations).forEach(anim => {
        if (anim && anim.isRunning()) {
          anim.fadeOut(0.2); // Smooth transition over 0.2 seconds
        }
      });
      
      // Start the new animation with fade-in
      targetAnim.reset().fadeIn(0.2).play();
    }
  }
  
  updateCamera() {
    if (this.debugMode) return; // Don't update camera in debug mode
    
    const model = this.isModelLoaded ? this.cockroachModel : this.placeholder;
    if (!model) return;
    
    // Calculate camera position based on model position and offset
    this.cameraTarget.copy(model.position);
    
    // Calculate camera position
    const offset = this.cameraOffset.clone();
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);
    
    const cameraPosition = model.position.clone().add(offset);
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(this.cameraTarget);
  }

  /**
   * Clean up resources and prevent memory leaks
   * Should be called when this game mode is no longer needed
   */
  dispose() {
    if (DEBUG) console.log('Disposing FreeWorldMode resources');
    
    // Remove event listeners using the same bound functions that were added
    window.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keyup', this._handleKeyUp);
    
    // Dispose of Three.js resources
    this.disposeMeshes();
    this.disposeMaterials();
    this.disposeTextures();
    
    // Cleanup animation mixer
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    
    // Stop debug controls
    this.disableDebugControls();
    
    // Remove physics body
    if (this.cockroachBody && this.physicsWorld) {
      this.physicsWorld.removeBody(this.cockroachBody);
    }
    
    // Clear references
    this.cockroachModel = null;
    this.cockroachBody = null;
    this.animations = {};
    this.objects = [];
    
    if (DEBUG) console.log('FreeWorldMode resources disposed');
  }
  
  /**
   * Dispose of all mesh geometries in the scene
   */
  disposeMeshes() {
    // Function to recursively dispose of geometries
    const disposeGeometry = (obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      
      if (obj.children) {
        obj.children.forEach(child => disposeGeometry(child));
      }
    };
    
    // Dispose of placeholder and model geometries
    if (this.placeholder) disposeGeometry(this.placeholder);
    if (this.cockroachModel) disposeGeometry(this.cockroachModel);
    
    // Dispose of other objects
    this.objects.forEach(obj => {
      disposeGeometry(obj);
      
      // Also remove from scene
      if (this.scene) {
        this.scene.remove(obj);
      }
    });
  }
  
  /**
   * Dispose of all materials in the scene
   */
  disposeMaterials() {
    // Function to recursively dispose of materials
    const disposeMaterial = (obj) => {
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
      
      if (obj.children) {
        obj.children.forEach(child => disposeMaterial(child));
      }
    };
    
    // Dispose of placeholder and model materials
    if (this.placeholder) disposeMaterial(this.placeholder);
    if (this.cockroachModel) disposeMaterial(this.cockroachModel);
    
    // Dispose of other objects
    this.objects.forEach(obj => disposeMaterial(obj));
  }
  
  /**
   * Dispose of all textures in the scene
   */
  disposeTextures() {
    // Function to recursively dispose of textures
    const disposeTexture = (obj) => {
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => {
            Object.values(material).forEach(value => {
              if (value && value.isTexture) value.dispose();
            });
          });
        } else {
          Object.values(obj.material).forEach(value => {
            if (value && value.isTexture) value.dispose();
          });
        }
      }
      
      if (obj.children) {
        obj.children.forEach(child => disposeTexture(child));
      }
    };
    
    // Dispose of placeholder and model textures
    if (this.placeholder) disposeTexture(this.placeholder);
    if (this.cockroachModel) disposeTexture(this.cockroachModel);
    
    // Dispose of other objects
    this.objects.forEach(obj => disposeTexture(obj));
  }
}

export default FreeWorldMode;
