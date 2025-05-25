const AudioManager = {
  currentMusic: null,
  buttonClick: null,
  scatterSound: null,
  muteToggleElement: null, 
  
  // Direct audio elements
  menuMusic: null,
  gameMusic: null,
  
  musicTracks: {},
  currentTrackId: 'checkpoint-chaser',
  
  // New playback mode properties
  playbackMode: 'single', // 'single', 'sequential', 'random'
  
  musicVolume: 0.8,
  sfxVolume: 1.0,
  isMuted: false,
  
  // Map of track IDs to file names
  trackMap: {
    'checkpoint-chaser': 'Checkpoint Chaser .mp3',
    'cockroach-comeback': 'Cockroach Comeback .mp3',
    'cockroach-run': 'Cockroach run music.mp3',
    'dodge-weave-waltz': 'Dodge and Weave Waltz .mp3',
    'egg-checkpoint-blues': 'Egg Checkpoint Blues .mp3',
    'egg-layers-lament': 'Egg-Layer\'s Lament .mp3',
    'evolutions-edge': 'Evolution\'s Edge .mp3',
    'futuristic-flee': 'Futuristic Flee  .mp3',
    'gliders-getaway': 'Glider\'s Getaway  .mp3',
    'human-threat-harmony': 'Human Threat Harmony .mp3',
    'neon-roach-runnin': 'Neon Roach Runnin.mp3',
    'night-cycle-nomad': 'Night Cycle Nomad .mp3',
    'obstacle-dodge-dance': 'Obstacle Dodge Dance .mp3',
    'roach-on-the-run': 'Roach on the Run  .mp3',
    'run-roach-run': 'Run, Roach, Run!.mp3',
    'scurry-in-the-shadows': 'Scurry in the Shadows .mp3',
    'sewer-sirens-call': 'Sewer Siren\'s Call  .mp3',
    'sewer-survivors-sound': 'Sewer Survivor\'s Sound .mp3',
    'skittering-skyline': 'Skittering Skyline .mp3',
    'urban-jungle-jive': 'Urban Jungle Jive  .mp3',
    'urban-odyssey-overture': 'Urban Odyssey Overture  .mp3'
  },

  init() {
    this.buttonClick = document.getElementById('button-click');
    this.scatterSound = document.getElementById('scatter-sound');
    this.menuMusic = document.getElementById('menu-music');
    this.gameMusic = document.getElementById('game-music');
    this.muteToggleElement = document.getElementById('mute-toggle');
    
    if (!this.buttonClick || !this.scatterSound) {
        console.warn("AudioManager Warning: One or more audio elements not found!");
    }
    if (!this.menuMusic) {
        console.warn("AudioManager Warning: Menu music element not found!");
    }
    if (!this.gameMusic) {
        console.warn("AudioManager Warning: Game music element not found!");
    }
    if (!this.muteToggleElement) {
        console.warn("AudioManager Warning: Mute toggle button element not found!");
    }
    
    // Load saved menu and game track preferences
    const savedMenuTrack = localStorage.getItem('menuTrackId');
    if (savedMenuTrack && this.trackMap[savedMenuTrack]) {
        this.menuTrackId = savedMenuTrack;
        console.log(`Loaded saved menu track: ${savedMenuTrack}`);
    }
    
    const savedGameTrack = localStorage.getItem('gameTrackId');
    if (savedGameTrack && this.trackMap[savedGameTrack]) {
        this.gameTrackId = savedGameTrack;
        console.log(`Loaded saved game track: ${savedGameTrack}`);
    }
    
    // Default current track to menu track since we start in menu
    this.currentTrackId = this.menuTrackId;
    
    // Event listener for music track selection in main menu
    const musicSelect = document.getElementById('music-select');
    if (musicSelect) {
        musicSelect.addEventListener('change', (e) => {
            this.changeTrack(e.target.value);
        });
        
        // Initialize dropdown with saved menu track
        if (this.trackMap[this.menuTrackId]) {
            musicSelect.value = this.menuTrackId;
            
            // Update the custom dropdown text
            const selectedTextElement = document.getElementById('selected-music-text');
            if (selectedTextElement) {
                const selectedOption = musicSelect.options[musicSelect.selectedIndex];
                if (selectedOption) {
                    selectedTextElement.textContent = selectedOption.textContent;
                }
            }
        }
    }
    
    // Bind playback mode buttons programmatically to comply with CSP (remove inline handlers)
    const modeButtonMap = {
      'single-mode-btn': 'single',
      'sequential-mode-btn': 'sequential',
      'random-mode-btn': 'random'
    };
    Object.entries(modeButtonMap).forEach(([id, mode]) => {
      const btn = document.getElementById(id);
      if (btn) {
        // Remove potential inline handler that CSP would block
        btn.removeAttribute('onclick');
        // Attach safe listener
        btn.addEventListener('click', () => {
          this.setPlaybackMode(mode);
        });
      }
    });

    this.loadSettings();
    console.log('AudioManager initialized');
    
    // Make AudioManager globally accessible
    window.AudioManager = this;
  },

  loadSettings() {
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSfxVolume = localStorage.getItem('sfxVolume');

    if (savedMusicVolume !== null) {
      this.musicVolume = parseFloat(savedMusicVolume);
    } 

    if (savedSfxVolume !== null) {
      this.sfxVolume = parseFloat(savedSfxVolume);
    } 

    const savedMuteState = localStorage.getItem('isMuted');
    this.isMuted = savedMuteState ? JSON.parse(savedMuteState) : false;
    
    // Load saved track selection
    const savedTrack = localStorage.getItem('currentTrackId');
    if (savedTrack && this.trackMap[savedTrack]) {
      this.currentTrackId = savedTrack;
    }
    
    // Load saved playback mode settings
    const savedPlaybackMode = localStorage.getItem('playbackMode');
    if (savedPlaybackMode) {
      this.playbackMode = savedPlaybackMode;
    }

    this.applyVolumeSettings(); 
    this.applyMuteState();
    this.updatePlaybackModeIndicators();
  },

  applyVolumeSettings() {
      if (this.currentMusic) this.currentMusic.volume = this.musicVolume;
      if (this.buttonClick) this.buttonClick.volume = this.sfxVolume; 
      if (this.scatterSound) this.scatterSound.volume = this.sfxVolume;
      
      // Apply volume to direct audio elements
      if (this.menuMusic) this.menuMusic.volume = this.musicVolume;
      if (this.gameMusic) this.gameMusic.volume = this.musicVolume;
      
      // Update any track in the musicTracks collection
      Object.values(this.musicTracks).forEach(track => {
          if (track) track.volume = this.musicVolume;
      });

      const musicSlider = document.getElementById('music-volume');
      const sfxSlider = document.getElementById('sfx-volume');
      if(musicSlider) musicSlider.value = this.musicVolume * 100;
      if(sfxSlider) sfxSlider.value = this.sfxVolume * 100;
  },

  applyMuteState() {
    // Mute current music
    if (this.currentMusic) this.currentMusic.muted = this.isMuted;
    
    // Mute direct audio elements
    if (this.menuMusic) this.menuMusic.muted = this.isMuted;
    if (this.gameMusic) this.gameMusic.muted = this.isMuted;
    
    // Mute all tracks in the collection
    Object.values(this.musicTracks).forEach(track => {
        if (track) track.muted = this.isMuted;
    });
    
    if (this.muteToggleElement) {
      if (this.isMuted) {
        this.muteToggleElement.classList.add('active'); 
      } else {
        this.muteToggleElement.classList.remove('active');
      }
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applyMuteState();
    localStorage.setItem('isMuted', JSON.stringify(this.isMuted));
    console.log('Mute toggled:', this.isMuted);
  },

  saveSettings() {
    console.log("Saving settings (Volume/Mute saved on interaction now)");
  },

  // Get the path for a track ID
  getTrackPath(trackId) {
    const filename = this.trackMap[trackId];
    if (!filename) {
      console.error(`Track ID not found: ${trackId}`);
      return null;
    }
    
    // Log to debug the track selection
    console.log(`Getting path for track ID: ${trackId}, filename: ${filename}`);
    
    // Simplified and more robust path construction
    let audioPath;
    
    // Both the main menu and game iframe need to use the same path structure
    // The audio files are only located in assets/sounds/music/
    audioPath = `assets/sounds/music/${filename}`;
    console.log('Using path for audio:', audioPath);
    
    return audioPath;
  },
  
  // Create or get an audio element for a track
  getTrackAudio(trackId) {
    // If we already created this track, return it
    if (this.musicTracks[trackId]) {
      return this.musicTracks[trackId];
    }
    
    // Get the track path
    const trackPath = this.getTrackPath(trackId);
    if (!trackPath) return null;
    
    // Create a new audio element
    const audio = new Audio(trackPath);
    audio.loop = this.playbackMode === 'single'; 
    audio.volume = this.musicVolume;
    audio.muted = this.isMuted;
    
    // Add ended event listener for automatic track progression
    audio.addEventListener('ended', () => this.handleTrackEnded());
    
    // Store in our collection
    this.musicTracks[trackId] = audio;
    return audio;
  },
  
  // Handle track ended event - play next track based on mode
  handleTrackEnded() {
    if (this.playbackMode === 'single') {
      // Single track, loop is always on
    } else if (this.playbackMode === 'sequential') {
      // Play the next track in sequence
      this.playNextTrack();
    } else if (this.playbackMode === 'random') {
      // Play a random track
      this.playRandomTrack();
    }
  },
  
  // Play the next track in sequence
  playNextTrack() {
    const trackIds = Object.keys(this.trackMap);
    const currentIndex = trackIds.indexOf(this.currentTrackId);
    const nextIndex = (currentIndex + 1) % trackIds.length;
    this.changeTrack(trackIds[nextIndex]);
  },
  
  // Play a random track different from current
  playRandomTrack() {
    const trackIds = Object.keys(this.trackMap).filter(id => id !== this.currentTrackId);
    if (trackIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * trackIds.length);
      this.changeTrack(trackIds[randomIndex]);
    }
  },
  
  // Set playback mode (single, sequential, random)
  setPlaybackMode(mode) {
    if (['single', 'sequential', 'random'].includes(mode)) {
      this.playbackMode = mode;
      
      // Update loop setting for current track
      if (this.currentMusic) {
        this.currentMusic.loop = mode === 'single';
      }
      
      localStorage.setItem('playbackMode', mode);
      this.updatePlaybackModeIndicators();
      console.log(`Playback mode set to: ${mode}`);

      // Auto-resume music if not playing (gives instant feedback on button click)
      if (!this.currentMusic) {
        this.playCurrentTrack();
      } else if (this.currentMusic.paused) {
        this.currentMusic.play().catch(e => console.warn('Autoplay prevented:', e));
      }
    }
  },
  
  // Update UI to reflect current mode
  updatePlaybackModeIndicators() {
    // Update single mode button
    const singleModeBtn = document.getElementById('single-mode-btn');
    if (singleModeBtn) {
      singleModeBtn.classList.toggle('active', this.playbackMode === 'single');
    }
    
    // Update sequential mode button
    const sequentialModeBtn = document.getElementById('sequential-mode-btn');
    if (sequentialModeBtn) {
      sequentialModeBtn.classList.toggle('active', this.playbackMode === 'sequential');
    }
    
    // Update random mode button
    const randomModeBtn = document.getElementById('random-mode-btn');
    if (randomModeBtn) {
      randomModeBtn.classList.toggle('active', this.playbackMode === 'random');
    }
  },
  
  // Context flag to know if we're in the main menu or in-game
  // Default is main menu
  inGameContext: false,
  
  // Separate track selections for menu and game
  menuTrackId: 'cockroach-run',
  gameTrackId: 'neon-roach-runnin',
  
  // Set current context to main menu or game
  setContext(isGameContext) {
    const wasGameContext = this.inGameContext;
    this.inGameContext = isGameContext;
    
    // If context changed, update the audio playback
    if (wasGameContext !== isGameContext) {
      console.log(`Audio context changed to: ${isGameContext ? 'GAME' : 'MENU'}`);
      this.updateAudioContext();
    }
  },
  
  // Update audio playback based on current context
  updateAudioContext() {
    // Don't do anything if muted
    if (this.isMuted) return;
    
    if (this.inGameContext) {
      // We're in the game - completely stop menu music
      if (this.menuMusic) {
        console.log('Stopping menu music completely');
        this.menuMusic.pause();
        this.menuMusic.currentTime = 0;
      }
      
      // Update current track ID to game track
      this.currentTrackId = this.gameTrackId;
      
      // Start game music with game track - force it to play immediately
      this.playMusicInGameContext();
      
      // Double check that game music is actually playing
      if (this.gameMusic && this.gameMusic.paused && !this.isMuted) {
        console.log('Forcing game music to play with delay');
        // Sometimes there's a delay in audio context activation, so try again after a short delay
        setTimeout(() => {
          if (this.gameMusic && this.gameMusic.paused && !this.isMuted) {
            this.gameMusic.play().catch(e => console.warn('Delayed game music autoplay prevented:', e));
          }
        }, 1000);
      }
      
      // Update UI to show current game track
      this.updateMusicSelectionUI('in-game-music-select', 'in-game-selected-music-text', this.gameTrackId);
      
      // Show the correct now playing indicator
      this.updateNowPlayingIndicator(this.gameTrackId);
    } else {
      // We're in the menu - completely stop game music
      if (this.gameMusic) {
        console.log('Stopping game music completely');
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;
      }
      
      // Update current track ID to menu track
      this.currentTrackId = this.menuTrackId;
      
      // Start menu music with menu track
      this.playMusicInMenuContext();
      
      // Update UI to show current menu track
      this.updateMusicSelectionUI('music-select', 'selected-music-text', this.menuTrackId);
    }
  },
  
  // Update the now playing indicator
  updateNowPlayingIndicator(trackId) {
    const nowPlaying = document.getElementById('now-playing');
    const nowPlayingText = document.getElementById('now-playing-text');
    
    if (nowPlaying && nowPlayingText) {
      // Find track name from track ID
      const trackElement = document.querySelector(`.track-option[data-value="${trackId}"]`);
      if (trackElement) {
        nowPlayingText.textContent = trackElement.textContent;
        nowPlaying.style.display = 'block';
      }
    }
  },
    // Play music in menu context - enhanced with AutoplayHelper
  playMusicInMenuContext() {
    if (!this.menuMusic || this.isMuted) return;
    
    const trackPath = this.getTrackPath(this.menuTrackId);
    console.log(`Playing menu music: ${this.menuTrackId}`);
    
    // Only update if source is different
    if (this.menuMusic.src !== trackPath) {
      this.menuMusic.src = trackPath;
      this.menuMusic.loop = true;
    }
    
    // Play if not already playing using AutoplayHelper
    if (this.menuMusic.paused) {
      if (window.AutoplayHelper) {
        window.AutoplayHelper.requestMusicPlay(this.menuMusic, {
          gameContext: false,
          resetTime: true,
          trackName: this.trackMap[this.menuTrackId]
        }).then(() => {
          console.log('Menu music playing successfully via AutoplayHelper');
        }).catch(e => {
          console.log('AutoplayHelper: User interaction required for menu music');
          // The overlay will be shown automatically by AutoplayHelper
        });
      } else {
        // Fallback to original method
        this.menuMusic.currentTime = 0;
        this.menuMusic.play().catch(e => console.warn('Menu music autoplay prevented:', e));
      }
    }
  },
    // Play music in game context - enhanced with AutoplayHelper
  playMusicInGameContext() {
    // First stop any menu music if it's playing to prevent overlap
    if (this.menuMusic && !this.menuMusic.paused) {
      console.log('Stopping menu music before playing game music');
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }
    
    // Exit early if game music element isn't available
    if (!this.gameMusic) {
      console.error('Game music audio element not found');
      // Try to recreate it dynamically if it doesn't exist
      try {
        console.log('Attempting to create game music element dynamically');
        this.gameMusic = document.createElement('audio');
        this.gameMusic.id = 'game-music';
        this.gameMusic.loop = true;
        document.body.appendChild(this.gameMusic);
        console.log('Successfully created game music element');
      } catch (e) {
        console.error('Failed to create game music element:', e);
        return;
      }
    }
    
    // Get the track info
    const trackId = this.gameTrackId;
    if (!this.trackMap[trackId]) {
      console.error(`Track ID ${trackId} not found in trackMap`);
      console.log('Available tracks:', Object.keys(this.trackMap).join(', '));
      return;
    }
    
    const trackPath = this.getTrackPath(trackId);
    console.log(`Playing game music: ${trackId} (Muted: ${this.isMuted})`);
    console.log(`Track filename: ${this.trackMap[trackId]}`);
    console.log(`Full track path: ${trackPath}`);
    
    // Always update src to ensure correct track
    try {
      console.log(`Current src: ${this.gameMusic.src || 'none'}`);
      console.log(`Updating game music source to: ${trackPath}`);
      this.gameMusic.src = trackPath;
      this.gameMusic.loop = true;
      this.gameMusic.load(); // Explicitly load the audio
    } catch (e) {
      console.error('Error setting game music source:', e);
    }
    
    // If muted, make sure the game music is paused and exit
    if (this.isMuted) {
      if (!this.gameMusic.paused) {
        console.log('Game music is muted, pausing playback');
        this.gameMusic.pause();
      }
      return;
    }
    
    // If not muted and in game context, try to play the music using AutoplayHelper
    if (this.inGameContext) {
      // Only restart if paused
      if (this.gameMusic.paused) {
        console.log('Starting game music playback with AutoplayHelper');
        
        // Use AutoplayHelper for enhanced autoplay handling
        if (window.AutoplayHelper) {
          window.AutoplayHelper.requestMusicPlay(this.gameMusic, {
            gameContext: true,
            resetTime: true,
            trackName: this.trackMap[trackId]
          }).then(() => {
            console.log('Game music playing successfully via AutoplayHelper');
            this.updateNowPlayingIndicator(trackId);
          }).catch(e => {
            console.log('AutoplayHelper: User interaction required for game music');
            // The overlay will be shown automatically by AutoplayHelper
          });
        } else {
          // Fallback to original method if AutoplayHelper isn't available
          this.gameMusic.currentTime = 0;
          const playPromise = this.gameMusic.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Game music playing successfully (fallback)');
                this.updateNowPlayingIndicator(trackId);
              })
              .catch(e => {
                console.warn('Game music autoplay prevented (fallback):', e);
                
                // Try again after a short delay
                setTimeout(() => {
                  console.log('Retrying game music playback after delay');
                  this.gameMusic.play()
                    .catch(e2 => console.error('Second play attempt failed:', e2));
                }, 1000);
              });
          }
        }
      } else {
        console.log('Game music already playing');
      }
    } else {
      console.log('Not in game context, not playing game music');
    }
  },
  
  // Change to a different track - handles switching tracks in the proper context
  changeTrack(trackId) {
    if (!this.trackMap[trackId]) {
      console.error(`Invalid track ID: ${trackId}`);
      return;
    }
    
    // Store track selection in the appropriate context
    if (this.inGameContext) {
      // Change game track
      this.gameTrackId = trackId;
      localStorage.setItem('gameTrackId', trackId);
      console.log(`Game track changed to: ${trackId}`);
      
      // Update the in-game ESC menu's music selection dropdown
      this.updateMusicSelectionUI('in-game-music-select', 'in-game-selected-music-text', trackId);
      
      // Update now playing indicator
      this.updateNowPlayingIndicator(trackId);
      
      // Play the new game track
      this.playMusicInGameContext();
    } else {
      // Change menu track
      this.menuTrackId = trackId;
      localStorage.setItem('menuTrackId', trackId);
      console.log(`Menu track changed to: ${trackId}`);
      
      // Update the main menu's music selection dropdown
      this.updateMusicSelectionUI('music-select', 'selected-music-text', trackId);
      
      // Play the new menu track
      this.playMusicInMenuContext();
    }
    
    // Also update the overall current track ID for compatibility
    this.currentTrackId = trackId;
    
    // If in-game settings is open, update its now playing indicator
    if (window.inGameSettingsInstance && window.inGameSettingsInstance.isVisible) {
      setTimeout(() => {
        window.inGameSettingsInstance.addNowPlayingIndicator();
      }, 100);
    }
    
    // Dispatch custom event for track change to notify other UI components
    window.dispatchEvent(new CustomEvent('trackChanged', {
      detail: {
        trackId: trackId,
        trackName: this.trackMap[trackId]
      }
    }));
  },
  
  // Helper to update any music selection UI
  updateMusicSelectionUI(selectId, textId, trackId) {
    const selectElement = document.getElementById(selectId);
    const textElement = document.getElementById(textId);
    
    if (selectElement) {
      // Make sure the select element value is updated
      selectElement.value = trackId;
      
      // Update display text if available
      if (textElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption) {
          textElement.textContent = selectedOption.textContent;
        }
      }
    }
  },
  
  // Play the current selected track
  playCurrentTrack() {
    this.changeTrack(this.currentTrackId);
  },

  playButtonClick() {
    if (this.isMuted) return; 
    if (!this.buttonClick) return;

    const source = this.buttonClick.querySelector('source');
    const buttonSound = new Audio(source ? source.src : this.buttonClick.src);
    buttonSound.volume = this.sfxVolume; 
    buttonSound.play().catch(e => console.warn('Sound play prevented:', e));
  },

  playScatterSound() {
    if (this.isMuted) return; 
    if (!this.scatterSound) return;

    const source = this.scatterSound.querySelector('source');
    const scatterAudio = new Audio(source ? source.src : this.scatterSound.src);
    scatterAudio.volume = this.sfxVolume; 
    scatterAudio.play().catch(e => console.warn('Sound play prevented:', e));
  }
};

