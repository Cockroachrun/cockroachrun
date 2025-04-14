/**
 * Mode Selection Screen Module for Cockroach Run
 * Encapsulates the mode selection UI and logic.
 */

export function createModeSelectionScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('mode-selection-screen');

  // Event handlers
  function handleModeClick(e) {
    const card = e.target.closest('.mode-card');
    if (!card) return;
    const mode = card.getAttribute('data-mode');
    // Emit a UI event for mode selection
    uiManager.emit('modeSelected', mode);
  }

  function handleBackClick() {
    uiManager.emit('backFromMode');
  }

  // Attach event listeners (only once)
  element.addEventListener('click', handleModeClick);
  const backBtn = element.querySelector('#back-from-mode');
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