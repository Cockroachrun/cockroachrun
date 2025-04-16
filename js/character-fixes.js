// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
  // Run after a slight delay to ensure other scripts have initialized
  setTimeout(function() {
    // Fix pointer events on carousel arrows
    const arrows = document.querySelectorAll('.carousel-arrow');
    arrows.forEach(arrow => {
      arrow.style.pointerEvents = 'auto';
      arrow.style.zIndex = '10';
    });
    
    // Fix any missing click sound on buttons
    const buttons = document.querySelectorAll('#character-selection-screen button, .carousel-dot');
    buttons.forEach(button => {
      if (!button.getAttribute('data-sound-added')) {
        button.addEventListener('click', function() {
          if (window.AudioManager) {
            AudioManager.playButtonClick();
          }
        });
        button.setAttribute('data-sound-added', 'true');
      }
    });
    
    // Make sure character cards have the right structure
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
      // Clean up character name element if needed
      const nameEl = card.querySelector('.character-name');
      if (nameEl) {
        nameEl.style.fontFamily = 'Orbitron, sans-serif';
        nameEl.style.fontSize = '18px';
        nameEl.style.color = '#FF9000';
        nameEl.style.textTransform = 'uppercase';
        nameEl.style.marginBottom = '20px';
      }
      
      // Clean up stats element if needed
      const statsEl = card.querySelector('.character-stats');
      if (statsEl) {
        statsEl.style.backgroundColor = 'transparent';
      }
    });
  }, 500);
});