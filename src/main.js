import './styles/index.css';
import { UIManager } from './core/UIManager';
import CONFIG from './config';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run...');
  
  // Initialize UI Manager
  const ui = new UIManager();
  ui.init();
  
  // Simulate asset loading with progress updates
  simulateLoading(ui);
  
  // Register UI events
  ui.on('onPlay', () => console.log('Play clicked'));
  ui.on('onModeSelect', (mode) => console.log(`Selected mode: ${mode}`));
  ui.on('onCharacterSelect', (character) => console.log(`Selected character: ${character}`));
  ui.on('onStartGame', () => console.log('Starting game...'));
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
        ui.showScreen('start');
      }, 500);
    }
  }, 50);
  
  // Cycle through loading messages
  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
    ui.updateLoadingMessage(CONFIG.UI.LOADING_MESSAGES[messageIndex]);
    
    if (progress >= 100) {
      clearInterval(messageInterval);
    }
  }, 3000);
}