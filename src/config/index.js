export const CONFIG = {
  // Game Information
  VERSION: '0.1.0',
  DEBUG: {
    ENABLED: false,
    SHOW_FPS: false,
    SHOW_HITBOXES: false,
    BYPASS_LOADING: false,
    LOG_LEVEL: 'INFO'
  },

  // Graphics Settings
  GRAPHICS: {
    DEFAULT_QUALITY: 'MEDIUM',
    SHADOW_ENABLED: true,
    ANTIALIAS: true,
    MAX_FPS: 60,
    FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 1000,
    PIXEL_RATIO: window.devicePixelRatio || 1
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
      ENEMY_SPAWN_RATE: 30,
      MAX_ENEMIES: 5
    },
    COCKROACH_RUNNER: {
      INITIAL_SPEED: 5,
      SPEED_INCREMENT: 0.1,
      OBSTACLE_SPAWN_RATE: 2,
      COLLECTABLE_SPAWN_RATE: 5,
      DIFFICULTY_INCREASE_INTERVAL: 15
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
    SCREEN_TRANSITION_TIME: 0.5
  }
};

export default CONFIG;