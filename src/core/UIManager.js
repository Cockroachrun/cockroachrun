import CONFIG from '../config';

export class UIManager {
  constructor(game) {
    this.game = game;
    
    // Screen references
    this.screens = {};
    
    // UI elements
    this.elements = {};
    
    // Current screen
    this.currentScreen = null;
    
    // Event callbacks
    this.callbacks = {
      onPlay: null,
      onModeSelect: null,
      onCharacterSelect: null,
      onStartGame: null,
      onPause: null,
      onResume: null,
      onRestart: null,
      onQuit: null,
      onTryAgain: null,
      onMainMenu: null
    };
  }
  
  init() {
    this.initScreens();
    this.initElements();
    this.setupEventListeners();
    
    // Show loading screen by default
    this.showScreen('loading-screen');
    
    return this;
  }
  
  initScreens() {
    this.screens = {
      'loading-screen': document.getElementById('loading-screen'),
      'start-screen': document.getElementById('start-screen'),
      'mode-selection-screen': document.getElementById('mode-selection-screen'),
      'character-selection-screen': document.getElementById('character-selection-screen'),
      'pause-screen': document.getElementById('pause-screen'),
      'game-over-screen': document.getElementById('game-over-screen')
    };
  }
  
  initElements() {
    this.elements = {
      'game-hud': document.getElementById('game-hud'),
      'progress-bar': document.querySelector('.progress-bar'),
      'progress-text': document.querySelector('.progress-text'),
      'flavor-text': document.querySelector('.flavor-text'),
      'score-value': document.getElementById('score-value'),
      'final-score': document.getElementById('final-score')
    };
  }
  
  setupEventListeners() {
    // Main menu buttons
    document.getElementById('play-button')?.addEventListener('click', () => {
      this.showScreen('mode-selection-screen');
      if (this.callbacks.onPlay) this.callbacks.onPlay();
    });
    
    // Mode selection
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        this.showScreen('character-selection-screen');
        if (this.callbacks.onModeSelect) this.callbacks.onModeSelect(mode);
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
        
        const character = card.getAttribute('data-character');
        if (this.callbacks.onCharacterSelect) this.callbacks.onCharacterSelect(character);
      });
    });
    
    // More event handlers...
  }
  
  showScreen(screenId) {
    // Hide all screens
    this.hideAllScreens();
    
    // Show the requested screen
    const screen = this.screens[screenId];
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;
    }
  }
  
  hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
  }
  
  showHUD() {
    if (this.elements['game-hud']) {
      this.elements['game-hud'].classList.remove('hidden');
      console.log('Game HUD shown');
    }
    
    // Important: Make sure game canvas is fully visible when gameplay starts
    const gameCanvas = document.getElementById('game-canvas');
    if (gameCanvas) {
      gameCanvas.style.display = 'block';
      gameCanvas.style.visibility = 'visible';
      gameCanvas.style.zIndex = '10';
      console.log('Game canvas display set to visible, z-index 10');
    } else {
      console.error('Game canvas element not found');
    }
    
    // Ensure any background elements don't overlap the canvas
    document.querySelectorAll('.bg-container').forEach(bg => {
      bg.style.zIndex = '1';
    });
  }
  
  hideHUD() {
    if (this.elements['game-hud']) {
      this.elements['game-hud'].classList.add('hidden');
    }
  }
  
  updateLoadingProgress(progress) {
    if (this.elements['progress-bar']) {
      this.elements['progress-bar'].style.width = `${progress}%`;
    }
    
    if (this.elements['progress-text']) {
      this.elements['progress-text'].textContent = `Loading... ${progress}%`;
    }
  }
  
  updateLoadingMessage(message) {
    if (this.elements['flavor-text']) {
      this.elements['flavor-text'].textContent = message;
    }
  }
  
  updateScore(score) {
    if (this.elements['score-value']) {
      this.elements['score-value'].textContent = score;
    }
  }
  
  showGameOver(score) {
    if (this.elements['final-score']) {
      this.elements['final-score'].textContent = score;
    }
    
    this.showScreen('game-over-screen');
  }
  
  on(event, callback) {
    if (this.callbacks[event] !== undefined) {
      this.callbacks[event] = callback;
    }
  }
  
  emit(event, data) {
    console.log('UIManager emitting event:', event, data);
    
    // Special case for startGame to ensure it's properly called
    if (event === 'startGame') {
      console.log('DIRECT START GAME EVENT TRIGGERED');
      // Force the canvas and container to be visible
      const gameContainer = document.getElementById('game-container');
      const gameCanvas = document.getElementById('game-canvas');
      
      if (gameContainer) {
        gameContainer.style.display = 'block';
        gameContainer.style.position = 'fixed';
        gameContainer.style.top = '0';
        gameContainer.style.left = '0';
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.zIndex = '100000';
        console.log('Game container forced visible');
      }
      
      if (gameCanvas) {
        gameCanvas.style.display = 'block';
        gameCanvas.style.width = '100%';
        gameCanvas.style.height = '100%';
        console.log('Game canvas forced visible');
      }
      
      // Make sure the callback is properly called
      if (this.callbacks.onStartGame) {
        console.log('Directly calling startGame callback');
        this.callbacks.onStartGame();
      } else {
        console.error('No startGame callback registered!');
      }
    } else if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }
}
