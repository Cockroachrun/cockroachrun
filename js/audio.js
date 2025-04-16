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

    // Enhanced music system
    musicTracks: {
        menu: [
            {id: 'menu-loop', name: 'Menu Theme', path: 'assets/sounds/music/Menu_loop.mp3'},
            {id: 'world-theme', name: 'World Theme', path: 'assets/sounds/music/world_theme.mp3'},
            {id: 'cockroach-run', name: 'Cockroach Run', path: 'assets/sounds/music/Cockroach run music.mp3'},
        ],
        game: [
            // Game tracks here
        ]
    },
    currentTrack: null,
    
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
        console.time('Audio Preloading');
        this.preloadAudio();
        console.timeEnd('Audio Preloading');
        
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
                    ${this.musicTracks.menu.map((track, index) => `<option value="${index + 1}">${track.name}</option>`).join('')}
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
     * Preload audio files
     */
    preloadAudio() {
        // Preload menu music tracks
        this.musicTracks.menu.forEach(track => {
            const audio = new Audio(track.path);
            audio.preload = 'auto';
        });
        
        // Preload game music tracks (if any)
        this.musicTracks.game.forEach(track => {
            const audio = new Audio(track.path);
            audio.preload = 'auto';
        });
    },
    
    /**
     * Initialize the audio context
     */
    initAudioContext() {
        // Create audio context if not already created
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume audio context if suspended
        if (window.audioContext.state === 'suspended') {
            window.audioContext.resume();
        }
        
        // Remove the event listener after initialization
        document.removeEventListener('click', this.initAudioContext);
    },
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSfxVolume = localStorage.getItem('sfxVolume');
        const savedIsMusicMuted = localStorage.getItem('isMusicMuted');
        
        this.musicVolume = savedMusicVolume !== null ? parseFloat(savedMusicVolume) : this.musicVolume;
        this.sfxVolume = savedSfxVolume !== null ? parseFloat(savedSfxVolume) : this.sfxVolume;
        this.isMusicMuted = savedIsMusicMuted !== null ? (savedIsMusicMuted === 'true') : this.isMusicMuted;
    },
    
    /**
     * Update the music and SFX volumes
     */
    updateVolumes() {
        this.menuMusic.volume = this.musicVolume;
        this.gameMusic.volume = this.musicVolume;
        // Set volume for other SFX elements here
    },
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('sfxVolume', this.sfxVolume);
        localStorage.setItem('isMusicMuted', this.isMusicMuted);
    },
    
    /**
     * Set the music volume
     * @param {number} volume - The new music volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = volume;
    },
    
    /**
     * Set the SFX volume
     * @param {number} volume - The new SFX volume (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = volume;
    },
    
    /**
     * Play the menu music
     */
    playMenuMusic() {
        // Select a random track if "random" is selected
        let trackIndex = this.currentMenuTrackIndex;
        if (trackIndex === 0) {
            trackIndex = Math.floor(Math.random() * this.musicTracks.menu.length);
        } else {
            trackIndex--; // Adjust index to match array
        }
        
        const selectedTrack = this.musicTracks.menu[trackIndex];
        if (!selectedTrack) {
            console.error('No menu music tracks available.');
            return;
        }
        
        this.playTrack(selectedTrack.id);
    },
    
    /**
     * Resume the audio context if suspended
     */
    resumeAudioContext() {
        if (window.audioContext && window.audioContext.state === 'suspended') {
            window.audioContext.resume()
            .then(() => {
                console.log('Audio context successfully resumed');
            })
            .catch(error => {
                console.error('Error resuming audio context:', error);
            });
        }
    },
    
    /**
     * Setup music retry mechanism
     */
    setupMusicRetry() {
        const startMusic = () => {
            this.playMenuMusic();
        };
        
        const addEventListeners = () => {
            document.addEventListener('click', startMusic, { once: true });
            document.addEventListener('touchstart', startMusic, { once: true });
        };
        
        addEventListeners();
    },
    
    /**
     * Play the game music
     */
    playGameMusic() {
        // For now, stop all music
        this.stopAllMusic();
        
        // Select a random track
        //const trackIndex = Math.floor(Math.random() * this.musicTracks.game.length);
        //const selectedTrack = this.musicTracks.game[trackIndex];
        
        //this.playTrack(selectedTrack.id);
    },
    
    /**
     * Stop all music
     */
    stopAllMusic() {
        this.menuMusic.pause();
        this.gameMusic.pause();
        this.menuMusic.currentTime = 0;
        this.gameMusic.currentTime = 0;
    },
    
    /**
     * Play the button click sound
     */
    playButtonClick() {
        this.buttonClick.currentTime = 0;
        this.buttonClick.play();
    },
    
    /**
     * Play the scatter sound
     */
    playScatterSound() {
        this.scatterSound.currentTime = 0;
        this.scatterSound.play();
    },
    
    /**
     * Play a specific track by ID
     * @param {string} trackId - The ID of the track to play
     */
    playTrack(trackId) {
        // Stop all music first
        this.stopAllMusic();
        
        let trackElement;
        
        // Check if it's a menu track
        const menuTrack = this.musicTracks.menu.find(track => track.id === trackId);
        if (menuTrack) {
            trackElement = this.menuMusic;
            trackElement.src = menuTrack.path;
        }
        // Check if it's a game track
        const gameTrack = this.musicTracks.game.find(track => track.id === trackId);
        if (gameTrack) {
            trackElement = this.gameMusic;
            trackElement.src = gameTrack.path;
        }
        
        if (!trackElement) {
            console.error(`Track with ID "${trackId}" not found.`);
            return;
        }
        
        trackElement.volume = this.musicVolume;
        trackElement.loop = true;
        
        trackElement.addEventListener('canplaythrough', () => {
            trackElement.play();
        });
    }
}
