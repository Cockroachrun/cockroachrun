// src/core/Game.js
import * as THREE from 'three';
import CONFIG from '../config';
import { UIManager } from './UIManager';

export class Game {
  constructor() {
    // Core game properties
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = null;
    
    // Game state
    this.isRunning = false;
    this.currentScreen = 'loading-screen';
    this.activeGameMode = null;
    this.selectedCharacter = null;
    
    // Game objects collections
    this.objects = [];
    this.lights = [];
    
    // Asset loading tracking
    this.assetsLoaded = false;
    this.loadingProgress = 0;
    
    // Managers
    this.ui = new UIManager(this);
    
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
    // Hide UI screens
    this.ui.hideAllScreens();
    
    // Show game HUD
    this.ui.showHUD();
    
    // Initialize the selected game mode
    if (this.activeGameMode === 'free-world') {
      this.initFreeWorldMode();
    } else if (this.activeGameMode === 'cockroach-runner') {
      this.initCockroachRunnerMode();
    }
    
    this.isRunning = true;
  }
  
  pauseGame() {
    this.isRunning = false;
  }
  
  resumeGame() {
    this.isRunning = true;
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
    
    // Reset game state
    this.isRunning = false;
  }
  
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
    requestAnimationFrame(this.gameLoop);
  }
}
