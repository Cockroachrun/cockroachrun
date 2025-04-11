/**
 * UI Manager handles all UI interactions and transitions
 */
const UIManager = (function() {
    // Private variables
    let currentScreen = 'loading-screen';
    let selectedMode = null;
    let selectedCharacter = 'default';
    let isGameRunning = false;
    
    // Default settings
    const settings = {
        musicVolume: 80,
        sfxVolume: 100,
        musicTheme: 'default',
        quality: 'medium',
        showFps: false,
        uiScale: 100,
        controllerLayout: 'standard'
    };
    
    // Private methods
    function showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show requested screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            currentScreen = screenId;
        }
    }
    
    function setupEventListeners() {
        // Menu navigation
        document.querySelectorAll('[data-target]').forEach(element => {
            element.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                showScreen(target);
            });
        });
        
        // Mode selection
        document.querySelectorAll('.mode-item').forEach(mode => {
            mode.addEventListener('click', (e) => {
                selectedMode = e.currentTarget.getAttribute('data-mode');
                document.querySelectorAll('.mode-item').forEach(m => {
                    m.classList.remove('selected');
                });
                e.currentTarget.classList.add('selected');
                showScreen('character-select');
            });
        });
        
        // Character selection
        document.querySelectorAll('.character-item:not(.locked)').forEach(character => {
            character.addEventListener('click', (e) => {
                selectedCharacter = e.currentTarget.getAttribute('data-character');
                document.querySelectorAll('.character-item').forEach(c => {
                    c.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
        
        // Wallet connection
        document.querySelectorAll('.wallet-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                // TODO: Implement wallet connection
                console.log('Wallet connection requested');
            });
        });
        
        // Game actions
        document.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                
                switch(action) {
                    case 'start-game':
                        startGame();
                        break;
                    case 'resume':
                        resumeGame();
                        break;
                    case 'restart':
                        restartGame();
                        break;
                    case 'exit':
                        exitGame();
                        break;
                    case 'settings':
                        openSettingsFromGame();
                        break;
                }
            });
        });
        
        // Settings controls
        document.getElementById('music-volume').addEventListener('input', (e) => {
            settings.musicVolume = parseInt(e.target.value);
            document.querySelector('#music-volume + .volume-value').textContent = `${settings.musicVolume}%`;
            AudioManager.setMusicVolume(settings.musicVolume / 100);
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            settings.sfxVolume = parseInt(e.target.value);
            document.querySelector('#sfx-volume + .volume-value').textContent = `${settings.sfxVolume}%`;
            AudioManager.setSfxVolume(settings.sfxVolume / 100);
        });
        
        document.getElementById('music-selection').addEventListener('change', (e) => {
            settings.musicTheme = e.target.value;
            AudioManager.changeMusicTheme(settings.musicTheme);
        });
        
        document.getElementById('quality-selection').addEventListener('change', (e) => {
            settings.quality = e.target.value;
            GameManager.setQuality(settings.quality);
        });
        
        document.getElementById('show-fps').addEventListener('change', (e) => {
            settings.showFps = e.target.checked;
        });
        
        document.getElementById('ui-scale').addEventListener('input', (e) => {
            settings.uiScale = parseInt(e.target.value);
            document.querySelector('#ui-scale + .scale-value').textContent = `${settings.uiScale}%`;
            applyUIScale();
        });
        
        document.getElementById('controller-layout').addEventListener('change', (e) => {
            settings.controllerLayout = e.target.value;
        });
        
        // Save settings button
        document.querySelector('.save-btn').addEventListener('click', () => {
            saveSettings();
            showNotification('Settings saved successfully!');
            if (isGameRunning) {
                showScreen('game-ui');
                document.getElementById('pause-menu').classList.remove('hidden');
            } else {
                showScreen('main-menu');
            }
        });
    }
    
    function applyUIScale() {
        document.documentElement.style.setProperty('--ui-scale', `${settings.uiScale}%`);
    }
    
    function saveSettings() {
        localStorage.setItem('cockroach-run-settings', JSON.stringify(settings));
    }
    
    function loadSettings() {
        const savedSettings = localStorage.getItem('cockroach-run-settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            Object.assign(settings, parsedSettings);
            
            // Apply loaded settings to UI
            document.getElementById('music-volume').value = settings.musicVolume;
            document.querySelector('#music-volume + .volume-value').textContent = `${settings.musicVolume}%`;
            
            document.getElementById('sfx-volume').value = settings.sfxVolume;
            document.querySelector('#sfx-volume + .volume-value').textContent = `${settings.sfxVolume}%`;
            
            document.getElementById('music-selection').value = settings.musicTheme;
            document.getElementById('quality-selection').value = settings.quality;
            document.getElementById('show-fps').checked = settings.showFps;
            document.getElementById('ui-scale').value = settings.uiScale;
            document.querySelector('#ui-scale + .scale-value').textContent = `${settings.uiScale}%`;
            document.getElementById('controller-layout').value = settings.controllerLayout;
            
            applyUIScale();
        }
    }
    
    function startGame() {
        if (!selectedMode || !selectedCharacter) {
            showNotification('Please select a game mode and character');
            return;
        }
        
        isGameRunning = true;
        document.getElementById('game-ui').classList.add('active');
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Start the game
        GameManager.startGame(selectedMode, selectedCharacter, settings);
        AudioManager.playGameMusic(selectedMode);
    }
    
    function pauseGame() {
        if (!isGameRunning) return;
        
        GameManager.pauseGame();
        document.getElementById('pause-menu').classList.remove('hidden');
    }
    
    function resumeGame() {
        if (!isGameRunning) return;
        
        GameManager.resumeGame();
        document.getElementById('pause-menu').classList.add('hidden');
    }
    
    function restartGame() {
        if (!isGameRunning) return;
        
        GameManager.restartGame();
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
    }
    
    function exitGame() {
        if (!isGameRunning) return;
        
        isGameRunning = false;
        GameManager.stopGame();
        document.getElementById('game-ui').classList.remove('active');
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-over').classList.add('hidden');
        showScreen('main-menu');
        AudioManager.playMenuMusic();
    }
    
    function openSettingsFromGame() {
        document.getElementById('pause-menu').classList.add('hidden');
        showScreen('settings');
    }
    
    function showGameOver(score) {
        document.getElementById('score-display').textContent = `Score: ${score}`;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    function showNotification(message, duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, duration);
    }
    
    function updateLoadingProgress(progress) {
        // Always use LoadingManager for consistent loading screen handling
        if (typeof LoadingManager !== 'undefined' && LoadingManager.updateProgress) {
            LoadingManager.updateProgress(progress);
        }
    }
    
    // Public methods
    return {
        init: function() {
            setupEventListeners();
            loadSettings();
            
            // Set up keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isGameRunning) {
                    const pauseMenu = document.getElementById('pause-menu');
                    if (pauseMenu.classList.contains('hidden')) {
                        pauseGame();
                    } else {
                        resumeGame();
                    }
                }
            });
            
            console.log('UIManager initialized');
        },
        
        showScreen,
        updateLoadingProgress,
        showGameOver,
        pauseGame,
        resumeGame,
        
        // Expose these properties for other modules
        get isGameRunning() {
            return isGameRunning;
        },
        
        get settings() {
            return {...settings};
        },
        
        get selectedMode() {
            return selectedMode;
        },
        
        get selectedCharacter() {
            return selectedCharacter;
        }
    };
})();