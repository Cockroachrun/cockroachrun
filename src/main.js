// src/main.js
import { initEngine } from './core/engine.js';
import { initUI } from './components/ui/ui-manager.js';
import { loadAssets } from './core/asset-loader.js';
import { initTestScene } from './game-modes/test-scene.js';

// Game initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Cockroach Run...');
  
  // Initialize the game engine
  const engine = await initEngine();
  
  // Initialize the UI
  const ui = await initUI();
  
  // Start with loading screen
  ui.showScreen('loading-screen');
  
  // Load game assets
  await loadAssets(progress => {
    ui.updateLoadingProgress(progress);
  });
  
  // Initialize test scene with cockroach
  const { cockroach } = initTestScene();
  
  // Show start screen when ready
  ui.showScreen('start-screen');
  
  // Add start game event listener
  ui.on('startGame', () => {
    engine.start();
  });
  
  console.log('Cockroach Run initialized successfully');
}); 