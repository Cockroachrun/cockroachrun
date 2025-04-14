/**
 * Pause Screen Module for Cockroach Run
 * Encapsulates the pause screen UI and logic.
 */

export function createPauseScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('pause-screen');

  function handleResumeClick() {
    uiManager.emit('resumeGame');
  }
  function handleRestartClick() {
    uiManager.emit('restartGame');
  }
  function handleQuitClick() {
    uiManager.emit('quitToMenu');
  }

  // Attach event listeners (only once)
  const resumeBtn = element.querySelector('#resume-button');
  if (resumeBtn) resumeBtn.addEventListener('click', handleResumeClick);
  const restartBtn = element.querySelector('#restart-button');
  if (restartBtn) restartBtn.addEventListener('click', handleRestartClick);
  const quitBtn = element.querySelector('#quit-button');
  if (quitBtn) quitBtn.addEventListener('click', handleQuitClick);

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