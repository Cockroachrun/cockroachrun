import CONFIG from '../../config/index.js';

export class Player {
  constructor(game, type = 'DEFAULT_ROACH') {
    this.game = game;
    this.type = type;
    this.model = null;
    this.stats = CONFIG.CHARACTERS ? CONFIG.CHARACTERS[type] : {};
  }

  async init() {
    console.log(`Initializing player of type: ${this.type}`);

    // TODO: Load character model
    // this.model = await this.loadModel();

    // TODO: Set up character controls

    // TODO: Initialize abilities
  }

  async loadModel() {
    // TODO: Use AssetManager to load or clone character model
    console.log('Loading player model...');
  }

  update(delta) {
    // TODO: Update player movement, animations, abilities
  }

  dispose() {
    // TODO: Remove model from scene, clean up controls, etc.
    console.log('Disposing player...');
  }
}

export default Player;
