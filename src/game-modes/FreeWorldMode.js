import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameStateManager } from '../core/GameStateManager.js';

export class FreeWorldMode {
  constructor(game) {
    this.game = game;
    this.objects = [];
    this.clock = new THREE.Clock();
    this.cockroachModel = null;
    this.isModelLoaded = false;
    this.mixer = null;
    this.animations = {};
    
    // Movement properties
    this.moveSpeed = 2;
    this.rotationSpeed = 2;
    
    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };
    
    // Camera following
    this.cameraOffset = new THREE.Vector3(0, 2, 4);
    this.cameraTarget = new THREE.Vector3();
    
    // Debugging - can be removed in production
    this.debugMode = true;
  }

  init() {
    console.log('Initializing Free World mode');
    
    // Basic scene setup
    this.setupScene();
    
    // Create a simple environment
    this.createEnvironment();
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Load and create character based on the selected character in GameStateManager
    this.createCharacter();
    
    // Create camera controls for debugging
    if (this.debugMode) {
      this.setupDebugControls();
    }
    
    return this;
  }
  
  setupScene() {
    // Initialize or get reference to Three.js components
    this.scene = this.game.scene;
    this.camera = this.game.camera;
    this.renderer = this.game.renderer;
    
    // Set a skybox or background color
    this.scene.background = new THREE.Color(0x121212); // Dark background
    
    // Add lights
    this.addLights();
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
    const selectedCharacter = GameStateManager.getState('selectedCharacter') || 'american'; // Default to American cockroach
    
    // Determine which model to load based on selection
    const modelPath = selectedCharacter === 'american' ? 
      '/assets/models/American Cockroach.glb' : 
      '/assets/models/Oriental cockroach.glb';
    
    console.log(`Loading cockroach model: ${modelPath}`);
    
    // Create a placeholder while the model loads
    this.createPlaceholderCockroach();
    
    // Load the actual model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        console.log('Model loaded successfully:', gltf);
        
        // Remove placeholder when the real model is loaded
        if (this.placeholder) {
          this.scene.remove(this.placeholder);
          this.placeholder = null;
        }
        
        // Process the loaded model
        this.cockroachModel = gltf.scene;
        this.cockroachModel.traverse(node => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        // Scale, rotate, and position the model appropriately
        this.cockroachModel.scale.set(0.1, 0.1, 0.1);
        // Rotate so the ass faces the camera (head away from camera)
        this.cockroachModel.rotation.y = 0;
        this.cockroachModel.position.set(0, 0, 0);
        
        // Add to scene
        this.scene.add(this.cockroachModel);
        
        // Setup animations if any
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.cockroachModel);
          
          gltf.animations.forEach(clip => {
            const name = clip.name.toLowerCase();
            this.animations[name] = this.mixer.clipAction(clip);
            
            // Play idle animation by default
            if (name.includes('idle')) {
              this.animations[name].play();
            }
          });
        }
        
        this.isModelLoaded = true;
      },
      (xhr) => {
        // Loading progress
        console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }
  
  createPlaceholderCockroach() {
    // Create a simple placeholder using basic shapes
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.5, 4, 8);
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
    
    // Rotate the placeholder so its ass faces the camera (head away from camera)
    group.rotation.y = 0;
    this.placeholder = group;
    this.scene.add(this.placeholder);
  }
  
  setupInputHandlers() {
    // Keyboard event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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

  update(delta) {
    // If using the debug orbit controls
    if (this.debugMode && this.controls) {
      this.controls.update();
      return;
    }
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }
    
    // Update character movement
    this.updateCharacterMovement(delta);
    
    // Update camera position to follow character
    this.updateCamera();
  }
  
  updateCharacterMovement(delta) {
    // Only move if we have a model
    const model = this.isModelLoaded ? this.cockroachModel : this.placeholder;
    if (!model) return;
    
    const moveSpeed = this.moveSpeed * delta;
    const rotateSpeed = this.rotationSpeed * delta;
    
    // Handle rotation
    if (this.keys.left) {
      model.rotation.y += rotateSpeed;
    }
    if (this.keys.right) {
      model.rotation.y -= rotateSpeed;
    }
    
    // Handle forward/backward movement
    let directionZ = 0;
    if (this.keys.forward && !this.keys.backward) {
      directionZ = -1; // W moves ass first (away from camera)
    } else if (this.keys.backward && !this.keys.forward) {
      directionZ = 1; // S moves head first (toward camera)
    }
    if (directionZ !== 0) {
      const direction = new THREE.Vector3(0, 0, directionZ);
      // Rotate direction based on character rotation
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y);
      // Move character
      model.position.x += direction.x * moveSpeed;
      model.position.z += direction.z * moveSpeed;
      // Play walking animation if available
      if (this.animations && this.animations.walk && !this.animations.walk.isRunning()) {
        Object.values(this.animations).forEach(anim => anim.stop());
        this.animations.walk.play();
      }
    } else {
      // Play idle animation when not moving
      if (this.animations && this.animations.idle && !this.animations.idle.isRunning()) {
        Object.values(this.animations).forEach(anim => anim.stop());
        this.animations.idle.play();
      }
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

  dispose() {
    // Clean up resources and event listeners
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Dispose of any Three.js objects
    this.disableDebugControls();
    
    this.objects.forEach(obj => {
      this.scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    });
    
    // Clean up any animations/mixers
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    
    console.log('Free World mode disposed');
  }
}

export default FreeWorldMode;
