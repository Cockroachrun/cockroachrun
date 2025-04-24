const AudioManager = {
  menuMusic: null, 
  gameMusic: null,
  buttonClick: null,
  scatterSound: null,
  muteToggleElement: null, 

  musicVolume: 0.8,
  sfxVolume: 1.0,
  isMuted: false, 

  init() {
    this.menuMusic = document.getElementById('menu-music');
    this.gameMusic = document.getElementById('game-music');
    this.buttonClick = document.getElementById('button-click');
    this.scatterSound = document.getElementById('scatter-sound');
    this.muteToggleElement = document.getElementById('mute-toggle'); 

    if (!this.menuMusic || !this.gameMusic || !this.buttonClick || !this.scatterSound) {
        console.warn("AudioManager Warning: One or more audio elements not found!");
    }
    if (!this.muteToggleElement) {
        console.warn("AudioManager Warning: Mute toggle button element not found!");
    }

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

    this.applyVolumeSettings(); 
    this.applyMuteState(); 
  },

  applyVolumeSettings() {
      if (this.menuMusic) this.menuMusic.volume = this.musicVolume;
      if (this.gameMusic) this.gameMusic.volume = this.musicVolume;
      if (this.buttonClick) this.buttonClick.volume = this.sfxVolume; 
      if (this.scatterSound) this.scatterSound.volume = this.sfxVolume; 

      const musicSlider = document.getElementById('music-volume');
      const sfxSlider = document.getElementById('sfx-volume');
      if(musicSlider) musicSlider.value = this.musicVolume * 100;
      if(sfxSlider) sfxSlider.value = this.sfxVolume * 100;
  },

  applyMuteState() {
    if (this.menuMusic) this.menuMusic.muted = this.isMuted;
    if (this.gameMusic) this.gameMusic.muted = this.isMuted;
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

  playMenuMusic() {
    if (!this.menuMusic) return;
    if (this.gameMusic) {
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;
    }
    this.menuMusic.play().catch(e => console.warn('Autoplay prevented:', e));
  },

  playGameMusic() {
    if (!this.gameMusic) return;
    if (this.menuMusic) {
        this.menuMusic.pause();
        this.menuMusic.currentTime = 0;
    }
    this.gameMusic.play().catch(e => console.warn('Autoplay prevented:', e));
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
      if (AudioManager.menuMusic) AudioManager.menuMusic.volume = newVolume; 
      if (AudioManager.gameMusic) AudioManager.gameMusic.volume = newVolume; 
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
