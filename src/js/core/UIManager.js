import CONFIG from '../config.js';

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
      this.showScreen('start-screen');
    });

    document.getElementById('back-from-character')?.addEventListener('click', () => {
      this.showScreen('mode-selection-screen');
    });

    // Game control buttons
    document.getElementById('pause-button')?.addEventListener('click', () => {
      this.showScreen('pause-screen');
      if (this.callbacks.onPause) this.callbacks.onPause();
    });

    document.getElementById('resume-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      this.showHUD();
      if (this.callbacks.onResume) this.callbacks.onResume();
    });

    document.getElementById('restart-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      this.showHUD();
      if (this.callbacks.onRestart) this.callbacks.onRestart();
    });

    document.getElementById('quit-button')?.addEventListener('click', () => {
      this.showScreen('start-screen');
      this.hideHUD();
      if (this.callbacks.onQuit) this.callbacks.onQuit();
    });

    document.getElementById('try-again-button')?.addEventListener('click', () => {
      this.hideAllScreens();
      this.showHUD();
      if (this.callbacks.onTryAgain) this.callbacks.onTryAgain();
    });

    document.getElementById('main-menu-button')?.addEventListener('click', () => {
      this.showScreen('start-screen');
      this.hideHUD();
      if (this.callbacks.onMainMenu) this.callbacks.onMainMenu();
    });
  }

  showScreen(screenId) {
    this.hideAllScreens();

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
    }
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
}
