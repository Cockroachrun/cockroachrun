/**
 * Fix for event handling bugs in character carousel
 */
document.addEventListener('DOMContentLoaded', function() {
  // Run this after a delay to make sure it applies after other scripts
  setTimeout(function() {
    // Check if our fix has already been applied
    if (window._fixedEvents) return;
    window._fixedEvents = true;
    
    // Create clean event listeners for arrow navigation
    const prevArrow = document.querySelector('.carousel-prev');
    const nextArrow = document.querySelector('.carousel-next');
    
    if (prevArrow && nextArrow) {
      // Clone the buttons to remove all existing event listeners
      const newPrevArrow = prevArrow.cloneNode(true);
      const newNextArrow = nextArrow.cloneNode(true);
      
      // Replace the buttons in the DOM
      if (prevArrow.parentNode) {
        prevArrow.parentNode.replaceChild(newPrevArrow, prevArrow);
      }
      if (nextArrow.parentNode) {
        nextArrow.parentNode.replaceChild(newNextArrow, nextArrow);
      }
      
      // Add single event listeners for the new buttons
      newPrevArrow.addEventListener('click', function() {
        // Play sound first
        if (window.AudioManager) {
          AudioManager.playButtonClick();
        }
        
        // Find all cards and active index
        const cards = document.querySelectorAll('.character-card');
        let activeIndex = -1;
        cards.forEach((card, index) => {
          if (card.classList.contains('active')) {
            activeIndex = index;
          }
        });
        
        if (activeIndex === -1) return;
        
        // Calculate previous index
        const prevIndex = (activeIndex - 1 + cards.length) % cards.length;
        
        // Hide current card instantly
        cards[activeIndex].style.transition = 'none';
        cards[activeIndex].style.opacity = '0';
        cards[activeIndex].style.visibility = 'hidden';
        
        // After a slight delay, show the new card
        setTimeout(function() {
          // Update classes
          cards[activeIndex].classList.remove('active');
          cards[prevIndex].classList.add('active');
          
          // Show the new card
          cards[prevIndex].style.opacity = '1';
          cards[prevIndex].style.visibility = 'visible';
          
          // Update dots
          document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === prevIndex);
          });
        }, 50);
      });
      
      newNextArrow.addEventListener('click', function() {
        // Play sound first
        if (window.AudioManager) {
          AudioManager.playButtonClick();
        }
        
        // Find all cards and active index
        const cards = document.querySelectorAll('.character-card');
        let activeIndex = -1;
        cards.forEach((card, index) => {
          if (card.classList.contains('active')) {
            activeIndex = index;
          }
        });
        
        if (activeIndex === -1) return;
        
        // Calculate next index
        const nextIndex = (activeIndex + 1) % cards.length;
        
        // Hide current card instantly
        cards[activeIndex].style.transition = 'none';
        cards[activeIndex].style.opacity = '0';
        cards[activeIndex].style.visibility = 'hidden';
        
        // After a slight delay, show the new card
        setTimeout(function() {
          // Update classes
          cards[activeIndex].classList.remove('active');
          cards[nextIndex].classList.add('active');
          
          // Show the new card
          cards[nextIndex].style.opacity = '1';
          cards[nextIndex].style.visibility = 'visible';
          
          // Update dots
          document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === nextIndex);
          });
        }, 50);
      });
    }
  }, 1000);  // Increased delay to make sure it runs after all other scripts
});