window.AudioManager = AudioManager;

document.addEventListener('DOMContentLoaded', function() {
  AudioManager.init();

  const musicVolumeSlider = document.getElementById('music-volume');
  const sfxVolumeSlider = document.getElementById('sfx-volume');

  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('input', function(event) {
      const newVolume = parseFloat(event.target.value) / 100;
      AudioManager.musicVolume = newVolume; 
      
      // Update volume for the currently playing track
      if (AudioManager.currentMusic) {
        AudioManager.currentMusic.volume = newVolume;
      }
      
      // Update volume for all cached tracks
      Object.values(AudioManager.musicTracks).forEach(track => {
        if (track) track.volume = newVolume;
      });
      
      // Update the text display next to the slider
      const valueDisplay = musicVolumeSlider.parentElement.querySelector('.slider-value');
      if (valueDisplay) {
        valueDisplay.textContent = Math.round(newVolume * 100) + '%';
      }
    });

    musicVolumeSlider.addEventListener('change', function() {
       localStorage.setItem('musicVolume', AudioManager.musicVolume);
    });
  }

  if (sfxVolumeSlider) {
    sfxVolumeSlider.addEventListener('input', function(event) {
      const newVolume = parseFloat(event.target.value) / 100;
      AudioManager.sfxVolume = newVolume; 
      if (AudioManager.buttonClick) AudioManager.buttonClick.volume = newVolume; 
      if (AudioManager.scatterSound) AudioManager.scatterSound.volume = newVolume;
    });

    sfxVolumeSlider.addEventListener('change', function() {
       localStorage.setItem('sfxVolume', AudioManager.sfxVolume);
    });
  }

  const muteToggleButton = document.getElementById('mute-toggle');
  if (muteToggleButton) {
      muteToggleButton.addEventListener('click', function() {
          AudioManager.toggleMute();
      });
  }
});
