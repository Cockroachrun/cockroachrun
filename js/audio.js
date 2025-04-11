/**
 * Cockroach Run - Audio Manager
 * Handles all audio playback functionality
 */

const AudioManager = {
    // Audio elements
    menuMusic: document.getElementById('menu-music'),
    gameMusic: document.getElementById('game-music'),
    buttonClick: document.getElementById('button-click'),
    scatterSound: document.getElementById('scatter-sound'),

    // Menu music playlist
    menuMusicTracks: [
        'assets/sounds/music/Menu_loop.mp3',
        'assets/sounds/music/world_theme.mp3',
        'assets/sounds/music/Cockroach run music.mp3'
    ],
    
    // Currently selected menu music track index (0 = random)
    currentMenuTrackIndex: 0,
    
    // Settings
    musicVolume: 0.8,
    sfxVolume: 1.0,
    
    // States
    isMusicMuted: false,
    
    /**
     * Initialize the audio manager
     */
    init() {
        // Load settings from localStorage if available
        this.loadSettings();
        
        // Apply initial volume settings
        this.updateVolumes();
        
        // Add event listeners for volume sliders
        document.getElementById('music-volume').addEventListener('input', (e) => {
            this.setMusicVolume(e.target.value / 100);
            document.querySelector('#music-volume + .slider-value').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            this.setSfxVolume(e.target.value / 100);
            document.querySelector('#sfx-volume + .slider-value').textContent = `${e.target.value}%`;
        });
        
        // Preload audio files
        this.preloadAudio();
        
        // Add a global click handler to initialize audio context
        document.addEventListener('click', this.initAudioContext.bind(this), { once: true });
        
        // Add song selection controls to settings
        this.setupSongSelectionControls();
        
        console.log('Audio Manager initialized');
    },
    
    /**
     * Setup song selection controls in the settings menu
     */
    setupSongSelectionControls() {
        // Create song selection container
        const settingsAudioSection = document.querySelector('#settings-screen .settings-section:first-child');
        if (!settingsAudioSection) return;
        
        // Create song selection setting item with dropdown
        const songSelectionItem = document.createElement('div');
        songSelectionItem.className = 'setting-item';
        songSelectionItem.innerHTML = `
            <span>Music Selection</span>
            <div class="dropdown-container">
                <select id="music-track-select" class="styled-dropdown">
                    <option value="0">Random</option>
                    <option value="1">Menu Loop</option>
                    <option value="2">World Theme</option>
                    <option value="3">Cockroach Run</option>
                </select>
                <div class="dropdown-arrow">▼</div>
            </div>
        `;
        
        // Add custom styles for the dropdown
        const style = document.createElement('style');
        style.textContent = `
            .dropdown-container {
                position: relative;
                width: 180px;
            }
            .styled-dropdown {
                appearance: none;
                background-color: rgba(0, 0, 0, 0.7);
                color: #fff;
                border: 1px solid #444;
                border-radius: 5px;
                padding: 8px 12px;
                width: 100%;
                font-family: 'Exo 2', sans-serif;
                font-size: 14px;
                cursor: pointer;
                outline: none;
            }
            .styled-dropdown:hover {
                background-color: rgba(20, 20, 20, 0.8);
            }
            .dropdown-arrow {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #888;
                pointer-events: none;
                font-size: 10px;
            }
        `;
        document.head.appendChild(style);
        
        // Create mute toggle setting item
        const muteToggleItem = document.createElement('div');
        muteToggleItem.className = 'setting-item';
        muteToggleItem.innerHTML = `
            <span>Mute Music</span>
            <div class="toggle-container">
                <div class="toggle" id="music-mute-toggle">
                    <div class="toggle-slider"></div>
                </div>
            </div>
        `;
        
        // Add the new setting items to the audio section
        settingsAudioSection.appendChild(songSelectionItem);
        settingsAudioSection.appendChild(muteToggleItem);
        
        // Add event listener for song selection dropdown
        const trackSelect = document.getElementById('music-track-select');
        if (trackSelect) {
            // Set initial value based on current selection
            trackSelect.value = this.currentMenuTrackIndex.toString();
            
            trackSelect.addEventListener('change', () => {
                const songIndex = parseInt(trackSelect.value);
                this.selectMenuTrack(songIndex);
            });
        }
        
        // Add event listener for mute toggle
        const muteToggle = document.getElementById('music-mute-toggle');
        if (muteToggle) {
            muteToggle.classList.toggle('active', this.isMusicMuted);
            
            muteToggle.addEventListener('click', () => {
                this.toggleMute();
                muteToggle.classList.toggle('active', this.isMusicMuted);
            });
        }
    },
    
    /**
     * Select a specific menu music track
     * @param {number} index - Index of the track to select (0 = random)
     */
    selectMenuTrack(index) {
        if (index === 0) {
            // Random selection
            this.currentMenuTrackIndex = 0;
        } else {
            // Specific track (adjust index to match array)
            this.currentMenuTrackIndex = index;
        }
        
        // Save the selection to localStorage
        localStorage.setItem('selectedMenuTrack', this.currentMenuTrackIndex);
        
        // If music is currently playing, update it
        if (this.menuMusic.paused === false) {
            this.playMenuMusic();
        }
    },
    
    /**
     * Toggle music mute state
     */
    toggleMute() {
        this.isMusicMuted = !this.isMusicMuted;
        
        // Save mute state to localStorage
        localStorage.setItem('isMusicMuted', this.isMusicMuted);
        
        // Apply mute state
        this.menuMusic.muted = this.isMusicMuted;
        this.gameMusic.muted = this.isMusicMuted;
    },
    
    /**
     * Preload audio files to ensure they're ready to play
     */
    preloadAudio() {
        // Check if menu music files exist
        this.menuMusicTracks.forEach(track => {
            const audio = new Audio();
            audio.src = track;
            audio.preload = 'auto';
            audio.addEventListener('error', (e) => {
                console.error(`Error loading audio file ${track}:`, e);
            });
        });
        
        console.log('Audio files preloaded');
    },
    
    /**
     * Initialize audio context on user interaction
     * This helps with browsers that require user interaction to start audio
     */
    initAudioContext() {
        // Create a temporary audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            
            // Create a silent oscillator
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0; // Silent
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // Play for a short time
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.001);
            
            console.log('Audio context initialized');
        }
    },
    
    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSfxVolume = localStorage.getItem('sfxVolume');
        const savedMenuTrack = localStorage.getItem('selectedMenuTrack');
        const savedMuteState = localStorage.getItem('isMusicMuted');
        
        if (savedMusicVolume !== null) {
            this.musicVolume = parseFloat(savedMusicVolume);
            document.getElementById('music-volume').value = this.musicVolume * 100;
            document.querySelector('#music-volume + .slider-value').textContent = `${Math.round(this.musicVolume * 100)}%`;
        }
        
        if (savedSfxVolume !== null) {
            this.sfxVolume = parseFloat(savedSfxVolume);
            document.getElementById('sfx-volume').value = this.sfxVolume * 100;
            document.querySelector('#sfx-volume + .slider-value').textContent = `${Math.round(this.sfxVolume * 100)}%`;
        }
        
        if (savedMenuTrack !== null) {
            this.currentMenuTrackIndex = parseInt(savedMenuTrack);
        }
        
        if (savedMuteState !== null) {
            this.isMusicMuted = savedMuteState === 'true';
        }
    },
    
    /**
     * Update all audio volumes based on current settings
     */
    updateVolumes() {
        this.menuMusic.volume = this.musicVolume;
        this.gameMusic.volume = this.musicVolume;
        this.buttonClick.volume = this.sfxVolume;
        this.scatterSound.volume = this.sfxVolume;
    },
    
    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        localStorage.setItem('selectedMenuTrack', this.currentMenuTrackIndex);
        localStorage.setItem('isMusicMuted', this.isMusicMuted);
    },
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.updateVolumes();
    },
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = volume;
        this.updateVolumes();
    },
    
    /**
     * Play menu music
     */
    playMenuMusic() {
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;

        // Select track based on settings
        let selectedTrack;
        if (this.currentMenuTrackIndex === 0) {
            // Random selection
            const randomIndex = Math.floor(Math.random() * this.menuMusicTracks.length);
            selectedTrack = this.menuMusicTracks[randomIndex];
        } else {
            // Specific track (adjust index to match array)
            const trackIndex = this.currentMenuTrackIndex - 1;
            selectedTrack = this.menuMusicTracks[trackIndex];
        }

        // Update the <source> element inside menuMusic
        const source = this.menuMusic.querySelector('source');
        if (source) {
            source.src = selectedTrack;
            this.menuMusic.load();
        } else {
            console.warn('No <source> element found inside #menu-music');
        }

        // Apply mute state
        this.menuMusic.muted = this.isMusicMuted;

        // Resume audio context if it exists
        this.resumeAudioContext();

        // Try to play the music and handle autoplay restrictions
        const playPromise = this.menuMusic.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Menu music started successfully');
                })
                .catch(error => {
                    console.warn('Failed to play menu music (autoplay may be blocked):', error);
                    
                    // Set up a more aggressive retry mechanism
                    this.setupMusicRetry();
                });
        } else {
            // For browsers that don't return a promise
            this.setupMusicRetry();
        }
    },
    
    /**
     * Resume audio context if it exists
     */
    resumeAudioContext() {
        // Try to resume any existing audio context
        if (window.AudioContext || window.webkitAudioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            // This is a hack to access any existing audio context
            const dummyContext = new AudioContextClass();
            if (dummyContext.state === 'suspended') {
                dummyContext.resume().then(() => {
                    console.log('Audio context resumed');
                }).catch(error => {
                    console.warn('Failed to resume audio context:', error);
                });
            }
        }
    },
    
    /**
     * Set up a retry mechanism for playing music
     */
    setupMusicRetry() {
        // Set up event listeners for user interaction to start music
        const startMusic = () => {
            // Try to play the music again
            this.menuMusic.play().catch(error => {
                console.warn('Still failed to play music:', error);
            });
        };
        
        // Add event listeners for common user interactions
        const events = ['click', 'touchstart', 'keydown', 'mousedown'];
        const addEventListeners = () => {
            events.forEach(event => {
                document.addEventListener(event, startMusic, { once: true });
            });
            
            // Also try to play on visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    startMusic();
                }
            }, { once: true });
        };
        
        // Add the event listeners
        addEventListeners();
        
        // Also try again after a short delay
        setTimeout(() => {
            this.menuMusic.play().catch(() => {
                // If it still fails, keep the event listeners active
                console.log('Retrying music playback...');
            });
        }, 1000);
    },
    
    /**
     * Play game music
     */
    playGameMusic() {
        this.menuMusic.pause();
        this.menuMusic.currentTime = 0;
        
        // Apply mute state
        this.gameMusic.muted = this.isMusicMuted;
        
        // Resume audio context if it exists
        this.resumeAudioContext();
        
        // Try to play the game music
        const playPromise = this.gameMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Failed to play game music (autoplay may be blocked):', error);
                
                // Set up a retry mechanism similar to menu music
                const startMusic = () => {
                    this.gameMusic.play().catch(error => {
                        console.warn('Still failed to play game music:', error);
                    });
                };
                
                // Add event listeners for common user interactions
                const events = ['click', 'touchstart', 'keydown', 'mousedown'];
                events.forEach(event => {
                    document.addEventListener(event, startMusic, { once: true });
                });
                
                // Also try again after a short delay
                setTimeout(startMusic, 1000);
            });
        } else {
            // For browsers that don't return a promise
            const startMusic = () => {
                this.gameMusic.play();
            };
            document.addEventListener('click', startMusic, { once: true });
        }
    },
    
    /**
     * Stop all music
     */
    stopAllMusic() {
        this.menuMusic.pause();
        this.menuMusic.currentTime = 0;
        
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;
    },
    
    /**
     * Play button click sound
     */
    playButtonClick() {
        // Clone and play to allow for overlapping sounds
        const sound = this.buttonClick.cloneNode();
        sound.volume = this.sfxVolume;
        sound.play().catch(error => {
            console.warn('Failed to play button click sound:', error);
        });
    },
    
    /**
     * Play scatter sound
     */
    playScatterSound() {
        // Clone and play to allow for overlapping sounds
        const sound = this.scatterSound.cloneNode();
        sound.volume = this.sfxVolume;
        sound.play().catch(error => {
            console.warn('Failed to play scatter sound:', error);
        });
    }
};
