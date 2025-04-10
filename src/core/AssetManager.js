import * as THREE from 'three';

export class AssetManager {
  constructor(game) {
    this.game = game;

    this.loaders = {
      textureLoader: new THREE.TextureLoader(),
      gltfLoader: null, // To be initialized if using GLTFLoader
      audioLoader: new THREE.AudioLoader()
    };

    this.assets = {
      models: {},
      textures: {},
      sounds: {}
    };
  }

  async loadAllAssets() {
    // TODO: Implement bulk asset loading logic
    // Example:
    // await Promise.all([
    //   this.loadTexture('roachTexture', 'assets/textures/roach.png'),
    //   this.loadModel('roachModel', 'assets/models/roach.glb'),
    //   this.loadSound('backgroundMusic', 'assets/sounds/music.mp3')
    // ]);
  }

  loadTexture(name, url) {
    return new Promise((resolve, reject) => {
      this.loaders.textureLoader.load(
        url,
        (texture) => {
          this.assets.textures[name] = texture;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  loadModel(name, url) {
    // TODO: Initialize GLTFLoader or other model loader
    // and implement model loading logic
  }

  loadSound(name, url) {
    return new Promise((resolve, reject) => {
      this.loaders.audioLoader.load(
        url,
        (buffer) => {
          this.assets.sounds[name] = buffer;
          resolve(buffer);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  getTexture(name) {
    return this.assets.textures[name];
  }

  getModel(name) {
    return this.assets.models[name];
  }

  getSound(name) {
    return this.assets.sounds[name];
  }
}

export default AssetManager;
