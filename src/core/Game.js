// src/core/Game.js
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CONFIG from '../config';
import { UIManager } from './UIManager';
import { FreeWorldMode } from '../game-modes/FreeWorldMode';
import { ZoomControls } from '../../js/zoom-controls.js';
import { InGameSettings } from '../../js/in-game-settings.js';

export class Game {
  constructor() {
    // Core game properties
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    this.physicsWorld = null; // Physics world from Cannon.js
    
    // Game state
    this.isRunning = false;
    this.currentScreen = 'loading-screen';
    this.activeGameMode = null;
    this.selectedCharacter = null;
    
    // Game objects collections
    this.objects = [];
    this.lights = [];
    this.physicsBodies = []; // Track physics bodies
    
    // Asset loading tracking
    this.assetsLoaded = false;
    this.loadingProgress = 0;
    
    // Managers
    this.ui = new UIManager(this);
    
    // Zoom controls will be initialized after camera is created
    this.zoomControls = null;
    
    // In-game settings will be initialized after startup
    this.inGameSettings = null;
    
    // Bind methods to maintain context
    this.gameLoop = this.gameLoop.bind(this);
  }
  
  init() {
    console.log('Game.init() started');
    console.log(`Initializing Cockroach Run v${CONFIG.VERSION}`);
    
    // Initialize Three.js
    this.initThreeJS();
    
    // Initialize UI
    this.ui.init();
    
    // Register UI event handlers
    this.registerUICallbacks();
    
    // Start asset loading (simulated for now)
    this.loadAssets();
    
    // Start the game loop
    this.gameLoop();
  }
  
