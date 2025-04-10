import CONFIG from '../config';

export class UIManager {
  constructor() {
    // Screen references
    this.screens = {
      loading: null,
      start: null,
      modeSelection: null,
      characterSelection: null,
      pause: null,
      gameOver: null
    };
    
    // UI elements
    this.elements = {
      gameHud: null,
      progressBar: null,
      progressText: null,
      flavorText: null,
      scoreValue: null,
      finalScore: null
    };
    
    // Current active screen
    this.currentScreen = null;
    
    // Callbacks for UI events
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
  
  /**
   * Initialize UI elements and event listeners
   */
  init() {
    this.initScreens();
    this.initElements();
    this.setupEventListeners();
    
    // Show loading screen by default
    this.showScreen('loading');
    
    return this;
  }
  
  /**
   * Initialize screen references
   */
  initScreens() {
    this.screens = {
      loading: document.getElementById('loading-screen'),
      start: document.getElementById('start-screen'),
      modeSelection: document.getElementById('mode-selection-screen'),
      characterSelection: document.getElementById('character-selection-screen'),
      pause: document.getElementById('pause-screen'),
      gameOver: document.getElementById('game-over-screen')
    };
  }
  
  /**
   * Initialize UI element references
   */
  initElements() {
    this.elements = {
      gameHud: document.getElementById('game-hud'),
      progressBar: document.querySelector('.progress-bar'),
      progressText: document.querySelector('.progress-text'),
      flavorText: document.querySelector('.flavor-text'),
      scoreValue: document.getElementById('score-value'),
      finalScore: document.getElementById('final-score')
    };
  }
  
  /**
   * Set up event listeners for UI elements
   */
  setupEventListeners() {
    // Main menu buttons
    document.getElementById('play-button')?.addEventListener('click', () => {
      this.showScreen('modeSelection');
      if (this.callbacks.onPlay) this.callbacks.onPlay();
    });
    
    // Mode selection
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        this.showScreen('characterSelection');
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
    
    // Start game button
    document.getElementById('start-game-button')?.addEventListener('click', () => {
      const selectedCard = document.querySelector('.character-card.selected');
      if (!selectedCard) {
        alert('Please select a character first');
        return;
      }
      
      this.hideAllScreens();
      this.showHUD();
      
      if (this.callbacks.onStartGame) this.callbacks.onStartGame();
    });
    
    // Back buttons
    document.getElementById('back-from-mode')?.addEventListener('click', () => {
      this.showScreen('start');
    });
    
    document.getElementById('back-from-character')?.addEventListener('click', () => {
      this.showScreen('modeSelection');
    });
    
    // Game control buttons
    document.getElementById('pause-button')?.addEventListener('click', () => {
      this.showScreen('pause');
      if (this.callbacks.onPause) this.callbacks.onPause();
    });
    
    document.getElementById('resume-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      if (this.callbacks.onResume) this.callbacks.onResume();
    });
    
    document.getElementById('restart-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });
    
    document.getElementById('quit-button')?.addEventListener('click', () => {
      this.showScreen('start');
      this.hideHUD();
      if (this.callbacks.onQuit) this.callbacks.onQuit();
    });
    
    document.getElementById('try-again-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      if (this.callbacks.onTryAgain) this.callbacks.onTryAgain();
    });
    
    document.getElementById('main-menu-button')?.addEventListener('click', () => {
      this.showScreen('start');
      this.hideHUD();
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });
  }
  
  /**
   * Show a specific screen and hide others
   */
  showScreen(screenName) {
    // Hide all screens
    this.hideAllScreens();
    
    // Show the requested screen
    const screen = this.screens[screenName];
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenName;
    }
  }
  
  /**
   * Hide all screens
   */
  hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
  }
  
  /**
   * Show game HUD
   */
  showHUD() {
    if (this.elements.gameHud) {
      this.elements.gameHud.classList.remove('hidden');
    }
  }
  
  /**
   * Hide game HUD
   */
  hideHUD() {
    if (this.elements.gameHud) {
      this.elements.gameHud.classList.add('hidden');
    }
  }
  
  /**
   * Update loading progress
   */
  updateLoadingProgress(progress) {
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${progress}%`;
    }
    
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `Loading... ${progress}%`;
    }
  }
  
  /**
   * Update loading message
   */
  updateLoadingMessage(message) {
    if (this.elements.flavorText) {
      this.elements.flavorText.textContent = message;
    }
  }
  
  /**
   * Update score display
   */
  updateScore(score) {
    if (this.elements.scoreValue) {
      this.elements.scoreValue.textContent = score;
    }
  }
  
  /**
   * Show game over screen with final score
   */
  showGameOver(score) {
    if (this.elements.finalScore) {
      this.elements.finalScore.textContent = score;
    }
    
    this.showScreen('gameOver');
  }
  
  /**
   * Register callback for UI events
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = callback;
    }
  }
}