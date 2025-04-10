/**
 * Cockroach Run - Configuration Settings
 * Central configuration for game settings, parameters, and feature flags
 */

const CONFIG = {
    // Game Information
    VERSION: '0.1.0',
    DEBUG: {
        ENABLED: false,
        SHOW_FPS: false,
        SHOW_HITBOXES: false,
        BYPASS_LOADING: false,
        LOG_LEVEL: 'INFO' // ERROR, WARN, INFO, DEBUG
    },
    
    // Game Settings
    GRAPHICS: {
        DEFAULT_QUALITY: 'MEDIUM', // LOW, MEDIUM, HIGH
        SHADOW_ENABLED: true,
        ANTIALIAS: true,
        MAX_FPS: 60,
        FOV: 75,
        NEAR_PLANE: 0.1,
        FAR_PLANE: 1000,
        PIXEL_RATIO: window.devicePixelRatio || 1
    },
    
    // Physics Settings
    PHYSICS: {
        GRAVITY: 9.8,
        TIME_STEP: 1/60
    },
    
    // Character Settings
    CHARACTERS: {
        DEFAULT_ROACH: {
            SPEED: 5,
            JUMP_FORCE: 7,
            ABILITY_COOLDOWN: 10,
            ABILITY_DURATION: 3
        },
        STEALTH_ROACH: {
            SPEED: 4,
            JUMP_FORCE: 5,
            ABILITY_COOLDOWN: 15,
            ABILITY_DURATION: 5
        },
        GLIDER_ROACH: {
            SPEED: 4.5,
            JUMP_FORCE: 10,
            ABILITY_COOLDOWN: 12,
            ABILITY_DURATION: 4
        }
    },
    
    // Game Modes
    GAME_MODES: {
        FREE_WORLD: {
            ENVIRONMENTS: ['KITCHEN', 'BATHROOM', 'SEWER', 'STREET'],
            MAX_COLLECTABLE_ITEMS: 50,
            ENEMY_SPAWN_RATE: 30, // seconds between spawns
            MAX_ENEMIES: 5
        },
        COCKROACH_RUNNER: {
            INITIAL_SPEED: 5,
            SPEED_INCREMENT: 0.1,
            OBSTACLE_SPAWN_RATE: 2, // seconds between spawns
            COLLECTABLE_SPAWN_RATE: 5, // seconds between spawns
            DIFFICULTY_INCREASE_INTERVAL: 15 // seconds
        }
    },
    
    // Asset Paths
    ASSETS: {
        MODELS: {
            BASE_PATH: 'assets/models/',
            CHARACTERS: {
                DEFAULT_ROACH: 'characters/default_roach.glb',
                STEALTH_ROACH: 'characters/stealth_roach.glb',
                GLIDER_ROACH: 'characters/glider_roach.glb'
            },
            ENVIRONMENTS: {
                KITCHEN: 'environments/kitchen.glb',
                BATHROOM: 'environments/bathroom.glb',
                SEWER: 'environments/sewer.glb',
                STREET: 'environments/street.glb'
            },
            COLLECTABLES: {
                FOOD: 'collectables/food.glb',
                EGG: 'collectables/egg.glb'
            }
        },
        TEXTURES: {
            BASE_PATH: 'assets/images/'
        },
        SOUNDS: {
            BASE_PATH: 'assets/sounds/',
            MUSIC: {
                MENU: 'music/menu_theme.mp3',
                KITCHEN: 'music/kitchen_theme.mp3',
                BATHROOM: 'music/bathroom_theme.mp3',
                SEWER: 'music/sewer_theme.mp3',
                STREET: 'music/street_theme.mp3'
            },
            SFX: {
                JUMP: 'sfx/jump.mp3',
                COLLECT: 'sfx/collect.mp3',
                ABILITY: 'sfx/ability.mp3',
                DAMAGE: 'sfx/damage.mp3',
                GAME_OVER: 'sfx/game_over.mp3',
                BUTTON_CLICK: 'sfx/button_click.mp3'
            }
        }
    },
    
    // UI Settings
    UI: {
        LOADING_MESSAGES: [
            'Polishing antennae...',
            'Triggering human disgust reactions...',
            'Calculating escape routes...',
            'Analyzing kitchen layouts...',
            'Optimizing scurrying algorithms...',
            'Synchronizing survival instincts...',
            'Calibrating night vision...',
            'Brewing fear responses...'
        ],
        SHOW_FPS_COUNTER: false,
        SCREEN_TRANSITION_TIME: 0.5
    },
    
    // Wallet Integration
    WALLET: {
        ENABLED: true,
        SUPPORTED_WALLETS: ['Xverse', 'Magic Eden'],
        REQUIRED_CONFIRMATIONS: 1
    },
    
    // Mobile-specific settings
    MOBILE: {
        IS_TOUCH_DEVICE: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        TILT_CONTROLS_ENABLED: false,
        TILT_SENSITIVITY: 1.5,
        AUTO_QUALITY_ADJUST: true
    },
    
    // Local Storage keys
    STORAGE: {
        SETTINGS: 'cockroach_run_settings',
        HIGH_SCORES: 'cockroach_run_scores',
        UNLOCKED_CHARACTERS: 'cockroach_run_characters',
        WALLET_DATA: 'cockroach_run_wallet'
    }
};

// Detect device capabilities and adjust settings
(function() {
    // Adjust quality based on device
    if (CONFIG.MOBILE.IS_TOUCH_DEVICE) {
        // Mobile devices default to lower quality
        if (CONFIG.MOBILE.AUTO_QUALITY_ADJUST) {
            CONFIG.GRAPHICS.DEFAULT_QUALITY = 'LOW';
            CONFIG.GRAPHICS.SHADOW_ENABLED = false;
        }
    }
    
    // Apply debug settings from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
        CONFIG.DEBUG.ENABLED = urlParams.get('debug') === 'true';
    }
    if (urlParams.has('fps')) {
        CONFIG.UI.SHOW_FPS_COUNTER = urlParams.get('fps') === 'true';
    }
    if (urlParams.has('bypass_loading')) {
        CONFIG.DEBUG.BYPASS_LOADING = urlParams.get('bypass_loading') === 'true';
    }
})(); 