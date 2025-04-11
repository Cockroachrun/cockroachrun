/**
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
        showFps: false,
        // UI Customization settings
        deviceOptimization: 'desktop',
        menuButtonSpacing: 50,
        spritePosition: 50,
        menuWidth: 90,
        menuPadding: 50
    },
    
    init() {
        this.addEventListeners();
        this.loadSettings();
        this.updateUICustomizationVisibility();
        this.applyUICustomization();
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
        document.getElementById('play-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('modeSelection');
        });
        document.getElementById('settings-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('settings');
        });
        document.getElementById('credits-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            this.showScreen('credits');
        });

        document.getElementById('connect-wallet-button').addEventListener('click', () => {
            AudioManager.playButtonClick();
            console.log('Connect Wallet button clicked');
            alert('Game exit functionality would be implemented here.');
        });
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
        
        // UI Customization event listeners
        document.getElementById('device-select').addEventListener('change', (e) => {
            AudioManager.playButtonClick();
            this.settings.deviceOptimization = e.target.value;
            this.updateUICustomizationVisibility();
            this.applyDeviceOptimization(e.target.value);
        });
        
        document.getElementById('menu-button-spacing').addEventListener('input', (e) => {
            this.settings.menuButtonSpacing = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.applyUICustomization();
        });
        
        document.getElementById('sprite-position').addEventListener('input', (e) => {
            this.settings.spritePosition = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.applyUICustomization();
        });
        
        document.getElementById('menu-width').addEventListener('input', (e) => {
            this.settings.menuWidth = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.applyUICustomization();
        });
        
        document.getElementById('menu-padding').addEventListener('input', (e) => {
            this.settings.menuPadding = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            this.applyUICustomization();
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
        const savedDeviceOptimization = localStorage.getItem('deviceOptimization');
        const savedMenuButtonSpacing = localStorage.getItem('menuButtonSpacing');
        const savedSpritePosition = localStorage.getItem('spritePosition');
        const savedMenuWidth = localStorage.getItem('menuWidth');
        const savedMenuPadding = localStorage.getItem('menuPadding');
        
        if (savedQuality) {
            this.settings.quality = savedQuality;
            document.getElementById('quality-select').value = savedQuality;
        }
        
        if (savedShowFps) {
            this.settings.showFps = savedShowFps === 'true';
            document.getElementById('fps-toggle').classList.toggle('active', this.settings.showFps);
        }
        
        // Load UI customization settings
        if (savedDeviceOptimization) {
            this.settings.deviceOptimization = savedDeviceOptimization;
            document.getElementById('device-select').value = savedDeviceOptimization;
        }
        
        if (savedMenuButtonSpacing) {
            this.settings.menuButtonSpacing = parseInt(savedMenuButtonSpacing);
            document.getElementById('menu-button-spacing').value = savedMenuButtonSpacing;
            document.getElementById('menu-button-spacing').nextElementSibling.textContent = `${savedMenuButtonSpacing}%`;
        }
        
        if (savedSpritePosition) {
            this.settings.spritePosition = parseInt(savedSpritePosition);
            document.getElementById('sprite-position').value = savedSpritePosition;
            document.getElementById('sprite-position').nextElementSibling.textContent = `${savedSpritePosition}%`;
        }
        
        if (savedMenuWidth) {
            this.settings.menuWidth = parseInt(savedMenuWidth);
            document.getElementById('menu-width').value = savedMenuWidth;
            document.getElementById('menu-width').nextElementSibling.textContent = `${savedMenuWidth}%`;
        }
        
        if (savedMenuPadding) {
            this.settings.menuPadding = parseInt(savedMenuPadding);
            document.getElementById('menu-padding').value = savedMenuPadding;
            document.getElementById('menu-padding').nextElementSibling.textContent = `${savedMenuPadding}%`;
        }
        
        // Apply the loaded settings
        this.updateUICustomizationVisibility();
        this.applyUICustomization();
    },
    
    saveSettings() {
        localStorage.setItem('graphicsQuality', this.settings.quality);
        localStorage.setItem('showFps', this.settings.showFps);
        
        // Save UI customization settings
        localStorage.setItem('deviceOptimization', this.settings.deviceOptimization);
        localStorage.setItem('menuButtonSpacing', this.settings.menuButtonSpacing);
        localStorage.setItem('spritePosition', this.settings.spritePosition);
        localStorage.setItem('menuWidth', this.settings.menuWidth);
        localStorage.setItem('menuPadding', this.settings.menuPadding);
        
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
                    AudioManager.menuMusic.muted = false;
                    AudioManager.menuMusic.play().catch((e) => {
                        console.warn('Autoplay blocked:', e);
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
    
    // UI Customization Functions
    updateUICustomizationVisibility() {
        const customUISettings = document.querySelectorAll('.custom-ui-setting');
        const showCustomSettings = this.settings.deviceOptimization === 'custom';
        
        customUISettings.forEach(setting => {
            setting.classList.toggle('active', showCustomSettings);
        });
    },
    
    applyDeviceOptimization(device) {
        // Don't apply presets if custom is selected
        if (device === 'custom') {
            return;
        }
        
        // Auto-detect device based on screen size and touch capability
        if (device === 'auto') {
            // Check if device has touch capability (likely mobile or tablet)
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            // More sophisticated device detection
            if (window.innerWidth <= 480 || (hasTouch && window.innerWidth <= 600)) {
                device = 'mobile';
            } else if (window.innerWidth <= 768 || (hasTouch && window.innerWidth <= 1024)) {
                device = 'tablet';
            } else {
                device = 'desktop';
            }
            
            // Also consider orientation for better detection
            if (device === 'tablet' && window.innerHeight > window.innerWidth) {
                // Tablet in portrait mode might need mobile-like settings
                device = 'mobile';
            }
            
            console.log(`Auto-detected device: ${device}`);
        }
        
        // Apply preset values based on device type
        switch (device) {
            case 'mobile':
                this.settings.menuButtonSpacing = 45;  // Optimized spacing for mobile
                this.settings.spritePosition = 29;     // Closer to title on mobile
                this.settings.menuWidth = 95;          // Wider menu for mobile
                this.settings.menuPadding = 35;        // Less padding on mobile
                break;
            case 'tablet':
                this.settings.menuButtonSpacing = 48;  // Medium spacing for tablet
                this.settings.spritePosition = 35;     // Medium distance from title
                this.settings.menuWidth = 85;          // Slightly narrower for tablet
                this.settings.menuPadding = 45;        // Medium padding for tablet
                break;
            case 'desktop':
            default:
                this.settings.menuButtonSpacing = 52;  // More spacing for desktop
                this.settings.spritePosition = 40;     // Further from title on desktop
                this.settings.menuWidth = 75;          // Narrower menu on desktop (looks better)
                this.settings.menuPadding = 55;        // More padding on desktop
                break;
        }
        
        // Update slider values in the UI
        document.getElementById('menu-button-spacing').value = this.settings.menuButtonSpacing;
        document.getElementById('menu-button-spacing').nextElementSibling.textContent = `${this.settings.menuButtonSpacing}%`;
        
        document.getElementById('sprite-position').value = this.settings.spritePosition;
        document.getElementById('sprite-position').nextElementSibling.textContent = `${this.settings.spritePosition}%`;
        
        document.getElementById('menu-width').value = this.settings.menuWidth;
        document.getElementById('menu-width').nextElementSibling.textContent = `${this.settings.menuWidth}%`;
        
        document.getElementById('menu-padding').value = this.settings.menuPadding;
        document.getElementById('menu-padding').nextElementSibling.textContent = `${this.settings.menuPadding}%`;
        
        // Apply the settings
        this.applyUICustomization();
    },
    
    applyUICustomization() {
        // Get device type for responsive adjustments
        const isMobile = window.innerWidth <= 480;
        const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
        
        // Calculate actual values from percentages with device-specific ranges
        let buttonSpacing, spritePosition, menuPadding;
        
        if (isMobile) {
            // Mobile-specific ranges
            buttonSpacing = this.mapPercentToValue(this.settings.menuButtonSpacing, 0.3, 1.2);
            spritePosition = this.mapPercentToValue(this.settings.spritePosition, -150, -70);
            menuPadding = this.mapPercentToValue(this.settings.menuPadding, 0.5, 1.5);
        } else if (isTablet) {
            // Tablet-specific ranges
            buttonSpacing = this.mapPercentToValue(this.settings.menuButtonSpacing, 0.4, 1.5);
            spritePosition = this.mapPercentToValue(this.settings.spritePosition, -180, -60);
            menuPadding = this.mapPercentToValue(this.settings.menuPadding, 0.8, 2);
        } else {
            // Desktop-specific ranges
            buttonSpacing = this.mapPercentToValue(this.settings.menuButtonSpacing, 0.5, 2);
            spritePosition = this.mapPercentToValue(this.settings.spritePosition, -200, -50);
            menuPadding = this.mapPercentToValue(this.settings.menuPadding, 1, 3);
        }
        
        // Calculate menu width with better constraints
        const menuWidth = Math.max(60, Math.min(98, this.settings.menuWidth));
        
        // Apply to CSS variables with units
        document.documentElement.style.setProperty('--menu-buttons-margin-top', `${buttonSpacing}rem`);
        document.documentElement.style.setProperty('--sprite-container-margin-top', `${spritePosition}px`);
        document.documentElement.style.setProperty('--menu-container-width', `${menuWidth}%`);
        document.documentElement.style.setProperty('--menu-container-padding', `${menuPadding}rem`);
        
        // Additional refinements for better visual appearance
        const buttonGap = this.mapPercentToValue(this.settings.menuButtonSpacing, 0.2, 1);
        document.documentElement.style.setProperty('--button-gap', `${buttonGap}rem`);
        
        // Apply changes immediately
        console.log('UI customization applied');
    },
    
    // Helper function to map percentage to a value range
    mapPercentToValue(percent, min, max) {
        return min + (percent / 100) * (max - min);
    }
};
