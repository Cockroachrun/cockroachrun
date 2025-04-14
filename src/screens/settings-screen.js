/**
 * Settings Screen Module for Cockroach Run
 * Encapsulates the settings screen UI and logic.
 */

export function createSettingsScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('settings-screen');

  function handleSaveClick() {
    // Collect settings values here if needed
    uiManager.emit('saveSettings');
  }
  function handleBackClick() {
    uiManager.emit('backFromSettings');
  }

  // Attach event listeners (only once)
  const saveBtn = element?.querySelector('#save-settings-button');
  if (saveBtn) saveBtn.addEventListener('click', handleSaveClick);
  const backBtn = element?.querySelector('#back-from-settings');
  if (backBtn) backBtn.addEventListener('click', handleBackClick);

  // API for UIManager
  return {
    element,
    onShow() {
      element.classList.add('active');
    },
    onHide() {
      element.classList.remove('active');
    }
  };
}