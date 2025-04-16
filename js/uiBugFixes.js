/**
 * Comprehensive UI bug fixes
 * Fixes issues across all screens
 */
document.addEventListener('DOMContentLoaded', function() {
  // Fix settings screen sliders
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(slider => {
    // Update slider value display
    const valueDisplay = slider.parentElement.querySelector('.slider-value');
    if (valueDisplay) {
      slider.addEventListener('input', function() {
        valueDisplay.textContent = `${slider.value}%`;
      });
    }
  });

  // Fix toggle buttons
  const toggles = document.querySelectorAll('.toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  // Fix styled dropdowns
  const dropdowns = document.querySelectorAll('.styled-dropdown');
  dropdowns.forEach(dropdown => {
    const container = dropdown.closest('.dropdown-container');
    if (container) {
      // Create dropdown arrow if missing
      if (!container.querySelector('.dropdown-arrow')) {
        const arrow = document.createElement('div');
        arrow.className = 'dropdown-arrow';
        arrow.innerHTML = '▼';
        container.appendChild(arrow);
      }
    }
  });

  // Fix screen transitions
  const showScreen = function(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId + '-screen');
    if (targetScreen) {
      targetScreen.classList.add('active');
    }
  };

  // Add proper click events for all back buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', function() {
      // Play sound if available
      if (window.AudioManager) {
        AudioManager.playButtonClick();
      }

      // Navigate based on button id
      const id = this.id;
      if (id === 'back-from-settings') {
        showScreen('start');
      } else if (id === 'back-from-credits') {
        showScreen('settings');
      } else if (id === 'back-from-character') {
        showScreen('mode-selection');
      } else if (id === 'back-from-mode') {
        showScreen('start');
      }
    });
  });

  // Fix slider update for settings
  const musicSlider = document.getElementById('music-volume');
  if (musicSlider) {
    musicSlider.addEventListener('input', function() {
      const value = this.value;
      this.parentNode.querySelector('.slider-value').textContent = `${value}%`;

      if (window.AudioManager) {
        AudioManager.musicVolume = value / 100;
        AudioManager.menuMusic.volume = AudioManager.musicVolume;
        AudioManager.gameMusic.volume = AudioManager.musicVolume;
      }
    });
  }

  const sfxSlider = document.getElementById('sfx-volume');
  if (sfxSlider) {
    sfxSlider.addEventListener('input', function() {
      const value = this.value;
      this.parentNode.querySelector('.slider-value').textContent = `${value}%`;

      if (window.AudioManager) {
        AudioManager.sfxVolume = value / 100;
        AudioManager.buttonClick.volume = AudioManager.sfxVolume;
        AudioManager.scatterSound.volume = AudioManager.sfxVolume;
      }
    });
  }
});
