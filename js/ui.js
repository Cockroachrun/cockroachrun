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
    }
};
