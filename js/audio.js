const AudioManager = {
  menuMusic: document.getElementById('menu-music'),
  gameMusic: document.getElementById('game-music'),
  buttonClick: document.getElementById('button-click'),
  scatterSound: document.getElementById('scatter-sound'),
  
  musicVolume: 0.8,
  sfxVolume: 1.0,
  
  init() {
    this.menuMusic.volume = this.musicVolume;
    this.gameMusic.volume = this.musicVolume;
    this.buttonClick.volume = this.sfxVolume;
    this.scatterSound.volume = this.sfxVolume;
    
    this.loadSettings();
    console.log('AudioManager initialized');
  },
  
  loadSettings() {
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSfxVolume = localStorage.getItem('sfxVolume');
    
    if (savedMusicVolume) {
      this.musicVolume = parseFloat(savedMusicVolume);
      this.menuMusic.volume = this.musicVolume;
      this.gameMusic.volume = this.musicVolume;
      document.getElementById('music-volume').value = this.musicVolume * 100;
    }
    
    if (savedSfxVolume) {
      this.sfxVolume = parseFloat(savedSfxVolume);
      this.buttonClick.volume = this.sfxVolume;
      this.scatterSound.volume = this.sfxVolume;
      document.getElementById('sfx-volume').value = this.sfxVolume * 100;
    }
  },
  
  saveSettings() {
    this.musicVolume = document.getElementById('music-volume').value / 100;
    this.sfxVolume = document.getElementById('sfx-volume').value / 100;
    
    this.menuMusic.volume = this.musicVolume;
    this.gameMusic.volume = this.musicVolume;
    this.buttonClick.volume = this.sfxVolume;
    this.scatterSound.volume = this.sfxVolume;
    
    localStorage.setItem('musicVolume', this.musicVolume);
    localStorage.setItem('sfxVolume', this.sfxVolume);
  },
  
  playMenuMusic() {
    this.gameMusic.pause();
    this.gameMusic.currentTime = 0;
    this.menuMusic.play().catch(e => console.log('Autoplay prevented:', e));
  },
  
  playGameMusic() {
    this.menuMusic.pause();
    this.menuMusic.currentTime = 0;
    this.gameMusic.play().catch(e => console.log('Autoplay prevented:', e));
  },
  
  playButtonClick() {
    // Create a new Audio instance to play click sound
    const source = this.buttonClick.querySelector('source');
    const buttonSound = new Audio(source ? source.src : this.buttonClick.src);
    buttonSound.volume = this.sfxVolume;
    buttonSound.play().catch(e => console.log('Sound play prevented:', e));
  },
  
  playScatterSound() {
    const source = this.scatterSound.querySelector('source');
    const scatterAudio = new Audio(source ? source.src : this.scatterSound.src);
    scatterAudio.volume = this.sfxVolume;
    scatterAudio.play().catch(e => console.log('Sound play prevented:', e));
  }
};

// Initialize audio on page load
// Expose AudioManager globally for all scripts
window.AudioManager = AudioManager;

document.addEventListener('DOMContentLoaded', function() {
  // AudioManager implementation
  AudioManager.init();
});
