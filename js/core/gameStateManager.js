/**
 * Cockroach Run - Game State Manager
 * A lightweight state management system that connects UI selections to gameplay.
 * 
 * This manager uses the Observer pattern to allow components to subscribe to state changes.
 * It's designed to work alongside the existing UIManager without breaking anything.
 */

const GameStateManager = (function() {
    // Private variables
    let _gameState = {
        // Game state
        isRunning: false,
        isPaused: false,
        currentScreen: 'loading',
        
        // Wallet state
        wallet: {
            connected: false,
            address: null,
            hasOrdinal: false
        },
        
        // Game settings (with defaults matching current implementation)
        settings: {
            musicVolume: 80,
            sfxVolume: 100,
            musicTrack: 'checkpoint-chaser',
            quality: 'medium',
            showFps: false,
            controlScheme: 'keyboard',
        },
        
        // Selected gameplay options
        gameMode: null, // 'free-world' or 'cockroach-runner'
        selectedCharacter: {
            id: 'default-roach',
            name: 'AMERICAN COCKROACH',
            stats: {
                speed: 75,
                durability: 60,
                stealth: 80,
                climbing: 65,
                agility: 70,
                burrowing: 55
            }
        },
        
        // Gameplay stats
        playerStats: {
            health: 100,
            score: 0,
            collectedItems: 0
        },
        
        // Environment settings
        environment: {
            current: 'kitchen',
            loaded: false
        }
    };
    
    // Subscribers for state changes (Observer pattern)
    const _subscribers = {};
    
    // Load from localStorage if available
    function _loadSavedState() {
        try {
            const savedSettings = localStorage.getItem('cockroachRunSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Only update settings to maintain backward compatibility
                if (parsed.settings) {
                    _gameState.settings = {
                        ..._gameState.settings,
                        ...parsed.settings
                    };
                }
                console.log('Loaded saved settings:', _gameState.settings);
            }
        } catch (e) {
            console.error('Error loading saved state:', e);
        }
    }
    
    // Save state to localStorage
    function _saveState() {
        try {
            // Only save settings and persistent data
            const dataToSave = {
                settings: _gameState.settings
            };
            localStorage.setItem('cockroachRunSettings', JSON.stringify(dataToSave));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }
    
    // Notify subscribers of state changes
    function _notifySubscribers(property, newValue, oldValue) {
        if (_subscribers[property]) {
            _subscribers[property].forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (e) {
                    console.error(`Error in subscriber callback for ${property}:`, e);
                }
            });
        }
        
        // Also notify 'all' subscribers
        if (_subscribers['all']) {
            _subscribers['all'].forEach(callback => {
                try {
                    callback({ property, newValue, oldValue });
                } catch (e) {
                    console.error(`Error in 'all' subscriber callback:`, e);
                }
            });
        }
    }
    
    // Initialize by loading saved state
    _loadSavedState();
    
    // Public API
    return {
        /**
         * Initialize the state manager and connect to UIManager
         */
        init() {
            console.log('GameStateManager initialized');
            
            // Connect to WalletService if available
            if (window.WalletService) {
                // Add event listener to wallet button
                document.addEventListener('DOMContentLoaded', () => {
                    const connectBtn = document.getElementById('connect-wallet-button');
                    if (connectBtn) {
                        const originalClick = connectBtn.onclick;
                        connectBtn.onclick = async (e) => {
                            if (originalClick) originalClick.call(connectBtn, e);
                            
                            // After wallet connection attempt, sync state
                            setTimeout(() => {
                                if (WalletService.connected) {
                                    this.setState('wallet.connected', true);
                                    this.setState('wallet.address', WalletService.address);
                                    this.setState('wallet.hasOrdinal', WalletService.isFeatureUnlocked());
                                }
                            }, 500); // Give wallet time to connect
                        };
                    }
                    
                    // Initial sync with WalletService
                    if (WalletService.connected) {
                        this.setState('wallet.connected', WalletService.connected);
                        this.setState('wallet.address', WalletService.address);
                        this.setState('wallet.hasOrdinal', WalletService.isFeatureUnlocked());
                    }
                });
            }
            
            // Connect to UIManager if available
            if (window.UIManager) {
                // Sync with UIManager's current state
                if (UIManager.currentScreen) {
                    _gameState.currentScreen = UIManager.currentScreen;
                }
                if (UIManager.selectedMode) {
                    _gameState.gameMode = UIManager.selectedMode;
                }
                if (UIManager.selectedCharacter) {
                    _gameState.selectedCharacter.id = UIManager.selectedCharacter;
                }
                if (UIManager.isGameRunning !== undefined) {
                    _gameState.isRunning = UIManager.isGameRunning;
                }
                if (UIManager.settings) {
                    _gameState.settings = {
                        ..._gameState.settings,
                        ...UIManager.settings
                    };
                }
                
                // Listen for UIManager changes
                const originalShowScreen = UIManager.showScreen;
                UIManager.showScreen = function(screenName) {
                    originalShowScreen.call(UIManager, screenName);
                    GameStateManager.setState('currentScreen', screenName);
                };
                
                // Sync character selection
                document.addEventListener('DOMContentLoaded', () => {
                    const charSelectionScreen = document.getElementById('character-selection-screen');
                    if (charSelectionScreen) {
                        charSelectionScreen.addEventListener('click', (e) => {
                            // Wait for any character selection to complete
                            setTimeout(() => {
                                if (UIManager.selectedCharacter) {
                                    GameStateManager.setState('selectedCharacter.id', UIManager.selectedCharacter);
                                }
                            }, 100);
                        });
                    }
                });
            }
        },
        
        /**
         * Get the current state of a property
         * @param {string} property - Dot notation path to property (e.g., 'settings.musicVolume')
         * @returns {any} The current value of the property
         */
        getState(property) {
            if (!property) return { ..._gameState };
            
            // Handle dot notation
            const props = property.split('.');
            let value = _gameState;
            
            for (const prop of props) {
                if (value === undefined || value === null) return undefined;
                value = value[prop];
            }
            
            return value;
        },
        
        /**
         * Update a state property and notify subscribers
         * @param {string} property - Dot notation path to property (e.g., 'settings.musicVolume')
         * @param {any} value - New value for the property
         */
        setState(property, value) {
            if (!property) return;
            
            // Handle dot notation for nested properties
            const props = property.split('.');
            let target = _gameState;
            const oldValue = this.getState(property);
            
            // Navigate to the target object
            for (let i = 0; i < props.length - 1; i++) {
                if (target[props[i]] === undefined) {
                    target[props[i]] = {};
                }
                target = target[props[i]];
            }
            
            // Set the value
            const finalProp = props[props.length - 1];
            target[finalProp] = value;
            
            // Notify subscribers
            _notifySubscribers(property, value, oldValue);
            
            // Special case: if we modify settings, save them
            if (property.startsWith('settings')) {
                _saveState();
                
                // Also sync with UIManager if it exists
                if (window.UIManager && UIManager.settings) {
                    const settingName = property.split('.')[1];
                    if (settingName && UIManager.settings[settingName] !== undefined) {
                        UIManager.settings[settingName] = value;
                        if (typeof UIManager.saveSettings === 'function') {
                            UIManager.saveSettings();
                        }
                    }
                }
            }
            
            // Sync gameMode and selectedCharacter with UIManager
            if (property === 'gameMode' && window.UIManager) {
                UIManager.selectedMode = value;
            }
            if (property === 'selectedCharacter.id' && window.UIManager) {
                UIManager.selectedCharacter = value;
            }
        },
        
        /**
         * Subscribe to changes in a state property
         * @param {string} property - Property to subscribe to (use 'all' for all changes)
         * @param {function} callback - Function to call when property changes
         * @returns {function} Unsubscribe function
         */
        subscribe(property, callback) {
            if (!_subscribers[property]) {
                _subscribers[property] = [];
            }
            
            _subscribers[property].push(callback);
            
            // Return unsubscribe function
            return () => {
                _subscribers[property] = _subscribers[property].filter(cb => cb !== callback);
            };
        },
        
        /**
         * Get a copy of the entire state object
         * @returns {Object} Current state
         */
        getAllState() {
            return { ..._gameState };
        },
        
        /**
         * Reset the game state for a new game
         * @param {string} gameMode - Game mode to start
         * @param {string} characterId - Selected character ID
         */
        startNewGame(gameMode, characterId) {
            // Preserve settings but reset gameplay state
            const settings = { ..._gameState.settings };
            const wallet = { ..._gameState.wallet }; // Preserve wallet state
            
            // Update game state
            _gameState.isRunning = true;
            _gameState.isPaused = false;
            _gameState.gameMode = gameMode || _gameState.gameMode;
            _gameState.playerStats = {
                health: 100,
                score: 0,
                collectedItems: 0
            };
            
            // Check if premium features should be enabled based on wallet
            const hasUnlockedContent = _gameState.wallet.hasOrdinal;
            
            if (characterId) {
                _gameState.selectedCharacter.id = characterId;
            }
            
            // Notify subscribers
            _notifySubscribers('gameState', _gameState, null);
            
            // Sync with UIManager
            if (window.UIManager) {
                UIManager.selectedMode = _gameState.gameMode;
                UIManager.selectedCharacter = _gameState.selectedCharacter.id;
                UIManager.isGameRunning = true;
            }
            
            return _gameState;
        }
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the game state manager
    GameStateManager.init();
    
    console.log('GameStateManager ready');
});

// Make available globally
window.GameStateManager = GameStateManager;
