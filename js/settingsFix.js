/**
 * Settings Screen Fix (Refactored to remove inline style toggles and rely on .active class)
 * Also attaches real event listeners for the SAVE button (#save-settings),
 * the FPS toggle (#fps-toggle), and the graphics dropdown (#quality-select).
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Settings fix script loaded");

  // Example settings model (adjust as needed)
  const gameSettings = {
    musicVolume: 80,
    sfxVolume: 100,
    quality: 'medium',
    showFPS: false
  };

  /********************
   *  HELPER FUNCTIONS
   ********************/

  function hideAllScreens() {
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
      screen.classList.remove('active');
    });
  }

  function showSettingsScreen() {
    console.log("Showing settings screen");
    hideAllScreens();

    // Add .active class to show
    const settingsScreen = document.getElementById('settings-screen');
    if (settingsScreen) {
      settingsScreen.classList.add('active');
    }
  }

  function hideSettingsScreen() {
    console.log("Hiding settings screen");
    const settingsScreen = document.getElementById('settings-screen');
    if (settingsScreen) {
      settingsScreen.classList.remove('active');
    }

    // Show start screen again
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      startScreen.classList.add('active');
    }
  }

  function showCreditsScreen() {
    console.log("Showing credits screen");

    // Hide settings
    const settingsScreen = document.getElementById('settings-screen');
    if (settingsScreen) {
      settingsScreen.classList.remove('active');
    }

    // Show credits
    const creditsScreen = document.getElementById('credits-screen');
    if (creditsScreen) {
      creditsScreen.classList.add('active');
    }
  }

  function hideCreditsScreen() {
    console.log("Hiding credits screen");

    // Hide credits
    const creditsScreen = document.getElementById('credits-screen');
    if (creditsScreen) {
      creditsScreen.classList.remove('active');
    }

    // Return to the settings screen
    showSettingsScreen();
  }

  /**********************
   *  EVENT LISTENERS
   **********************/

  // SETTINGS BUTTON (from start screen)
  const settingsButton = document.getElementById('settings-button');
  if (settingsButton) {
    settingsButton.addEventListener('click', function() {
      console.log("Settings button clicked");
      showSettingsScreen();
    }, true);
  }

  // BACK FROM SETTINGS
  const backButton = document.getElementById('back-from-settings');
  if (backButton) {
    backButton.addEventListener('click', function() {
      console.log("Back button clicked");
      hideSettingsScreen();
    }, true);
  }

  // SAVE SETTINGS
  const saveButton = document.getElementById('save-settings');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      console.log("Save button clicked");

      // Retrieve settings from DOM to update our model
      const musicVolInput = document.getElementById('music-volume');
      const sfxVolInput = document.getElementById('sfx-volume');
      const qualitySelect = document.getElementById('quality-select');

      if (musicVolInput) {
        gameSettings.musicVolume = parseInt(musicVolInput.value, 10);
      }
      if (sfxVolInput) {
        gameSettings.sfxVolume = parseInt(sfxVolInput.value, 10);
      }
      if (qualitySelect) {
        gameSettings.quality = qualitySelect.value;
      }

      console.log("Updated Settings:", gameSettings);
      hideSettingsScreen();
    }, true);
  }

  // FPS TOGGLE
  const fpsToggle = document.getElementById('fps-toggle');
  if (fpsToggle) {
    fpsToggle.addEventListener('click', function() {
      // Toggle our showFPS setting
      gameSettings.showFPS = !gameSettings.showFPS;
      console.log("FPS toggled:", gameSettings.showFPS);
      // (Update UI or game logic as needed)
    }, true);
  }

  // GRAPHICS DROPDOWN (Quality Select)
  const qualitySelect = document.getElementById('quality-select');
  if (qualitySelect) {
    qualitySelect.addEventListener('change', function(e) {
      gameSettings.quality = e.target.value;
      console.log("Quality changed to:", gameSettings.quality);
      // (Update game logic as needed)
    }, true);
  }

  // CREDITS BUTTON
  const creditsButton = document.getElementById('credits-button');
  if (creditsButton) {
    creditsButton.addEventListener('click', function() {
      console.log("Credits button clicked");
      showCreditsScreen();
    }, true);
  }

  // BACK FROM CREDITS
  const backFromCredits = document.getElementById('back-from-credits');
  if (backFromCredits) {
    backFromCredits.addEventListener('click', function() {
      console.log("Back from credits clicked");
      hideCreditsScreen();
    }, true);
  }
});
