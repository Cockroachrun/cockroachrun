import * as THREE from 'three';
import { UIManager } from './UIManager.js';
import CONFIG from '../config/index.js';
import { AssetManager } from './AssetManager.js';

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
    this.activeGameMode = null;
    this.selectedCharacter = null;

    // Game objects collections
    this.objects = [];
    this.lights = [];

    // Managers
    this.ui = new UIManager(this);
    this.assets = new AssetManager(this);
  }

  init() {
    console.log(`Initializing Cockroach Run v${CONFIG.VERSION}`);

    // Initialize Three.js
    this.initThreeJS();

    // Initialize UI components
    this.ui.init();

    // Register UI event handlers
    this.registerUIEventHandlers();

    // Start asset loading
    this.loadAssets();

    // Start the game loop
    this.gameLoop();
  }

  initThreeJS() {
    this.canvas = document.getElementById('game-canvas');

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: CONFIG.GRAPHICS.ANTIALIAS,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(CONFIG.GRAPHICS.PIXEL_RATIO, 2));
    this.renderer.shadowMap.enabled = CONFIG.GRAPHICS.SHADOW_ENABLED;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121212);

    this.camera = new THREE.PerspectiveCamera(
      CONFIG.GRAPHICS.FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.GRAPHICS.NEAR_PLANE,
      CONFIG.GRAPHICS.FAR_PLANE
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.clock = new THREE.Clock();

    window.addEventListener('resize', this.handleResize.bind(this));

    this.setupBasicLighting();
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setupBasicLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }

  registerUIEventHandlers() {
    // TODO: Implement UI event handlers (start game, select character, etc.)
  }

  async loadAssets() {
    console.log('Loading assets...');
    try {
      await this.assets.loadAllAssets();
      console.log('Assets loaded successfully.');
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  }

  gameLoop() {
    requestAnimationFrame(() => this.gameLoop());

    const delta = this.clock.getDelta();

    // Update game objects
    this.update(delta);

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  update(delta) {
    // TODO: Update game objects, animations, physics, etc.
  }
}

export default Game;
