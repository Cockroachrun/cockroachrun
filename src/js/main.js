import CONFIG from './config.js';
import { UIManager } from './core/UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run UI...');

  // Initialize UI Manager
  const ui = new UIManager();
  ui.init();

  // Simulate asset loading with progress updates
  simulateLoading(ui);

  // Register UI event handlers
  registerUIHandlers(ui);
});

/**
 * Simulate asset loading process
 */
function simulateLoading(ui) {
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += 1;
    ui.updateLoadingProgress(progress);

    if (progress >= 100) {
      clearInterval(loadingInterval);
      setTimeout(() => {
        ui.showScreen('start-screen');
      }, 500);
    }
  }, 50);

  // Cycle through loading messages
  let messageIndex = 0;
  setInterval(() => {
    if (progress >= 100) return;

    messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
    ui.updateLoadingMessage(CONFIG.UI.LOADING_MESSAGES[messageIndex]);
  }, 3000);
}

/**
 * Register UI event handlers
 */
function registerUIHandlers(ui) {
  ui.on('onPlay', () => console.log('Play button clicked'));
  ui.on('onModeSelect', (mode) => console.log(`Selected mode: ${mode}`));
  ui.on('onCharacterSelect', (character) => console.log(`Selected character: ${character}`));
  ui.on('onStartGame', () => console.log('Starting game...'));
  ui.on('onPause', () => console.log('Game paused'));
  ui.on('onResume', () => console.log('Game resumed'));
  ui.on('onRestart', () => console.log('Game restarted'));
  ui.on('onQuit', () => console.log('Game quit'));
  ui.on('onTryAgain', () => console.log('Trying again'));
  ui.on('onMainMenu', () => console.log('Returned to main menu'));
}
