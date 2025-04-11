/**
 * Audio Manager handles all game sounds and music
 */
const AudioManager = (function() {
    // Private variables
    const sounds = {
        // Menu sounds
        menuClick: null,
        menuHover: null,
        menuMusic: null,
        
        // Game sounds
        jump: null,
        land: null,
        collectItem: null,
        damage: null,
        death: null,
        powerupActivate: null,
        
        // Environment sounds
        ambientKitchen: null,
        ambientBathroom: null,
        ambientSewer: null,
        ambientStreet: null
    };
    
    // Music themes
    const musicThemes = {
        default: {
            menu: 'sounds/music/Menu_loop.mp3',
            freeWorld: {
                kitchen: 'sounds/music/world_theme.mp3',
                bathroom: 'sounds/music/world_theme.mp3',
                sewer: 'sounds/music/world_theme.mp3',
                street: 'sounds/music/world_theme.mp3'
            },
            runner: 'sounds/music/Cockroach run music.mp3'
        },
        dark: {
            menu: 'sounds/music/Menu_loop.mp3',
            freeWorld: {
                kitchen: 'sounds/music/world_theme.mp3',
                bathroom: 'sounds/music/world_theme.mp3',
                sewer: 'sounds/music/world_theme.mp3',
                street: 'sounds/music/world_theme.mp3'
            },
            runner: 'sounds/music/Cockroach run music.mp3'
        },
        intense: {
            menu: 'sounds/music/Menu_loop.mp3',
            freeWorld: {
                kitchen: 'sounds/music/world_theme.mp3',
                bathroom: 'sounds/music/world_theme.mp3',
                sewer: 'sounds/music/world_theme.mp3',
                street: 'sounds/music/world_theme.mp3'
            },
            runner: 'sounds/music/Cockroach run music.mp3'
        }
    };
    
    let currentMusic = null;
    let currentMusicTheme = 'default';
    let musicVolume = 0.8;
    let sfxVolume = 1.0;
    let isMuted = false;
    
    // Private methods
    function loadSound(soundName, path) {
        const audio = new Audio();
        audio.src = path;
        sounds[soundName] = audio;
        return audio;
    }
    
    function playSound(soundName) {
        if (isMuted || !sounds[soundName]) return;
        
        // Clone the audio to allow multiple instances of the same sound
        const sound = sounds[soundName].cloneNode();
        sound.volume = sfxVolume;
        sound.play();
    }
    
    function stopAllMusic() {
        if (currentMusic) {
            currentMusic.pause();
            currentMusic.currentTime = 0;
        }
    }
    
    function playMusic(path, loop = true) {
        stopAllMusic();
        
        const audio = new Audio();
        audio.src = path;
        audio.loop = loop;
        audio.volume = musicVolume;
        audio.play();
        
        currentMusic = audio;
    }
    
    function loadAllSounds() {
        // Load menu sounds
        loadSound('menuClick', 'sounds/sfx/button_click.wav');
        loadSound('menuHover', 'sounds/sfx/notification.wav');
        
        // Load game sounds
        loadSound('jump', 'sounds/sfx/transition.wav');
        loadSound('land', 'sounds/sfx/transition.wav');
        loadSound('collectItem', 'sounds/sfx/success.wav');
        loadSound('damage', 'sounds/sfx/scatter.wav');
        loadSound('death', 'sounds/sfx/scatter.wav');
        loadSound('powerupActivate', 'sounds/sfx/unlock.wav');
        
        // Load environmental sounds - using placeholder sounds
        loadSound('ambientKitchen', 'sounds/sfx/transition.wav');
        loadSound('ambientBathroom', 'sounds/sfx/transition.wav');
        loadSound('ambientSewer', 'sounds/sfx/transition.wav');
        loadSound('ambientStreet', 'sounds/sfx/transition.wav');
    }
    
    // Public methods
    return {
        init: function() {
            loadAllSounds();
            
            // Add event listeners for menu buttons
            document.querySelectorAll('.menu-btn, .back-btn, .continue-btn, .save-btn').forEach(button => {
                button.addEventListener('click', () => {
                    playSound('menuClick');
                });
                
                button.addEventListener('mouseenter', () => {
                    playSound('menuHover');
                });
            });
            
            console.log('AudioManager initialized');
        },
        
        playMenuMusic: function() {
            const musicPath = musicThemes[currentMusicTheme].menu;
            playMusic(musicPath);
        },
        
        playGameMusic: function(mode, environment = 'kitchen') {
            let musicPath;
            
            if (mode === 'free-world') {
                musicPath = musicThemes[currentMusicTheme].freeWorld[environment];
            } else if (mode === 'runner') {
                musicPath = musicThemes[currentMusicTheme].runner;
            } else {
                return;
            }
            
            playMusic(musicPath);
        },
        
        playSound: function(soundName) {
            playSound(soundName);
        },
        
        setMusicVolume: function(volume) {
            musicVolume = Math.max(0, Math.min(1, volume));
            if (currentMusic) {
                currentMusic.volume = musicVolume;
            }
        },
        
        setSfxVolume: function(volume) {
            sfxVolume = Math.max(0, Math.min(1, volume));
        },
        
        toggleMute: function() {
            isMuted = !isMuted;
            
            if (isMuted) {
                if (currentMusic) {
                    currentMusic.volume = 0;
                }
            } else {
                if (currentMusic) {
                    currentMusic.volume = musicVolume;
                }
            }
            
            return isMuted;
        },
        
        changeMusicTheme: function(theme) {
            if (musicThemes[theme]) {
                currentMusicTheme = theme;
                
                // If music is currently playing, restart with new theme
                if (currentMusic) {
                    if (UIManager.isGameRunning) {
                        this.playGameMusic(UIManager.selectedMode);
                    } else {
                        this.playMenuMusic();
                    }
                }
            }
        }
    };
})();