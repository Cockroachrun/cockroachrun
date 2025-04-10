// src/main.js
import './styles/index.css';
import { UIManager } from './core/UIManager';
import CONFIG from './config';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run UI...');
  
  // Initialize UI Manager
  const ui = new UIManager();
  ui.init();
  
  // Simulate loading process
  simulateLoading(ui);
});

// Simulate asset loading process
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
  setInterval(() => {
    if (progress >= 100) return;
    
    messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
    ui.updateLoadingMessage(CONFIG.UI.LOADING_MESSAGES[messageIndex]);
  }, 3000);
}
