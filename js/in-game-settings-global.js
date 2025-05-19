/**
 * In-game settings menu handler for Cockroach Run
 * Displays a settings menu when ESC is pressed during gameplay
 * Allows players to change music tracks without leaving the game
 */

// Define the class in global scope
class InGameSettingsClass {
  constructor(game) {
    this.game = game;
    this.isVisible = false;
    this.settingsElement = null;
    
    // Bind methods to maintain 'this' context
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    
    // Initialize
    this.init();
  }
  
  init() {
    // console.log('Initializing in-game settings menu');
    
    // Create settings menu element if it doesn't exist
    if (!document.getElementById('in-game-settings')) {
      this.createSettingsMenu();
    } else {
      this.settingsElement = document.getElementById('in-game-settings');
    }
    
    // Add event listener for ESC key
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Setup event listeners for menu interaction
    this.setupEventListeners();
  }
  
  createSettingsMenu() {
    // Create the menu container
    this.settingsElement = document.createElement('div');
    this.settingsElement.id = 'in-game-settings';
    this.settingsElement.className = 'in-game-settings';
    this.settingsElement.style.display = 'none';
    
    // Create menu content
    this.settingsElement.innerHTML = `
      <div class="settings-container">
        <h2 class="settings-title">GAME SETTINGS</h2>
        <div class="settings-content">
          <div class="settings-section">
            <h3>AUDIO</h3>
            <div class="setting-item">
              <span>Music Track</span>
              <div class="custom-dropdown-wrapper" data-target-select="in-game-music-select">
                <select id="in-game-music-select" class="original-select">
                  <option value="checkpoint-chaser">Checkpoint Chaser</option>
                  <option value="cockroach-comeback">Cockroach Comeback</option>
                  <option value="cockroach-run">Cockroach Run</option>
                  <option value="dodge-weave-waltz">Dodge and Weave Waltz</option>
                  <option value="egg-checkpoint-blues">Egg Checkpoint Blues</option>
                  <option value="egg-layers-lament">Egg-Layer's Lament</option>
                  <option value="evolutions-edge">Evolution's Edge</option>
                  <option value="futuristic-flee">Futuristic Flee</option>
                  <option value="gliders-getaway">Glider's Getaway</option>
                  <option value="human-threat-harmony">Human Threat Harmony</option>
                  <option value="neon-roach-runnin">Neon Roach Runnin</option>
                  <option value="night-cycle-nomad">Night Cycle Nomad</option>
                  <option value="obstacle-dodge-dance">Obstacle Dodge Dance</option>
                  <option value="roach-on-the-run">Roach on the Run</option>
                  <option value="run-roach-run">Run, Roach, Run!</option>
                  <option value="scurry-in-the-shadows">Scurry in the Shadows</option>
                  <option value="sewer-sirens-call">Sewer Siren's Call</option>
                  <option value="sewer-survivors-sound">Sewer Survivor's Sound</option>
                  <option value="skittering-skyline">Skittering Skyline</option>
                  <option value="urban-jungle-jive">Urban Jungle Jive</option>
                  <option value="urban-odyssey-overture">Urban Odyssey Overture</option>
                </select>
                <div class="custom-dropdown-trigger">
                  <span class="selected-option-text" id="in-game-selected-music-text">Checkpoint Chaser</span>
                </div>
                <ul class="custom-options-list" hidden>
                  <li class="custom-option" data-value="checkpoint-chaser">Checkpoint Chaser</li>
                  <li class="custom-option" data-value="cockroach-comeback">Cockroach Comeback</li>
                  <li class="custom-option" data-value="cockroach-run">Cockroach Run</li>
                  <li class="custom-option" data-value="dodge-weave-waltz">Dodge and Weave Waltz</li>
                  <li class="custom-option" data-value="egg-checkpoint-blues">Egg Checkpoint Blues</li>
                  <li class="custom-option" data-value="egg-layers-lament">Egg-Layer's Lament</li>
                  <li class="custom-option" data-value="evolutions-edge">Evolution's Edge</li>
                  <li class="custom-option" data-value="futuristic-flee">Futuristic Flee</li>
                  <li class="custom-option" data-value="gliders-getaway">Glider's Getaway</li>
                  <li class="custom-option" data-value="human-threat-harmony">Human Threat Harmony</li>
                  <li class="custom-option" data-value="neon-roach-runnin">Neon Roach Runnin</li>
                  <li class="custom-option" data-value="night-cycle-nomad">Night Cycle Nomad</li>
                  <li class="custom-option" data-value="obstacle-dodge-dance">Obstacle Dodge Dance</li>
                  <li class="custom-option" data-value="roach-on-the-run">Roach on the Run</li>
                  <li class="custom-option" data-value="run-roach-run">Run, Roach, Run!</li>
                  <li class="custom-option" data-value="scurry-in-the-shadows">Scurry in the Shadows</li>
                  <li class="custom-option" data-value="sewer-sirens-call">Sewer Siren's Call</li>
                  <li class="custom-option" data-value="sewer-survivors-sound">Sewer Survivor's Sound</li>
                  <li class="custom-option" data-value="skittering-skyline">Skittering Skyline</li>
                  <li class="custom-option" data-value="urban-jungle-jive">Urban Jungle Jive</li>
                  <li class="custom-option" data-value="urban-odyssey-overture">Urban Odyssey Overture</li>
                </ul>
              </div>
            </div>
            <div class="playback-mode-section">
              <span>Playback Mode</span>
              <div class="playback-controls">
                <button id="in-game-single-mode-btn" class="mode-button active" title="Play single track on repeat">
                  <i class="fas fa-sync-alt"></i>
                </button>
                <button id="in-game-sequential-mode-btn" class="mode-button" title="Play tracks in sequence">
                  <i class="fas fa-list-ol"></i>
                </button>
                <button id="in-game-random-mode-btn" class="mode-button" title="Play tracks in random order">
                  <i class="fas fa-random"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="settings-footer">
          <button id="resume-game-btn" class="cyber-button">RESUME GAME</button>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.settingsElement);
  }
  
  setupEventListeners() {
    // Resume button click
    const resumeBtn = document.getElementById('resume-game-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', this.toggleMenu);
    }
    
    // Music select change
    const musicSelect = document.getElementById('in-game-music-select');
    if (musicSelect) {
      musicSelect.addEventListener('change', (e) => {
        if (window.AudioManager) {
          // console.log('In-game menu: Changing track to', e.target.value);
          window.AudioManager.changeTrack(e.target.value);
          
          // Update the main menu's music selection if it exists
          const mainMenuSelect = document.getElementById('music-select');
          if (mainMenuSelect) {
            mainMenuSelect.value = e.target.value;
            
            // Also update the main menu's dropdown display text
            const mainMenuSelectedText = document.getElementById('selected-music-text');
            if (mainMenuSelectedText) {
              const selectedOption = mainMenuSelect.options[mainMenuSelect.selectedIndex];
              if (selectedOption) {
                mainMenuSelectedText.textContent = selectedOption.textContent;
              }
            }
          }
        }
      });
    }
    
    // Playback mode buttons
    const modeButtonMap = {
      'in-game-single-mode-btn': 'single',
      'in-game-sequential-mode-btn': 'sequential',
      'in-game-random-mode-btn': 'random'
    };
    
    Object.entries(modeButtonMap).forEach(([id, mode]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          if (window.AudioManager) {
            window.AudioManager.setPlaybackMode(mode);
            this.updatePlaybackModeButtons(mode);
          }
        });
      }
    });
    
    // Setup custom dropdown functionality
    this.setupCustomDropdown();
  }
  
  setupCustomDropdown() {
    const dropdown = this.settingsElement.querySelector('.custom-dropdown-wrapper');
    if (!dropdown) return;
    
    const trigger = dropdown.querySelector('.custom-dropdown-trigger');
    const optionsList = dropdown.querySelector('.custom-options-list');
    const options = dropdown.querySelectorAll('.custom-option');
    const select = document.getElementById('in-game-music-select');
    const selectedText = document.getElementById('in-game-selected-music-text');
    
    // Get current track from audio manager
    if (window.AudioManager && window.AudioManager.currentTrackId) {
      select.value = window.AudioManager.currentTrackId;
      
      // Update the displayed text
      const selectedOption = select.options[select.selectedIndex];
      if (selectedOption && selectedText) {
        selectedText.textContent = selectedOption.textContent;
      }
    }
    
    // Toggle dropdown on trigger click
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isHidden = optionsList.hidden;
        optionsList.hidden = !isHidden;
        trigger.setAttribute('aria-expanded', !isHidden);
      });
    }
    
    // Handle option selection
    options.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        if (select) {
          select.value = value;
          
          // Trigger change event manually
          const event = new Event('change');
          select.dispatchEvent(event);
        }
        
        if (selectedText) {
          selectedText.textContent = option.textContent;
        }
        
        optionsList.hidden = true;
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && trigger) {
        optionsList.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  updatePlaybackModeButtons(mode) {
    const buttons = {
      single: document.getElementById('in-game-single-mode-btn'),
      sequential: document.getElementById('in-game-sequential-mode-btn'),
      random: document.getElementById('in-game-random-mode-btn')
    };
    
    // Remove active class from all buttons
    Object.values(buttons).forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    
    // Add active class to current mode button
    if (buttons[mode]) {
      buttons[mode].classList.add('active');
    }
  }
    handleKeyDown(event) {
    // Toggle menu when ESC key is pressed
    if (event.key === 'Escape') {
      // console.log('ESC key pressed, toggling menu. Current state:', this.isMenuOpen);
      event.preventDefault(); // Prevent default ESC behavior (e.g., exiting full screen)
      event.stopPropagation(); // Stop event from bubbling up
      this.toggleMenu();
    }
  }

  handleClickOutside(event) {
    // Close menu when clicking outside
    if (this.isVisible && this.settingsElement && 
        !this.settingsElement.querySelector('.settings-container').contains(event.target)) {
      this.toggleMenu();
    }
  }
    toggleMenu() {
    // console.log('toggleMenu called. Current state:', this.isMenuOpen, 'Game instance:', this.game);
    if (!this.settingsElement) {
      // console.error('Settings menu element not found in toggleMenu.');
      return;
    }
    
    this.settingsElement.style.display = this.isVisible ? 'none' : 'flex';
    // console.log('Settings menu', this.isVisible ? 'hidden' : 'shown');
    document.removeEventListener('click', this.handleClickOutside);
    
    if (this.isVisible) {
      // Show menu and pause game
      this.settingsElement.style.display = 'flex';
      document.addEventListener('click', this.handleClickOutside);
      
      // Update to show current audio settings
      this.updateSettingsDisplay();
      
      // Pause game if it's running
      if (this.game && typeof this.game.pauseGame === 'function') {
        try {
          this.game.pauseGame();
          // console.log('Game paused');
        } catch (err) {
          // console.warn('Error pausing game:', err);
        }
      } else {
        // console.log('Game instance not available or pauseGame method not found');
      }
    } else {
      // Hide menu and resume game
      this.settingsElement.style.display = 'none';
      // console.log('Settings menu hidden');
      try {
        if (this.game && typeof this.game.resumeGame === 'function') {
          this.game.resumeGame();
          // console.log('Game resumed');
        } else {
          // console.warn('Game instance or resumeGame method not available.');
        }
      } catch (error) {
        // console.error('Error resuming game:', error);
      }
    }
    this.isVisible = !this.isVisible;
    // console.log('Menu state after toggle:', this.isMenuOpen);
  }
  
  updateSettingsDisplay() {
    // Update music track selection
    if (window.AudioManager) {
      const musicSelect = document.getElementById('in-game-music-select');
      const selectedText = document.getElementById('in-game-selected-music-text');
      
      if (musicSelect && window.AudioManager.currentTrackId) {
        // Set the value to match the current track
        musicSelect.value = window.AudioManager.currentTrackId;
        
        if (selectedText) {
          const selectedOption = musicSelect.options[musicSelect.selectedIndex];
          if (selectedOption) {
            selectedText.textContent = selectedOption.textContent;
          }
        }
        
        // console.log('In-game menu: Updated track display to', window.AudioManager.currentTrackId);
      }
      
      // Update playback mode buttons
      this.updatePlaybackModeButtons(window.AudioManager.playbackMode);
      
      // Add a visual indication of what music is currently playing
      this.addNowPlayingIndicator();
    }
  }
    // Add a visual indication of the currently playing track
  addNowPlayingIndicator() {
    // First remove any existing indicators
    const existingIndicators = this.settingsElement.querySelectorAll('.now-playing-indicator');
    existingIndicators.forEach(el => el.remove());
    
    if (window.AudioManager && window.AudioManager.currentTrackId) {
      // Create the indicator
      const indicator = document.createElement('div');
      indicator.className = 'now-playing-indicator';
      indicator.innerHTML = '<i class="fas fa-play"></i> NOW PLAYING';
      indicator.style.cssText = `
        position: absolute;
        right: 10px;
        top: -18px;
        background-color: #ff6600;
        color: #000;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: bold;
      `;
      
      // Find the dropdown wrapper
      const dropdownWrapper = this.settingsElement.querySelector('.custom-dropdown-wrapper');
      if (dropdownWrapper) {
        // Position the indicator relative to the dropdown
        dropdownWrapper.style.position = 'relative';
        dropdownWrapper.appendChild(indicator);
      }
    }
  }
  
  // Clean up event listeners when no longer needed
  destroy() {
    // console.log('Cleaning up in-game settings');
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleClickOutside);
    
    if (this.settingsElement && this.settingsElement.parentNode) {
      this.settingsElement.parentNode.removeChild(this.settingsElement);
    }
    
    // console.log('InGameSettingsGlobal destroyed.');
    // Clear the global instance if this is the one
    if (window.inGameSettingsInstance === this) {
      window.inGameSettingsInstance = null;
      // console.log('window.inGameSettingsInstance cleared.');
    }
  }
}

// Make it globally available
window.InGameSettings = InGameSettingsClass;

// Create a global instance that can be used directly in the HTML
window.inGameSettingsInstance = null;

// Initialize after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // console.log('DOM loaded, initializing in-game settings');
  
  // Wait a short time to ensure game object is available
  setTimeout(() => {
    if (window.game) {
      window.inGameSettingsInstance = new InGameSettingsClass(window.game);
      // console.log('In-game settings initialized with game instance');
    } else {
      // console.warn('Game instance not found, creating placeholder settings');
      // Create settings anyway, will connect to game object later
      window.inGameSettingsInstance = new InGameSettingsClass({});
      
      // Attempt to find game instance later
      const checkGameInterval = setInterval(() => {
        if (window.game) {
          window.inGameSettingsInstance.game = window.game;
          // console.log('In-game settings connected to game instance');
          clearInterval(checkGameInterval);
        }
      }, 1000);
    }
  }, 500);
});
