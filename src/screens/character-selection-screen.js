/**
 * Character Selection Screen Module for Cockroach Run
 * Encapsulates the character selection UI and logic.
 */

export function createCharacterSelectionScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('character-selection-screen');

  // Event handlers
  function handleCharacterClick(e) {
    const card = e.target.closest('.character-card');
    if (!card || card.classList.contains('locked')) return;
    const character = card.getAttribute('data-character');
    // Emit a UI event for character selection
    uiManager.emit('characterSelected', character);
  }

  function handleBackClick() {
    uiManager.emit('backFromCharacter');
  }

  function handleStartGameClick() {
    console.log('Directly redirecting to working test page');
    // Temporary redirect to test page until main integration is fixed
    window.location.href = 'test-free-world-simple.html';
    
    // Normal flow - commented out until fixed
    // uiManager.emit('startGame');
  }

  // Attach event listeners (only once)
  element.addEventListener('click', handleCharacterClick);
  const backBtn = element.querySelector('#back-from-character');
  if (backBtn) backBtn.addEventListener('click', handleBackClick);
  const startBtn = element.querySelector('#start-game-button');
  if (startBtn) startBtn.addEventListener('click', handleStartGameClick);

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