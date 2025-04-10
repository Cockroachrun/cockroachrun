// src/core/engine.js
import * as THREE from 'three';

class GameEngine {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.frameId = null;
    this.isRunning = false;
    this.gameObjects = [];
  }

  init() {
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 1, 5);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add renderer to DOM
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';
    gameContainer.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Add some basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    console.log('Game engine initialized');
    return this;
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.clock.start();
      this.animate();
      console.log('Game engine started');
    }
    return this;
  }
  
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.frameId) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
      console.log('Game engine stopped');
    }
    return this;
  }
  
  animate() {
    if (!this.isRunning) return;
    
    this.frameId = requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    
    // Update all game objects
    this.gameObjects.forEach(object => {
      if (object.update) {
        object.update(delta);
      }
    });
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  addObject(gameObject) {
    this.gameObjects.push(gameObject);
    if (gameObject.mesh) {
      this.scene.add(gameObject.mesh);
    }
    return this;
  }
  
  removeObject(gameObject) {
    const index = this.gameObjects.indexOf(gameObject);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
      if (gameObject.mesh) {
        this.scene.remove(gameObject.mesh);
      }
    }
    return this;
  }
  
  clearScene() {
    this.gameObjects = [];
    while(this.scene.children.length > 0) { 
      this.scene.remove(this.scene.children[0]); 
    }
    return this;
  }
}

// Singleton pattern
let engineInstance = null;

export const initEngine = async () => {
  if (!engineInstance) {
    engineInstance = new GameEngine();
    engineInstance.init();
  }
  return engineInstance;
};

export const getEngine = () => {
  if (!engineInstance) {
    throw new Error('Engine not initialized. Call initEngine() first.');
  }
  return engineInstance;
}; 