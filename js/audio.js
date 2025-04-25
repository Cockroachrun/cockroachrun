const AudioManager = {
  currentMusic: null,
  buttonClick: null,
  scatterSound: null,
  muteToggleElement: null, 
  
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
    this.muteToggleElement = document.getElementById('mute-toggle');
    
    if (!this.buttonClick || !this.scatterSound) {
        console.warn("AudioManager Warning: One or more audio elements not found!");
    }
    if (!this.muteToggleElement) {
        console.warn("AudioManager Warning: Mute toggle button element not found!");
    }
    
    // Event listener for music track selection
    const musicSelect = document.getElementById('music-select');
    if (musicSelect) {
        musicSelect.addEventListener('change', (e) => {
            this.changeTrack(e.target.value);
        });
        
        // Initialize with saved track or default
        const savedTrack = localStorage.getItem('currentTrackId');
        if (savedTrack && this.trackMap[savedTrack]) {
            this.currentTrackId = savedTrack;
            musicSelect.value = savedTrack;
            
            // Update the custom dropdown text
            const selectedTextElement = document.getElementById('selected-music-text');
            if (selectedTextElement) {
                const selectedOption = musicSelect.options[musicSelect.selectedIndex];
                selectedTextElement.textContent = selectedOption.textContent;
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
    if (this.currentMusic) this.currentMusic.muted = this.isMuted;
    
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
    return `assets/sounds/music/${filename}`;
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
  
  // Change to a different track
  changeTrack(trackId) {
    if (!this.trackMap[trackId]) {
      console.error(`Invalid track ID: ${trackId}`);
      return;
    }
    
    // Stop current music if playing
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }
    
    // Store track selection
    this.currentTrackId = trackId;
    localStorage.setItem('currentTrackId', trackId);
    
    // Get the audio for this track
    const audio = this.getTrackAudio(trackId);
    this.currentMusic = audio;
    
    // Ensure loop setting is correct based on current mode
    if (audio) {
      audio.loop = this.playbackMode === 'single';
    }
    
    // Update the dropdown display text
    const selectedTextElement = document.getElementById('selected-music-text');
    const musicSelect = document.getElementById('music-select');
    if (selectedTextElement && musicSelect) {
      // Make sure the actual select element value is updated first
      musicSelect.value = trackId;
      const selectedOption = musicSelect.options[musicSelect.selectedIndex];
      if (selectedOption) {
        selectedTextElement.textContent = selectedOption.textContent;
      }
    }
    
    // Play the new track
    if (audio) {
      audio.play().catch(e => console.warn('Autoplay prevented:', e));
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
