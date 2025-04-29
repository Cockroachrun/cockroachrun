/**
 * Cockroach Run - Game State Manager
 * A lightweight state management system that connects UI selections to gameplay.
 * 
 * This manager uses the Observer pattern to allow components to subscribe to state changes.
 * It's designed to work alongside the existing UIManager without breaking anything.
 */

export const GameStateManager = (function() {
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
        selectedCharacter: 'american', // Default to American cockroach
        
        // Gameplay stats
        playerStats: {
            health: 100,
            score: 0,
            distance: 0,
            coins: 0,
            powerups: []
        }
    };
    
    // Subscribers for state changes
    const _subscribers = {
        all: []
    };
    
    // Load from localStorage if available
    const _loadSavedState = function() {
        try {
            const savedState = localStorage.getItem('cockroachRunGameState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                
                // Only merge in settings and wallet, not gameplay state
                if (parsed.settings) {
                    _gameState.settings = {..._gameState.settings, ...parsed.settings};
                }
                
                if (parsed.wallet) {
                    _gameState.wallet = {..._gameState.wallet, ...parsed.wallet};
                }
                
                console.log('Loaded saved game state:', _gameState);
            }
        } catch (error) {
            console.error('Failed to load saved game state:', error);
        }
    };
    
    // Save state to localStorage
    const _saveState = function() {
        try {
            // Only save persistent state (settings, wallet)
            const stateToSave = {
                settings: _gameState.settings,
                wallet: _gameState.wallet
            };
            
            localStorage.setItem('cockroachRunGameState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    };
    
    // Notify subscribers of state changes
    const _notifySubscribers = function(property, newValue, oldValue) {
        // First notify property-specific subscribers
        if (_subscribers[property]) {
            for (const callback of _subscribers[property]) {
                try {
                    callback(newValue, oldValue, property);
                } catch (error) {
                    console.error(`Error in subscriber for ${property}:`, error);
                }
            }
        }
        
        // Then notify 'all' subscribers
        for (const callback of _subscribers.all) {
            try {
                callback(newValue, oldValue, property);
            } catch (error) {
                console.error(`Error in 'all' subscriber:`, error);
            }
        }
    };
    
    // Initialize by loading saved state
    _loadSavedState();
    
    // Public API
    return {
        /**
         * Initialize the state manager and connect to UIManager
         */
        init: function() {
            console.log('GameStateManager initialized');
            
            // Connect to UIManager if it exists in this context
            if (window.UIManager) {
                // Sync with UIManager state
                const uiManager = window.UIManager;
                
                // Subscribe to mode selection
                if (uiManager.onModeSelect) {
                    const originalHandler = uiManager.onModeSelect;
                    uiManager.onModeSelect = (mode) => {
                        this.setState('gameMode', mode);
                        if (originalHandler) originalHandler(mode);
                    };
                }
                
                // Subscribe to character selection
                if (uiManager.onCharacterSelect) {
                    const originalHandler = uiManager.onCharacterSelect;
                    uiManager.onCharacterSelect = (character) => {
                        this.setState('selectedCharacter', character);
                        if (originalHandler) originalHandler(character);
                    };
                }
                
                // Subscribe to settings changes
                document.addEventListener('DOMContentLoaded', () => {
                    // Music volume
                    const musicSlider = document.getElementById('music-slider');
                    if (musicSlider) {
                        musicSlider.addEventListener('change', (e) => {
                            this.setState('settings.musicVolume', parseInt(e.target.value));
                        });
                    }
                    
                    // SFX volume
                    const sfxSlider = document.getElementById('sfx-slider');
                    if (sfxSlider) {
                        sfxSlider.addEventListener('change', (e) => {
                            this.setState('settings.sfxVolume', parseInt(e.target.value));
                        });
                    }
                    
                    // Music track selection
                    const trackSelect = document.getElementById('music-track-select');
                    if (trackSelect) {
                        trackSelect.addEventListener('change', (e) => {
                            this.setState('settings.musicTrack', e.target.value);
                        });
                    }
                    
                    // Graphics quality
                    const qualitySelect = document.getElementById('graphics-quality-select');
                    if (qualitySelect) {
                        qualitySelect.addEventListener('change', (e) => {
                            this.setState('settings.quality', e.target.value);
                        });
                    }
                    
                    // FPS toggle
                    const fpsToggle = document.getElementById('fps-toggle');
                    if (fpsToggle) {
                        fpsToggle.addEventListener('change', (e) => {
                            this.setState('settings.showFps', e.target.checked);
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
        getState: function(property) {
            if (!property) return {..._gameState};
            
            // Handle dot notation
            const parts = property.split('.');
            let value = _gameState;
            
            for (const part of parts) {
                if (value === undefined || value === null) return undefined;
                value = value[part];
            }
            
            return value;
        },
        
        /**
         * Update a state property and notify subscribers
         * @param {string} property - Dot notation path to property (e.g., 'settings.musicVolume')
         * @param {any} value - New value for the property
         */
        setState: function(property, value) {
            if (!property) return;
            
            // Get old value for comparison and notifications
            const oldValue = this.getState(property);
            
            // Handle dot notation for nested properties
            const parts = property.split('.');
            const lastPart = parts.pop();
            let target = _gameState;
            
            // Navigate to the parent object
            for (const part of parts) {
                if (target[part] === undefined || target[part] === null) {
                    target[part] = {};
                }
                target = target[part];
            }
            
            // Set the value
            if (JSON.stringify(target[lastPart]) !== JSON.stringify(value)) {
                target[lastPart] = value;
                
                // Notify subscribers
                _notifySubscribers(property, value, oldValue);
                
                // Save persistent state
                if (property.startsWith('settings.') || property.startsWith('wallet.')) {
                    _saveState();
                }
                
                return true;
            }
            
            return false;
        },
        
        /**
         * Subscribe to changes in a state property
         * @param {string} property - Property to subscribe to (use 'all' for all changes)
         * @param {function} callback - Function to call when property changes
         * @returns {function} Unsubscribe function
         */
        subscribe: function(property, callback) {
            if (!_subscribers[property]) {
                _subscribers[property] = [];
            }
            
            _subscribers[property].push(callback);
            
            // Return unsubscribe function
            return function() {
                const index = _subscribers[property].indexOf(callback);
                if (index !== -1) {
                    _subscribers[property].splice(index, 1);
                }
            };
        },
        
        /**
         * Get a copy of the entire state object
         * @returns {Object} Current state
         */
        getAllState: function() {
            return {..._gameState};
        },
        
        /**
         * Reset the game state for a new game
         * @param {string} gameMode - Game mode to start
         * @param {string} characterId - Selected character ID
         */
        startNewGame: function(gameMode, characterId) {
            // Update game mode and character if provided
            if (gameMode) {
                this.setState('gameMode', gameMode);
            }
            
            if (characterId) {
                this.setState('selectedCharacter', characterId);
            }
            
            // Reset gameplay stats
            this.setState('playerStats', {
                health: 100,
                score: 0,
                distance: 0,
                coins: 0,
                powerups: []
            });
            
            // Set game state
            this.setState('isRunning', true);
            this.setState('isPaused', false);
            
            console.log('Starting new game:', {
                mode: this.getState('gameMode'),
                character: this.getState('selectedCharacter')
            });
            
            return true;
        }
    };
})();

// Initialize when DOM is loaded to ensure elements are available
document.addEventListener('DOMContentLoaded', function() {
    GameStateManager.init();
    console.log('GameStateManager initialized');
});

export default GameStateManager;