  initThreeJS() {
    console.log('Initializing Three.js components...');
    
    // Create/find canvas
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      console.error('Game canvas not found! Creating one...');
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.appendChild(this.canvas);
      } else {
        document.body.appendChild(this.canvas);
      }
    }
    console.log('Canvas ready:', this.canvas.id);
    
    // Create renderer
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      console.log('WebGL renderer created successfully');
      
      // Test if WebGL is actually working
      const gl = this.renderer.getContext();
      if (!gl) {
        console.error('WebGL not available!');
      } else {
        console.log('WebGL context is available');
      }
    } catch (e) {
      console.error('Failed to create WebGL renderer:', e);
      // Fallback to simple renderer if WebGL fails
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        console.log('Created fallback renderer');
      } catch (fallbackError) {
        console.error('Could not create any renderer:', fallbackError);
      }
    }
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.COLORS.BACKGROUND);
    console.log('Scene created with background color:', CONFIG.COLORS.BACKGROUND);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    console.log('Camera created at position:', this.camera.position);
    
    // Add camera to scene
    this.scene.add(this.camera);
    
    // Initialize zoom controls
    this.zoomControls = new ZoomControls(this);
    console.log('Zoom controls initialized');
    
    // Make game instance accessible globally for the in-game settings
    window.game = this;
    
    // Check if we already have an in-game settings instance from the global script
    if (window.inGameSettingsInstance) {
      console.log('Using existing in-game settings instance');
      this.inGameSettings = window.inGameSettingsInstance;
      this.inGameSettings.game = this; // Update reference to game
    } else {
      // Initialize in-game settings 
      // This fallback uses the module version if available
      try {
        this.inGameSettings = new InGameSettings(this);
        console.log('In-game settings initialized');
      } catch (e) {
        console.warn('Error initializing in-game settings:', e);
      }
    }
    
    // Create clock for animation timing
    this.clock = new THREE.Clock();
    
    // Add resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Add basic lighting
    this.setupBasicLighting();
  }
  
  setupBasicLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Directional light (with shadows)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = CONFIG.GRAPHICS.SHADOW_ENABLED;
    
    // Configure shadow properties if enabled
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
  }
  
  initPhysicsWorld() {
    // Create a physics world with gravity
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0) // Standard Earth gravity
    });
    
    // Configure the solver iterations
    this.physicsWorld.solver.iterations = 10;
    
    // Set the default contact material properties
    this.physicsWorld.defaultContactMaterial.friction = 0.2;
    this.physicsWorld.defaultContactMaterial.restitution = 0.3; // Slight bounce
    
    // Create a ground plane material
    const groundMaterial = new CANNON.Material('ground');
    
    // Create character material (for the cockroach)
    const characterMaterial = new CANNON.Material('character');
    
    // Create contact between materials
    const groundCharacterContact = new CANNON.ContactMaterial(
      groundMaterial, 
      characterMaterial, 
      {
        friction: 0.5,          // Higher friction for crawling
        restitution: 0.0,       // No bounce
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
      }
    );
    
    // Add the contact material to the world
    this.physicsWorld.addContactMaterial(groundCharacterContact);
    
    // Store materials for easy access
    this.physicsWorld.materials = {
      ground: groundMaterial,
      character: characterMaterial
    };
    
    // Create a ground plane
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC, // Static body - doesn't move
      material: groundMaterial,
      shape: new CANNON.Plane()
    });
    
    // Rotate the ground plane to match Three.js coordinate system
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    
    // Add the ground body to the world
    this.physicsWorld.addBody(groundBody);
    this.physicsBodies.push(groundBody);
    
    console.log('Physics world initialized');
  }
  
  registerUICallbacks() {
    // Register callbacks for UI events
    this.ui.on('onPlay', () => {
      console.log('Play button clicked');
    });
    
    this.ui.on('onModeSelect', (mode) => {
      this.activeGameMode = mode;
      console.log(`Selected game mode: ${mode}`);
    });
    
    this.ui.on('onCharacterSelect', (character) => {
      this.selectedCharacter = character;
      console.log(`Selected character: ${character}`);
    });
    
    this.ui.on('onStartGame', () => {
      this.startGame();
    });
    
    this.ui.on('onPause', () => {
      this.pauseGame();
    });
    
    this.ui.on('onResume', () => {
      this.resumeGame();
    });
    
    this.ui.on('onRestart', () => {
      this.restartGame();
    });
    
    this.ui.on('onQuit', () => {
      this.quitGame();
    });
    
    this.ui.on('onTryAgain', () => {
      this.restartGame();
    });
    
    this.ui.on('onMainMenu', () => {
      this.quitGame();
    });
  }
  
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
          this.ui.showScreen('start');
        }, 500);
      }
    }, 50);
    
    // Cycle through loading messages
    let messageIndex = 0;
    setInterval(() => {
      if (progress >= 100) return;
      
      messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
      this.ui.updateLoadingMessage(CONFIG.UI.LOADING_MESSAGES[messageIndex]);
    }, 3000);
  }
  
  updateLoadingProgress(progress) {
    this.loadingProgress = progress;
    this.ui.updateLoadingProgress(progress);
  }
  
  startGame() {
    console.log("Starting game, activeGameMode:", this.activeGameMode);
    
    // CRITICAL: Really make sure all UI elements are hidden/removed
    this.ui.hideAllScreens();
    
    // Find and hide ALL potential UI screens manually as a backup
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
      screen.classList.remove('active');
    });
    
    // Hide any background images that might be covering the canvas
    document.querySelectorAll('.bg-container, .background').forEach(bg => {
      bg.style.display = 'none';
    });
    
    // Make sure canvas is visible and positioned correctly
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.zIndex = '1000'; // Ensure it's on top of EVERYTHING
      console.log('Game canvas explicitly made visible, z-index 1000');
    }
    
    // Show game HUD
    this.ui.showHUD();
    
    // Initialize the selected game mode
    // Force Free World Mode for testing if no mode is explicitly selected
    if (!this.activeGameMode || this.activeGameMode === 'free-world') {
      console.log("Initializing Free World Mode");
      this.initFreeWorldMode();
    } else if (this.activeGameMode === 'cockroach-runner') {
      console.log("Initializing Cockroach Runner Mode");
      this.initCockroachRunnerMode();
    }
    
    this.isRunning = true;
  }
  
  pauseGame() {
    // console.log('Game.pauseGame() called');
    if (this.isPaused) return;
    this.isPaused = true;
    
    // Optionally, pause any sounds or animations here
    // this.soundManager.pauseAll();
    // this.animationMixer.timeScale = 0;
  }
  
  resumeGame() {
    // console.log('Game.resumeGame() called');
    if (!this.isPaused) return;
    this.isPaused = false;
    
    // Optionally, resume sounds or animations
    // this.soundManager.resumeAll();
    // this.animationMixer.timeScale = 1;
  }
  
  restartGame() {
    // Clear current game objects
    this.clearScene();
    
    // Start game again
    this.startGame();
  }
  
  quitGame() {
    // Clear game objects
    this.clearScene();
    
    // Clean up zoom controls if they exist
    if (this.zoomControls) {
      this.zoomControls.destroy();
    }
    
    // Clean up in-game settings if they exist
    if (this.inGameSettings) {
      this.inGameSettings.destroy();
    }
    
    // Reset game state
    this.isRunning = false;
  }
  
  initFreeWorldMode() {
    console.log('CRITICAL DEBUG: Initializing Free World mode with canvas:', this.canvas ? 'found' : 'missing');
    
    // STEP 1: Ensure UI is completely out of the way
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
      uiContainer.style.display = 'none';
      console.log('UI container hidden');
    }
    
    // STEP 2: Set up game container
    let gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.style.display = 'block';
      gameContainer.style.position = 'fixed';
      gameContainer.style.top = '0';
      gameContainer.style.left = '0';
      gameContainer.style.width = '100vw';
      gameContainer.style.height = '100vh';
      gameContainer.style.zIndex = '1000';
      console.log('Game container set to full viewport');
    } else {
      console.error('Game container not found, creating one...');
      const newContainer = document.createElement('div');
      newContainer.id = 'game-container';
      newContainer.style.position = 'fixed';
      newContainer.style.top = '0';
      newContainer.style.left = '0';
      newContainer.style.width = '100vw';
      newContainer.style.height = '100vh';
      newContainer.style.zIndex = '1000';
      document.body.appendChild(newContainer);
      gameContainer = newContainer;
    }
    
    // STEP 3: Ensure canvas is properly set up
    if (!this.canvas) {
      console.error('Canvas not found, creating one...');
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      gameContainer.appendChild(this.canvas);
      
      // Reinitialize renderer with new canvas
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
    }
    
    // Make sure canvas is visible
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    // STEP 4: Add a visible ground and helpers
    // Clear previous objects first
    while(this.scene.children.length > 0){ 
      this.scene.remove(this.scene.children[0]); 
    }
    
    // Add camera back to scene
    this.scene.add(this.camera);
    
    // Create a visible ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);
    console.log('Added ground plane');
    
    // Grid helper - very visible in cyberpunk colors
    const gridHelper = new THREE.GridHelper(50, 50, 0x00FF66, 0x9333EA);
    this.scene.add(gridHelper);
    
    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    
    // STEP 5: Re-add basic lighting
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    this.scene.add(mainLight);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    this.scene.add(ambientLight);
    
    // Cyberpunk accent lights
    const greenLight = new THREE.PointLight(0x00FF66, 1, 15);
    greenLight.position.set(5, 3, 5);
    this.scene.add(greenLight);
    
    const purpleLight = new THREE.PointLight(0x9333EA, 1, 15);
    purpleLight.position.set(-5, 3, -5);
    this.scene.add(purpleLight);
    
    // STEP 6: Create placeholder cockroach while model loads
    this.createPlaceholderCharacter();
    
    // STEP 7: Initialize FreeWorldMode
    try {
      // Position camera for better view
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(0, 0, 0);
      
      // Create the Free World game mode
      this.freeWorldMode = new FreeWorldMode({
        scene: this.scene,
        camera: this.camera,
        renderer: this.renderer,
        clock: this.clock,
        physicsWorld: this.physicsWorld,
        canvas: this.canvas,
        selectedCharacter: this.selectedCharacter || 'american' // Default to American cockroach if none selected
      });
      
      console.log('FreeWorldMode instance created');
      
      // Initialize the mode
      this.freeWorldMode.init();
      console.log('FreeWorldMode initialized');
      
      // Force a render to make sure something appears
      this.renderer.render(this.scene, this.camera);
      console.log('Forced initial render');
      
      // Test if renderer is working
      const testCube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x00FF66 })
      );
      testCube.position.set(0, 1, 0);
      this.scene.add(testCube);
      this.renderer.render(this.scene, this.camera);
      console.log('Added and rendered test cube');
    } catch (e) {
      console.error('Error initializing Free World Mode:', e);
      
      // Emergency fallback - create a minimal scene with a moving cube
      this.createEmergencyFallbackScene();
    }
  }
  
  createEmergencyFallbackScene() {
    console.log('Creating emergency fallback scene...');
    
    // Clear scene and add basic elements
    while(this.scene.children.length > 0){ 
      this.scene.remove(this.scene.children[0]); 
    }
    
    // Add camera back
    this.scene.add(this.camera);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Add basic lighting
    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(1, 1, 1);
    this.scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    this.scene.add(ambientLight);
    
    // Add grid and ground
    const gridHelper = new THREE.GridHelper(10, 10, 0x00FF66, 0x9333EA);
    this.scene.add(gridHelper);
    // Create a simple animated cockroach (just a cube)
    const cockroachGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
    const cockroachMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
    this.emergencyCockroach = new THREE.Mesh(cockroachGeometry, cockroachMaterial);
    this.emergencyCockroach.position.set(0, 0.5, 0);
    this.scene.add(this.emergencyCockroach);
    
    // Add legs
    for (let i = 0; i < 3; i++) {
      const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      
      // Left leg
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(0.4, 0.25, 0.5 - (i * 0.5));
      leftLeg.rotation.z = Math.PI / 4;
      this.emergencyCockroach.add(leftLeg);
      
      // Right leg
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(-0.4, 0.25, 0.5 - (i * 0.5));
      rightLeg.rotation.z = -Math.PI / 4;
      this.emergencyCockroach.add(rightLeg);
    }
    
    // Setup keyboard controls for emergency cockroach
    this.setupEmergencyControls();
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
    console.log('Emergency fallback scene created');
  }
  
  setupEmergencyControls() {
    // Simple keyboard controls for emergency mode
    this.emergencyControls = {
      moveForward: false,
      moveBackward: false,
      turnLeft: false,
      turnRight: false
    };
    
    // Add event listeners
    window.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'w':
        case 'ArrowUp':
          this.emergencyControls.moveForward = true;
          break;
        case 's':
        case 'ArrowDown':
          this.emergencyControls.moveBackward = true;
          break;
        case 'a':
        case 'ArrowLeft':
          this.emergencyControls.turnLeft = true;
          break;
        case 'd':
        case 'ArrowRight':
          this.emergencyControls.turnRight = true;
          break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'w':
        case 'ArrowUp':
          this.emergencyControls.moveForward = false;
          break;
        case 's':
        case 'ArrowDown':
          this.emergencyControls.moveBackward = false;
          break;
        case 'a':
        case 'ArrowLeft':
          this.emergencyControls.turnLeft = false;
          break;
        case 'd':
        case 'ArrowRight':
          this.emergencyControls.turnRight = false;
          break;
      }
    });
    
    console.log('Emergency controls set up - Use WASD or arrow keys');
  }
  
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
  }
  
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
  }
  
  clearScene() {
    // Remove all objects except lights
    for (const object of this.objects) {
      this.scene.remove(object);
    }
    
    // Reset objects array
    this.objects = [];
  }
  
  gameLoop() {
    // Get delta time
    const delta = this.clock.getDelta();
    
    // Clamp delta to avoid large jumps in physics
    const fixedDelta = Math.min(delta, 0.1);
    
    // Step the physics world simulation
    if (this.physicsWorld) {
      this.physicsWorld.step(1/60, fixedDelta, 3);
    }
    
    // Update game state if running
    if (this.isRunning && this.activeGameMode) {
      this.activeGameMode.update(delta);
      
      // Log positions every 60 frames for debugging
      if (Math.floor(this.clock.elapsedTime * 60) % 60 === 0) {
        console.log('Game loop running, camera position:', this.camera.position);
        if (this.activeGameMode.cockroachModel) {
          console.log('Cockroach position:', this.activeGameMode.cockroachModel.position);
        }
      }
    }
    
    // Force render the scene
    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    } else {
      console.error('Missing required rendering components:', 
                   { scene: !!this.scene, camera: !!this.camera, renderer: !!this.renderer });
    }
    
    // Call next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
