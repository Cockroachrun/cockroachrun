// src/main.js
import './styles/index.css';
import CONFIG from './config';

// UI State
const UI = {
  currentScreen: 'loading-screen',
  selectedGameMode: null,
  selectedCharacter: null,
  
  init() {
    this.initScreens();
    this.initEventListeners();
    this.showScreen('loading-screen');
    this.simulateLoading();
  },
  
  initScreens() {
    // Initialize screens
    this.screens = {
      'loading-screen': document.getElementById('loading-screen'),
      'start-screen': document.getElementById('start-screen'),
      'mode-selection-screen': document.getElementById('mode-selection-screen'),
      'character-selection-screen': document.getElementById('character-selection-screen'),
      'pause-screen': document.getElementById('pause-screen'),
      'game-over-screen': document.getElementById('game-over-screen'),
      'game-hud': document.getElementById('game-hud')
    };
  },
  
  initEventListeners() {
    // Main menu buttons
    document.getElementById('play-button').addEventListener('click', () => {
      this.showScreen('mode-selection-screen');
    });
    
    document.getElementById('settings-button').addEventListener('click', () => {
      console.log('Settings button clicked (not implemented yet)');
    });
    
    document.getElementById('credits-button').addEventListener('click', () => {
      console.log('Credits button clicked (not implemented yet)');
    });
    
    document.getElementById('wallet-button').addEventListener('click', () => {
      console.log('Wallet button clicked (not implemented yet)');
    });
    
    // Mode selection
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        this.selectedGameMode = mode;
        console.log(`Selected game mode: ${mode}`);
        this.showScreen('character-selection-screen');
      });
    });
    
    // Character selection
    document.querySelectorAll('.character-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        document.querySelectorAll('.character-card').forEach(c => {
          c.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Store selected character
        this.selectedCharacter = card.getAttribute('data-character');
        console.log(`Selected character: ${this.selectedCharacter}`);
      });
    });
    
    // Start game button
    document.getElementById('start-game-button').addEventListener('click', () => {
      if (this.selectedCharacter) {
        console.log(`Starting game with mode: ${this.selectedGameMode} and character: ${this.selectedCharacter}`);
        this.hideAllScreens();
        this.screens['game-hud'].classList.remove('hidden');
      } else {
        alert('Please select a character first');
      }
    });
    
    // Back buttons
    document.getElementById('back-from-mode').addEventListener('click', () => {
      this.showScreen('start-screen');
    });
    
    document.getElementById('back-from-character').addEventListener('click', () => {
      this.showScreen('mode-selection-screen');
    });
    
    // Game control buttons
    document.getElementById('pause-button').addEventListener('click', () => {
      this.showScreen('pause-screen');
    });
    
    document.getElementById('resume-button').addEventListener('click', () => {
      this.hideAllScreens();
      this.screens['game-hud'].classList.remove('hidden');
    });
    
    document.getElementById('restart-button').addEventListener('click', () => {
      this.hideAllScreens();
      this.screens['game-hud'].classList.remove('hidden');
      console.log('Game restarted');
    });
    
    document.getElementById('quit-button').addEventListener('click', () => {
      this.showScreen('start-screen');
      this.screens['game-hud'].classList.add('hidden');
      console.log('Game quit');
    });
    
    document.getElementById('try-again-button').addEventListener('click', () => {
      this.hideAllScreens();
      this.screens['game-hud'].classList.remove('hidden');
      console.log('Game restarted');
    });
    
    document.getElementById('main-menu-button').addEventListener('click', () => {
      this.showScreen('start-screen');
      this.screens['game-hud'].classList.add('hidden');
      console.log('Returned to main menu');
    });
  },
  
  showScreen(screenId) {
    // Hide all screens
    this.hideAllScreens();
    
    // Show requested screen
    if (this.screens[screenId]) {
      this.screens[screenId].classList.add('active');
      this.currentScreen = screenId;
    }
  },
  
  hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
  },
  
  simulateLoading() {
    // Simulate asset loading
    let progress = 0;
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.loading-content div');
    
    const loadingInterval = setInterval(() => {
      progress += 1;
      
      // Update progress bar
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      // Update progress text
      if (progressText) {
        progressText.textContent = `Loading... ${progress}%`;
      }
      
      if (progress >= 100) {
        clearInterval(loadingInterval);
        
        // Proceed to start screen after loading completes
        setTimeout(() => {
          this.showScreen('start-screen');
        }, 500);
      }
    }, 50);
    
    // Cycle through loading messages
    let messageIndex = 0;
    const flavorText = document.querySelector('.flavor-text');
    
    setInterval(() => {
      if (progress >= 100) return;
      
      messageIndex = (messageIndex + 1) % CONFIG.UI.LOADING_MESSAGES.length;
      if (flavorText) {
        flavorText.textContent = CONFIG.UI.LOADING_MESSAGES[messageIndex];
      }
    }, 3000);
  },
  
  updateScore(score) {
    const scoreElement = document.getElementById('score-value');
    if (scoreElement) {
      scoreElement.textContent = score;
    }
  },
  
  showGameOver(score) {
    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = score;
    }
    
    this.showScreen('game-over-screen');
  }
};

// Initialize the UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Cockroach Run UI...');
  UI.init();
});
