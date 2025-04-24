/**
// Function to add sound to buttons
function addSoundToAllButtons() {
  // Get all buttons and clickable elements
  const buttons = document.querySelectorAll('button, .mode-card, .carousel-arrow, .carousel-dot');
  
  buttons.forEach(button => {
    // Skip if already has click handler
    if (button.getAttribute('data-has-sound') === 'true') return;
    
    // Save original click handler
    const originalClick = button.onclick;
    
    // Add new click handler with sound
    button.onclick = function(e) {
      // Play sound
      if (window.AudioManager) {
        AudioManager.playButtonClick();
      }
      
      // Call original handler if it exists
      if (originalClick) originalClick.call(this, e);
    };
    
    // Mark as processed
    button.setAttribute('data-has-sound', 'true');
  });
}

// Call this function after the DOM is loaded and after any dynamic buttons are created
document.addEventListener('DOMContentLoaded', function() {
  // First pass for static buttons
  addSoundToAllButtons();
  
  // Second pass after any dynamic content is loaded
  setTimeout(addSoundToAllButtons, 1000);
});
 * Cockroach Run - UI Manager
 * Handles all user interface interactions and animations
 */

const UIManager = {
    // Screen elements
    screens: {
        loading: document.getElementById('loading-screen'),
        start: document.getElementById('start-screen'),
        modeSelection: document.getElementById('mode-selection-screen'),
        characterSelection: document.getElementById('character-selection-screen'),
        settings: document.getElementById('settings-screen'),
        credits: document.getElementById('credits-screen'),
        pause: document.getElementById('pause-screen'),
        gameOver: document.getElementById('game-over-screen')
    },
    
    currentScreen: 'loading',
    selectedMode: null,
    selectedCharacter: 'default-roach',
    isGameRunning: false,
    
    settings: {
        quality: 'medium',
        showFps: false
    },
    
    init() {
        this.addEventListeners();
        this.loadSettings();
        this.simulateLoading();
        console.log('UI Manager initialized');

        // Attempt to start current intended music on first user interaction
        const tryPlayCurrentMusic = () => {
            if (!AudioManager.menuMusic.paused || !AudioManager.gameMusic.paused) {
                window.removeEventListener('click', tryPlayCurrentMusic);
                return;
            }
            AudioManager.menuMusic.play().catch(() => {});
            window.removeEventListener('click', tryPlayCurrentMusic);
        };
        window.addEventListener('click', tryPlayCurrentMusic);
        // Attempt to start menu music on first user interaction
        const tryPlayMenuMusic = () => {
            AudioManager.menuMusic.play().catch(() => {});
            window.removeEventListener('click', tryPlayMenuMusic);
        };
        window.addEventListener('click', tryPlayMenuMusic);
    },
    
    addEventListeners() {
        // Add both click and touch events for better mobile support
        const playButton = document.getElementById('play-button');
        const handlePlayClick = () => {
            AudioManager.playButtonClick();
            this.showScreen('modeSelection');
        };
        
        playButton.addEventListener('click', handlePlayClick);
        playButton.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent default to avoid double firing
            handlePlayClick();
        });
        
        // Make sure the button is clickable
        playButton.style.position = 'relative';
        playButton.style.zIndex = '1000';
        playButton.style.pointerEvents = 'auto';
        // Settings button with touch support
        const settingsButton = document.getElementById('settings-button');
        const handleSettingsClick = () => {
            AudioManager.playButtonClick();
            this.showScreen('settings');
        };
        
        settingsButton.addEventListener('click', handleSettingsClick);
        settingsButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleSettingsClick();
        });
        
        // Make sure the button is clickable
        settingsButton.style.position = 'relative';
        settingsButton.style.zIndex = '1000';
        settingsButton.style.pointerEvents = 'auto';
        
        // Credits button with touch support
        const creditsButton = document.getElementById('credits-button');
        const handleCreditsClick = () => {
            AudioManager.playButtonClick();
            this.showScreen('credits');
        };
        
        creditsButton.addEventListener('click', handleCreditsClick);
        creditsButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCreditsClick();
        });
        
        // Make sure the button is clickable
        creditsButton.style.position = 'relative';
        creditsButton.style.zIndex = '1000';
        creditsButton.style.pointerEvents = 'auto';
        
        // Add direct event listeners to character selection buttons
        const addSoundToButton = (buttonId) => {
            const button = document.getElementById(buttonId);
            if (button) {
                const originalClick = button.onclick;
                button.onclick = (e) => {
                    AudioManager.playButtonClick();
                    if (originalClick) originalClick.call(button, e);
                };
            }
        };
        
        // Add sound to character selection buttons
        addSoundToButton('back-from-character');
        addSoundToButton('start-game-button');

        // Connect wallet button with touch support
        const connectWalletButton = document.getElementById('connect-wallet-button');
        const handleConnectWalletClick = () => {
            AudioManager.playButtonClick();
            console.log('Connect Wallet button clicked');
            alert('Game exit functionality would be implemented here.');
        };
        
        connectWalletButton.addEventListener('click', handleConnectWalletClick);
        connectWalletButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleConnectWalletClick();
        });
        
        // Make sure the button is clickable
        connectWalletButton.style.position = 'relative';
        connectWalletButton.style.zIndex = '1000';
        connectWalletButton.style.pointerEvents = 'auto';
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                AudioManager.playButtonClick();
                this.selectedMode = card.getAttribute('data-mode');
                this.showScreen('characterSelection');
            });
        });
        document.getElementById('back-from-mode').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('start');
        });
        document.querySelectorAll('.character-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                AudioManager.playButtonClick();
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCharacter = card.getAttribute('data-character');
            });
        });
        document.getElementById('start-game-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.startGame();
        });
        document.getElementById('back-from-character').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('modeSelection');
        });
        document.getElementById('save-settings').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.saveSettings();
            this.showScreen(this.isGameRunning ? 'pause' : 'start');
        });
        document.getElementById('back-from-settings').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen(this.isGameRunning ? 'pause' : 'start');
        });
        document.getElementById('fps-toggle').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.settings.showFps = !this.settings.showFps;
            document.getElementById('fps-toggle').classList.toggle('active', this.settings.showFps);
        });
        document.getElementById('quality-select').addEventListener('change', (e) => {
            AudioManager.playButtonClick();
            this.settings.quality = e.target.value;
        });
        document.getElementById('back-from-credits').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('start');
        });
        document.getElementById('pause-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.pauseGame();
        });
        document.getElementById('resume-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.resumeGame();
        });
        document.getElementById('restart-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.restartGame();
        });
        document.getElementById('quit-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.quitGame();
        });
        document.getElementById('try-again-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.restartGame();
        });
        document.getElementById('main-menu-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.quitGame();
        });
    },
    
    loadSettings() {
        const savedQuality = localStorage.getItem('graphicsQuality');
        const savedShowFps = localStorage.getItem('showFps');
        if (savedQuality) {
            this.settings.quality = savedQuality;
            document.querySelectorAll('.option-button').forEach(button => {
                button.classList.toggle('active', button.getAttribute('data-quality') === savedQuality);
            });
        }
        if (savedShowFps) {
            this.settings.showFps = savedShowFps === 'true';
            document.getElementById('fps-toggle').classList.toggle('active', this.settings.showFps);
        }
    },
    
    saveSettings() {
        localStorage.setItem('graphicsQuality', this.settings.quality);
        localStorage.setItem('showFps', this.settings.showFps);
        AudioManager.saveSettings();
        console.log('Settings saved');
    },
    
    simulateLoading() {
        let progress = 0;
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.getElementById('loading-percent');
        const interval = setInterval(() => {
            progress += 1;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = progress;
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.showScreen('start');
                    // Play menu music directly
                    AudioManager.menuMusic.play().catch(e => {
                        console.warn('Autoplay blocked:', e);
                        // Add a click handler to start music on first interaction
                        const startMusic = () => {
                            AudioManager.menuMusic.play();
                            document.removeEventListener('click', startMusic);
                        };
                        document.addEventListener('click', startMusic);
                    });
                }, 500);
            }
        }, 50);
    },
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
        console.log(`Showing screen: ${screenName}`);

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            let bgUrl = '';
            if (screenName === 'start') {
                bgUrl = "assets/images/backgrounds/kitchen_bg.png";
            } else if (screenName === 'characterSelection') {
                bgUrl = "assets/images/backgrounds/sewer_bg.png";
            } else if (screenName === 'modeSelection') {
                bgUrl = "assets/images/backgrounds/bathroom_bg.png";
            } else {
                bgUrl = "assets/images/backgrounds/sewer_bg.png";
            }

            gameContainer.style.background = `url('${bgUrl}') no-repeat center center`;
            gameContainer.style.backgroundSize = 'cover';

            console.log('DEBUG: Set background to:', bgUrl);
            console.log('DEBUG: Computed style background:', getComputedStyle(gameContainer).background);
        } else {
            console.warn('DEBUG: #game-container not found');
        }
    },
    
    startGame() {
        if (!this.selectedMode || !this.selectedCharacter) {
            console.error('Game cannot start without selecting mode and character');
            return;
        }
        console.log(`Starting game with mode: ${this.selectedMode}, character: ${this.selectedCharacter}`);
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('game-hud').classList.remove('hidden');
        AudioManager.playGameMusic();
        AudioManager.playScatterSound();
        this.isGameRunning = true;
        this.initializeGame();
    },
    
    initializeGame() {
        console.log('Game initialized (placeholder)');
        let score = 0;
        this.scoreInterval = setInterval(() => {
            score += 10;
            document.getElementById('score-value').textContent = score;
            const healthBar = document.getElementById('health-bar');
            const currentWidth = parseFloat(getComputedStyle(healthBar).width);
            const maxWidth = parseFloat(getComputedStyle(document.getElementById('health-container')).width);
            const percentage = (currentWidth / maxWidth) * 100;
            if (percentage > 0) {
                healthBar.style.width = `${percentage - 0.5}%`;
            } else {
                clearInterval(this.scoreInterval);
                this.gameOver(score);
            }
        }, 1000);
    },
    
    pauseGame() {
        if (!this.isGameRunning) return;
        console.log('Game paused');
        this.showScreen('pause');
        clearInterval(this.scoreInterval);
    },
    
    resumeGame() {
        console.log('Game resumed');
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.initializeGame();
    },
    
    restartGame() {
        console.log('Game restarted');
        document.getElementById('score-value').textContent = '0';
        document.getElementById('health-bar').style.width = '100%';
        this.startGame();
    },
    
    quitGame() {
        console.log('Game quit');
        clearInterval(this.scoreInterval);
        document.getElementById('game-hud').classList.add('hidden');
        this.showScreen('start');
        AudioManager.playMenuMusic();
        this.isGameRunning = false;
    },
    
    gameOver(finalScore) {
        console.log(`Game over. Final score: ${finalScore}`);
        document.getElementById('final-score').textContent = finalScore;
        const highScore = localStorage.getItem('highScore') || 0;
        if (finalScore > highScore) {
            localStorage.setItem('highScore', finalScore);
        }
        document.getElementById('high-score').textContent = Math.max(highScore, finalScore);
        this.showScreen('gameOver');
        this.isGameRunning = false;
    },
    
    initializeCustomDropdowns() {
        const dropdownWrappers = document.querySelectorAll('.custom-dropdown-wrapper');

        dropdownWrappers.forEach(wrapper => {
            const trigger = wrapper.querySelector('.custom-dropdown-trigger');
            const optionsList = wrapper.querySelector('.custom-options-list');
            const options = wrapper.querySelectorAll('.custom-option');
            const originalSelect = wrapper.querySelector('.original-select');
            const selectedOptionText = trigger.querySelector('.selected-option-text');

            // Set initial selected text
            if (originalSelect && selectedOptionText) {
                const selectedOption = originalSelect.options[originalSelect.selectedIndex];
                if (selectedOption) {
                    selectedOptionText.textContent = selectedOption.textContent;
                }
            }

            // Toggle dropdown visibility
            trigger.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click outside handler from closing immediately
                const isVisible = optionsList.classList.contains('visible');
                // Close all other dropdowns first
                document.querySelectorAll('.custom-options-list').forEach(list => {
                    if (list !== optionsList) {
                        list.classList.remove('visible');
                        list.setAttribute('hidden', '');
                        list.closest('.custom-dropdown-wrapper').querySelector('.custom-dropdown-trigger').setAttribute('aria-expanded', 'false');
                    }
                });
                // Toggle this dropdown
                if (isVisible) {
                    optionsList.classList.remove('visible');
                    optionsList.setAttribute('hidden', '');
                } else {
                    optionsList.classList.add('visible');
                    optionsList.removeAttribute('hidden');
                }
                trigger.setAttribute('aria-expanded', !isVisible);
            });

            // Handle option selection
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.getAttribute('data-value');
                    selectedOptionText.textContent = option.textContent; // Update visible text
                    originalSelect.value = value; // Update hidden select value
                    optionsList.classList.remove('visible');
                    optionsList.setAttribute('hidden', '');
                    trigger.setAttribute('aria-expanded', 'false');
                    trigger.focus(); // Return focus to the trigger

                    // Trigger a 'change' event on the original select if needed by other code
                    const changeEvent = new Event('change', { bubbles: true });
                    originalSelect.dispatchEvent(changeEvent);

                    // Play sound if AudioManager exists
                    if (window.AudioManager) {
                         AudioManager.playButtonClick();
                     }
                });

                // Handle keyboard navigation (Enter key)
                option.addEventListener('keydown', (event) => {
                     if (event.key === 'Enter') {
                         option.click(); // Simulate a click
                     }
                 });
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.custom-options-list').forEach(list => {
                list.classList.remove('visible');
                list.setAttribute('hidden', '');
                list.closest('.custom-dropdown-wrapper').querySelector('.custom-dropdown-trigger').setAttribute('aria-expanded', 'false');
            });
        });

        console.log('Custom dropdowns initialized');
    },
};
