import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getEngine } from './engine.js';

class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.audioLoader = new THREE.AudioLoader();
    this.loadingManager = new THREE.LoadingManager();
    
    this.assets = {
      textures: {},
      models: {},
      audio: {}
    };
    
    this.setupLoadingManager();
  }
  
  setupLoadingManager() {
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = Math.floor((loaded / total) * 100);
      if (this.onProgressCallback) {
        this.onProgressCallback(progress);
      }
    };
    
    this.loadingManager.onError = (url) => {
      console.error(`Error loading asset: ${url}`);
    };
  }
  
  async loadTexture(name, url) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.assets.textures[name] = texture;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${name}:`, error);
          reject(error);
        }
      );
    });
  }
  
  async loadModel(name, url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.assets.models[name] = gltf;
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`Error loading model ${name}:`, error);
          reject(error);
        }
      );
    });
  }
  
  async loadAudio(name, url) {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.assets.audio[name] = buffer;
          resolve(buffer);
        },
        undefined,
        (error) => {
          console.error(`Error loading audio ${name}:`, error);
          reject(error);
        }
      );
    });
  }
  
  getTexture(name) {
    return this.assets.textures[name];
  }
  
  getModel(name) {
    return this.assets.models[name];
  }
  
  getAudio(name) {
    return this.assets.audio[name];
  }
  
  async loadInitialAssets(progressCallback) {
    this.onProgressCallback = progressCallback;
    
    // Create lists of assets to load
    const texturesToLoad = [
      // { name: 'floorTexture', url: '/assets/textures/floor.jpg' },
      // Will add real assets later
    ];
    
    const modelsToLoad = [
      // { name: 'cockroach', url: '/assets/models/cockroach.glb' },
      // Will add real assets later
    ];
    
    const audioToLoad = [
      // { name: 'backgroundMusic', url: '/assets/audio/background.mp3' },
      // Will add real assets later
    ];
    
    // Create placeholder assets for development
    this.createPlaceholderAssets();
    
    const texturePromises = texturesToLoad.map(texture => 
      this.loadTexture(texture.name, texture.url)
    );
    
    const modelPromises = modelsToLoad.map(model => 
      this.loadModel(model.name, model.url)
    );
    
    const audioPromises = audioToLoad.map(audio => 
      this.loadAudio(audio.name, audio.url)
    );
    
    // Combine all promises
    const allPromises = [
      ...texturePromises,
      ...modelPromises,
      ...audioPromises
    ];
    
    // Wait for all assets to load
    try {
      await Promise.all(allPromises);
      console.log('All assets loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading assets:', error);
      return false;
    }
  }
  
  createPlaceholderAssets() {
    // Create a simple placeholder texture
    const placeholderTexture = new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    );
    this.assets.textures['placeholder'] = placeholderTexture;
    
    // Create a simple placeholder model (a box)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff66 });
    const mesh = new THREE.Mesh(geometry, material);
    this.assets.models['placeholder'] = { scene: mesh };
    
    console.log('Placeholder assets created');
  }
}

// Singleton pattern
let loaderInstance = null;

export const getAssetLoader = () => {
  if (!loaderInstance) {
    loaderInstance = new AssetLoader();
  }
  return loaderInstance;
};

export const loadAssets = async (progressCallback) => {
  const loader = getAssetLoader();
  return await loader.loadInitialAssets(progressCallback);
}; 