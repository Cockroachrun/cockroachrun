/**
 * Game Over Screen Module for Cockroach Run
 * Encapsulates the game over screen UI and logic.
 */

export function createGameOverScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('game-over-screen');

  function handleTryAgainClick() {
    uiManager.emit('tryAgain');
  }
  function handleMainMenuClick() {
    uiManager.emit('mainMenu');
  }

  // Attach event listeners (only once)
  const tryAgainBtn = element.querySelector('#try-again-button');
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', handleTryAgainClick);
  const mainMenuBtn = element.querySelector('#main-menu-button');
  if (mainMenuBtn) mainMenuBtn.addEventListener('click', handleMainMenuClick);

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