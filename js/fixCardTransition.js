/**
 * Fix for character card transition - Eliminates character "bleed-through"
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the carousel to be fully initialized
  setTimeout(function() {
    // Get the original navigation functions
    const prevArrow = document.querySelector('.carousel-prev');
    const nextArrow = document.querySelector('.carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');

    if (!prevArrow || !nextArrow) return;

    // Replace the previous arrow click handler
    prevArrow.addEventListener('click', function(e) {
      // Stop any existing event
      e.stopPropagation();
      
      // Play sound
      if (window.AudioManager) {
        AudioManager.playButtonClick();
      }
      
      // Find the currently active card
      const cards = document.querySelectorAll('.character-card');
      let activeCard = null;
      let activeIndex = -1;
      
      cards.forEach((card, index) => {
        if (card.classList.contains('active')) {
          activeCard = card;
          activeIndex = index;
        }
      });
      
      if (!activeCard) return;
      
      // Calculate the previous index
      const prevIndex = (activeIndex - 1 + cards.length) % cards.length;
      const newCard = cards[prevIndex];
      
      // IMPORTANT: First hide the current card completely
      // Remove transition to make it instant
      activeCard.style.transition = 'none';
      activeCard.style.opacity = '0';
      activeCard.style.visibility = 'hidden';
      
      // Use a slight delay to ensure it's fully hidden
      setTimeout(() => {
        // Remove active class
        activeCard.classList.remove('active');
        
        // Make the new card active but still hidden
        newCard.classList.add('active');
        newCard.style.transition = 'none';
        newCard.style.opacity = '0';
        newCard.style.visibility = 'hidden';
        
        // Force browser to process the above changes
        void newCard.offsetWidth;
        
        // Now show the new card with transition
        newCard.style.transition = 'opacity 0.15s ease';
        newCard.style.opacity = '1';
        newCard.style.visibility = 'visible';
        
        // Update indicator dots
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === prevIndex);
        });
      }, 50);
    }, true);
    
    // Replace the next arrow click handler (same logic as prev but for next)
    nextArrow.addEventListener('click', function(e) {
      // Stop any existing event
      e.stopPropagation();
      
      // Play sound
      if (window.AudioManager) {
        AudioManager.playButtonClick();
      }
      
      // Find the currently active card
      const cards = document.querySelectorAll('.character-card');
      let activeCard = null;
      let activeIndex = -1;
      
      cards.forEach((card, index) => {
        if (card.classList.contains('active')) {
          activeCard = card;
          activeIndex = index;
        }
      });
      
      if (!activeCard) return;
      
      // Calculate the next index
      const nextIndex = (activeIndex + 1) % cards.length;
      const newCard = cards[nextIndex];
      
      // IMPORTANT: First hide the current card completely
      // Remove transition to make it instant
      activeCard.style.transition = 'none';
      activeCard.style.opacity = '0';
      activeCard.style.visibility = 'hidden';
      
      // Use a slight delay to ensure it's fully hidden
      setTimeout(() => {
        // Remove active class
        activeCard.classList.remove('active');
        
        // Make the new card active but still hidden
        newCard.classList.add('active');
        newCard.style.transition = 'none';
        newCard.style.opacity = '0';
        newCard.style.visibility = 'hidden';
        
        // Force browser to process the above changes
        void newCard.offsetWidth;
        
        // Now show the new card with transition
        newCard.style.transition = 'opacity 0.15s ease';
        newCard.style.opacity = '1';
        newCard.style.visibility = 'visible';
        
        // Update indicator dots
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === nextIndex);
        });
      }, 50);
    }, true);
    
    // Fix dots click handlers too
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function(e) {
        // Stop any existing event
        e.stopPropagation();
        
        // Play sound
        if (window.AudioManager) {
          AudioManager.playButtonClick();
        }
        
        // Find the currently active card
        const cards = document.querySelectorAll('.character-card');
        let activeCard = null;
        let activeIndex = -1;
        
        cards.forEach((card, index) => {
          if (card.classList.contains('active')) {
            activeCard = card;
            activeIndex = index;
          }
        });
        
        if (!activeCard || activeIndex === dotIndex) return;
        
        const newCard = cards[dotIndex];
        
        // IMPORTANT: First hide the current card completely
        // Remove transition to make it instant
        activeCard.style.transition = 'none';
        activeCard.style.opacity = '0';
        activeCard.style.visibility = 'hidden';
        
        // Use a slight delay to ensure it's fully hidden
        setTimeout(() => {
          // Remove active class
          activeCard.classList.remove('active');
          
          // Make the new card active but still hidden
          newCard.classList.add('active');
          newCard.style.transition = 'none';
          newCard.style.opacity = '0';
          newCard.style.visibility = 'hidden';
          
          // Force browser to process the above changes
          void newCard.offsetWidth;
          
          // Now show the new card with transition
          newCard.style.transition = 'opacity 0.15s ease';
          newCard.style.opacity = '1';
          newCard.style.visibility = 'visible';
          
          // Update indicator dots
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === dotIndex);
          });
        }, 50);
      }, true);
    });
  }, 500);
});
