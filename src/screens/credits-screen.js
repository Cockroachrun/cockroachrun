/**
 * Credits Screen Module for Cockroach Run
 * Encapsulates the credits screen UI and logic.
 */

export function createCreditsScreen(uiManager) {
  // Get the existing DOM element from index.html
  const element = document.getElementById('credits-screen');

  function handleBackClick() {
    uiManager.emit('backFromCredits');
  }

  // Attach event listener (only once)
  const backBtn = element?.querySelector('#back-from-credits');
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