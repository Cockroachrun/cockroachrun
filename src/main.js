import CONFIG from './config';
import { UIManager } from './core/UIManager';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run UI...');
  
  // Initialize UI Manager
  const ui = new UIManager();
  ui.init();
  
  // Add direct test button functionality
  initDirectTestButton();
  
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
 * Initialize the direct test button that bypasses all UI and goes straight to FreeWorldMode
 */
function initDirectTestButton() {
  const directButton = document.getElementById('direct-free-world-button');
  if (!directButton) {
    console.error('Direct test button not found!');
    return;
  }
  
  directButton.addEventListener('click', () => {
    console.log('TEST BUTTON CLICKED: Launching FreeWorldMode directly...');
    
    // Hide all UI elements
    document.querySelectorAll('.screen, #ui-container').forEach(el => {
      el.style.display = 'none';
    });
    
    // Make canvas fully visible
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '1000';
    }
    
    // Make the container visible
    const container = document.getElementById('game-container');
    if (container) {
      container.style.display = 'block';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.zIndex = '999';
      container.style.border = '3px solid #00FF66';
    }
    
    // Import and start the game with FreeWorldMode
    import('./core/Game.js').then(module => {
      const Game = module.Game || module.default;
      const game = new Game();
      
      // Set the UI container to block
      document.getElementById('ui-container').style.display = 'none';
      
      // Initialize the game
      game.init();
      
      // Force Free World mode
      game.activeGameMode = 'free-world';
      
      // Start the game directly
      game.startGame();
      
      console.log('FreeWorldMode started directly via test button');
    }).catch(err => {
      console.error('Failed to load Game module:', err);
    });
  });
  
  console.log('Direct test button initialized');
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
