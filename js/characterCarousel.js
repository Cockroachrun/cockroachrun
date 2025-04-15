/**
 * CharacterCarousel - Clean, modular carousel for character selection
 * Cockroach Run Game
 */
class CharacterCarousel {
  /**
   * Initialize the character carousel
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Default configuration
    this.config = {
      wrapperSelector: '#character-carousel-wrapper',
      prevButtonSelector: '#prev-character',
      nextButtonSelector: '#next-character',
      indicatorsSelector: '#carousel-indicators',
      startButtonSelector: '#start-game-button',
      transitionDuration: 300,
      enableSounds: true,
      ...options
    };

    // Character data - single source of truth
    this.characters = [
      {
        id: 'german-roach',
        name: 'GERMAN ROACH',
        description: 'Fastest roach',
        unlocked: true,
        stats: {
          speed: 70,
          durability: 40,
          stealth: 40
        },
        imagePath: 'assets/images/characters/German Cockroach with bg.png'
      },
      {
        id: 'american-roach',
        name: 'AMERICAN ROACH',
        description: 'Strongest roach',
        unlocked: false,
        stats: {
          speed: 50,
          durability: 90,
          stealth: 30
        },
        imagePath: 'assets/images/characters/American Cockroach with bg.png'
      },
      {
        id: 'oriental-roach',
        name: 'ORIENTAL ROACH',
        description: 'Sneakiest roach',
        unlocked: false,
        stats: {
          speed: 60,
          durability: 30,
          stealth: 80
        },
        imagePath: 'assets/images/characters/Oriental Cockroach with bg.png'
      }
    ];

    // Find DOM elements
    this.carouselContainer = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.dotsContainer = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.animationTimeout = null;

    // Initialize
    if (this.carouselContainer && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found, will retry in 100ms');
      // Retry initialization after a short delay
      setTimeout(() => {
        this.carouselContainer = document.querySelector(this.config.wrapperSelector);
        this.prevButton = document.querySelector(this.config.prevButtonSelector);
        this.nextButton = document.querySelector(this.config.nextButtonSelector);
        this.dotsContainer = document.querySelector(this.config.indicatorsSelector);
        this.startButton = document.querySelector(this.config.startButtonSelector);
        
        if (this.carouselContainer && this.prevButton && this.nextButton) {
          this.init();
        } else {
          console.error('CharacterCarousel: Required elements still not found after retry');
        }
      }, 100);
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear any existing content
    this.carouselContainer.innerHTML = '';
    this.dotsContainer.innerHTML = '';
    
    // Cancel any pending animations
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    // Reset state
    this.isTransitioning = false;

    // Generate carousel cards
    this.generateCards();
    
    // Generate navigation dots
    this.generateDots();
    
    // Add event listeners
    this.addEventListeners();
    
    // Set initial state
    this.goToSlide(0, false);
    
    console.log('Character Carousel initialized');
  }

  /**
   * Generate character cards in the carousel
   */
  generateCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''}`;
      card.dataset.characterId = character.id;

      // Fix image path - ensure path is correct and add fallback
      const imagePath = character.imagePath || `assets/images/characters/${character.id}.png`;
      
      // Build card content with fixed image path
      const imageEl = document.createElement('div');
      imageEl.className = 'character-image';
      imageEl.style.backgroundImage = `url(${imagePath})`;
      
      // Add error handling for images
      const testImg = new Image();
      testImg.onerror = () => {
        console.error(`Failed to load image: ${imagePath}`);
        imageEl.style.backgroundImage = `url(assets/images/characters/default.png)`;
      };
      testImg.src = imagePath;

      const nameEl = document.createElement('h3');
      nameEl.className = 'character-name';
      nameEl.textContent = character.name;

      const descEl = document.createElement('p');
      descEl.className = 'character-description';
      descEl.textContent = character.description;

      // Create stats container
      const statsEl = document.createElement('div');
      statsEl.className = 'character-stats';

      // Add stats
      const { speed, durability, stealth } = character.stats;
      statsEl.innerHTML = `
        <div class="stat">
          <span class="stat-label">SPEED</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${speed}%;"></div>
          </div>
        </div>
        <div class="stat">
          <span class="stat-label">DURABILITY</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${durability}%;"></div>
          </div>
        </div>
        <div class="stat">
          <span class="stat-label">STEALTH</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${stealth}%;"></div>
          </div>
        </div>
      `;

      // Append all elements to card
      card.appendChild(imageEl);
      card.appendChild(nameEl);
      card.appendChild(descEl);
      card.appendChild(statsEl);

      // Add locked overlay if character is locked
      if (!character.unlocked) {
        const lockedOverlay = document.createElement('div');
        lockedOverlay.className = 'locked-overlay';
        lockedOverlay.innerHTML = `
          <span>LOCKED</span>
          <p>Connect wallet to unlock</p>
        `;
        card.appendChild(lockedOverlay);
        card.classList.add('locked');
      }

      // Add card to carousel
      this.carouselContainer.appendChild(card);
    });
  }

  /**
   * Generate navigation dots
   */
  generateDots() {
    this.characters.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.dataset.index = index;
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });
  }

  /**
   * Add all event listeners
   */
  addEventListeners() {
    // Previous and next buttons with sound
    this.prevButton.addEventListener('click', (e) => {
      // Only respond if character screen is active
      if (document.getElementById('character-selection-screen').classList.contains('active')) {
        this.playNavigationSound();
        this.prev();
        e.stopPropagation(); // Prevent event bubbling
      }
    });
    
    this.nextButton.addEventListener('click', (e) => {
      if (document.getElementById('character-selection-screen').classList.contains('active')) {
        this.playNavigationSound();
        this.next();
        e.stopPropagation();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (document.querySelector('#character-selection-screen.active')) {
        if (e.key === 'ArrowLeft') this.prev();
        else if (e.key === 'ArrowRight') this.next();
        else if (e.key === 'Enter') this.selectCurrentCharacter();
      }
    });

    // Touch support
    this.carouselContainer.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    this.carouselContainer.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    // Start button with sound
    this.startButton.addEventListener('click', () => {
      if (this.config.enableSounds && window.AudioManager) {
        window.AudioManager.playSound('ui_select');
      }
      this.selectCurrentCharacter();
    });

    // Back button with sound
    const backButton = document.getElementById('back-from-character');
    if (backButton) {
      backButton.addEventListener('click', () => {
        if (this.config.enableSounds && window.AudioManager) {
          window.AudioManager.playSound('ui_back');
        }
      });
    }

    // Update start button state
    this.updateStartButtonState();
  }

  /**
   * Handle swipe gestures
   */
  handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = this.touchEndX - this.touchStartX;
    if (swipeDistance < -swipeThreshold) {
      this.next(); // Swipe left
    } else if (swipeDistance > swipeThreshold) {
      this.prev(); // Swipe right
    }
  }

  /**
   * Navigate to previous slide
   */
  prev() {
    if (this.isTransitioning) return;
    
    // Play sound effect
    this.playNavigationSound();
    
    const newIndex = this.currentIndex - 1 < 0 ? this.characters.length - 1 : this.currentIndex - 1;
    this.goToSlide(newIndex);
  }

  /**
   * Navigate to next slide
   */
  next() {
    if (this.isTransitioning) return;
    
    // Play sound effect
    this.playNavigationSound();
    
    const newIndex = (this.currentIndex + 1) % this.characters.length;
    this.goToSlide(newIndex);
  }
  
  /**
   * Play navigation sound effect
   */
  playNavigationSound() {
    if (this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_navigation');
    }
  }

  /**
   * Go to a specific slide
   * @param {number} index - Index of the slide
   * @param {boolean} playSound - Whether to play sound
   */
  goToSlide(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;

    // Sound effect
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('navigation');
    }

    this.isTransitioning = true;

    // Get elements
    const cards = this.carouselContainer.querySelectorAll('.character-card');
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');

    // Remove active classes
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide
    cards[index].classList.add('active');
    dots[index].classList.add('active');

    // Update current index
    this.currentIndex = index;

    // Update start button state
    this.updateStartButtonState();

    // Set timeout for transition and save reference
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    
    this.animationTimeout = setTimeout(() => {
      this.isTransitioning = false;
      this.animationTimeout = null;
    }, this.config.transitionDuration);
  }

  /**
   * Update the start button state based on character lock status
   */
  updateStartButtonState() {
    const currentCharacter = this.getSelectedCharacter();
    if (this.startButton) {
      this.startButton.disabled = !currentCharacter.unlocked;
    }
  }

  /**
   * Get the currently selected character
   * @returns {Object} Character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Handle character selection and start game
   */
  selectCurrentCharacter() {
    const character = this.getSelectedCharacter();
    if (!character.unlocked) {
      if (this.config.enableSounds && window.AudioManager) {
        window.AudioManager.playSound('error');
      }
      alert('This character is locked. Connect your wallet to unlock!');
      return;
    }

    // Set the selected character in game state
    if (window.GameState) {
      window.GameState.selectedCharacter = character;
    }

    if (this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('select');
    }

    console.log('Selected character:', character.name);
    // Game logic can continue from here
  }

  /**
   * Clean up resources and event listeners when leaving the screen
   */
  cleanup() {
    console.log('Cleaning up carousel resources');
    
    // Remove any active animations or timers
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    // Reset transition state
    this.isTransitioning = false;
    
    // Optional: remove generated content to free memory
    // this.carouselContainer.innerHTML = '';
    // this.dotsContainer.innerHTML = '';
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Reinitialize to reflect changes
  }

  /**
   * Update an existing character
   * @param {string} id - Character ID
   * @param {Object} updates - Properties to update
   */
  updateCharacter(id, updates) {
    const index = this.characters.findIndex(char => char.id === id);
    if (index !== -1) {
      this.characters[index] = { ...this.characters[index], ...updates };
      this.init(); // Reinitialize to reflect changes
    }
  }

  /**
   * Unlock a character
   * @param {string} id - Character ID to unlock
   */
  unlockCharacter(id) {
    this.updateCharacter(id, { unlocked: true });
  }
}

// Multi-stage initialization to ensure carousel loads properly
function initializeCarousel() {
  console.log('Initializing character carousel');
  
  // Check if elements exist
  const wrapper = document.querySelector('#character-carousel-wrapper');
  if (!wrapper) {
    console.warn('Carousel wrapper not found, will retry in 100ms');
    setTimeout(initializeCarousel, 100);
    return;
  }
  
  // Create carousel if it doesn't exist yet
  if (!window.characterCarousel) {
    window.characterCarousel = new CharacterCarousel({
      enableSounds: true
    });
    console.log('Character carousel created');
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeCarousel);

// Fallback initialization
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeCarousel, 100);
}

// Initialize when character screen becomes active
document.addEventListener('click', function(e) {
  // Check if this click might be showing the character screen
  if (e.target && (e.target.id === 'play-button' || 
                  e.target.closest('#play-button') || 
                  e.target.id === 'start-from-mode')) {
    setTimeout(() => {
      if (document.getElementById('character-selection-screen').classList.contains('active')) {
        console.log('Character screen activated, ensuring carousel is initialized');
        initializeCarousel();
      }
    }, 100);
  }
});

// Track screen changes to manage carousel visibility
document.addEventListener('DOMContentLoaded', () => {
  // Track screen changes to manage carousel visibility
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const characterScreen = document.getElementById('character-selection-screen');
        if (characterScreen && characterScreen.classList.contains('active')) {
          console.log('Character screen activated - ensuring carousel is ready');
          if (window.characterCarousel) {
            // Refresh carousel when screen becomes active
            window.characterCarousel.init();
          } else {
            // Initialize if not already created
            window.characterCarousel = new CharacterCarousel({enableSounds: true});
          }
        }
      }
    });
  });
  
  // Observe all screen elements for class changes
  document.querySelectorAll('.screen').forEach(screen => {
    observer.observe(screen, { attributes: true });
  });

  // Track when screens become inactive
  const screenObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const target = mutation.target;
        // Check if this is the character screen becoming inactive
        if (target.id === 'character-selection-screen' && 
            !target.classList.contains('active')) {
          console.log('Character screen deactivated - cleaning up');
          if (window.characterCarousel) {
            window.characterCarousel.cleanup();
          }
        }
      }
    });
  });
  
  // Observe the character screen for class changes
  const characterScreen = document.getElementById('character-selection-screen');
  if (characterScreen) {
    screenObserver.observe(characterScreen, { attributes: true });
  }
});
