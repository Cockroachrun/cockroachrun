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
      
      // Add 3D toggle button
      const threeDButton = document.createElement('button');
      threeDButton.className = 'three-d-toggle';
      threeDButton.textContent = '3D';
      threeDButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle3DView(character.id);
      });
      
      // Create image container with 3D button
      const imageContainer = document.createElement('div');
      imageContainer.className = 'character-image-container';
      
      // Image element
      const imageEl = document.createElement('div');
      imageEl.className = 'character-image';
      
      // Set image with reliable path format
      let imageSrc = '';
      switch(character.id) {
        case 'german-roach':
          imageSrc = 'assets/images/characters/German_Roach.png';
          break;
        case 'american-roach':
          imageSrc = 'assets/images/characters/American_Roach.png';
          break;
        case 'oriental-roach':
          imageSrc = 'assets/images/characters/Oriental_Roach.png';
          break;
        default:
          imageSrc = 'assets/images/characters/default-roach.png';
      }
      
      // Set image with absolute path
      imageEl.style.backgroundImage = `url('${imageSrc}')`;
      
      // Debug image loading
      console.log(`Attempting to load image: ${imageSrc}`);
      
      // Test image loading with explicit element
      const testImg = new Image();
      testImg.onload = () => {
        console.log(`Successfully loaded image: ${imageSrc}`);
      };
      testImg.onerror = () => {
        console.error(`Failed to load image: ${imageSrc}`);
        // Try alternate path format with underscores instead of spaces
        const altSrc = character.imagePath ? character.imagePath.replace(/ /g, '_') : '';
        console.log(`Trying alternate path: ${altSrc}`);
        imageEl.style.backgroundImage = `url('${altSrc}')`;
        
        // If that also fails, use a colored placeholder
        const finalTestImg = new Image();
        finalTestImg.onerror = () => {
          console.error(`Failed to load any image for ${character.name}`);
          // Set a colored background as fallback
          imageEl.style.backgroundImage = 'none';
          imageEl.style.backgroundColor = '#663300';
          
          // Add a simple cockroach SVG as content
          imageEl.innerHTML = `
            <svg viewBox="0 0 100 100" width="80" height="80" fill="#FF9000">
              <path d="M50 20 L60 10 L55 25 L70 30 L55 40 L60 70 L50 60 L40 70 L45 40 L30 30 L45 25 L40 10 Z" />
            </svg>
          `;
        };
        finalTestImg.src = altSrc;
      };
      testImg.src = imageSrc;

      // Add elements to container
      imageContainer.appendChild(imageEl);
      imageContainer.appendChild(threeDButton);
      
      // Create name with proper styling
      const nameEl = document.createElement('h3');
      nameEl.className = 'character-name';
      nameEl.textContent = character.name.toUpperCase().replace('ROACH', 'COCKROACH');
      
      // Create stats with improved styling
      const statsEl = document.createElement('div');
      statsEl.className = 'character-stats';
      
      // Add stats with proper styling
      const { speed, durability, stealth } = character.stats;
      statsEl.innerHTML = `
        <div class="stat">
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${speed}%;"></div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${durability}%;"></div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${stealth}%;"></div>
          </div>
        </div>
      `;

      // Append elements to card
      card.appendChild(imageContainer);
      card.appendChild(nameEl);
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
  
  /**
   * Toggle 3D view for a character
   * @param {string} characterId - ID of the character to toggle 3D view
   */
  toggle3DView(characterId) {
    console.log(`Toggling 3D view for ${characterId}`);
    
    // Get the character card
    const card = document.querySelector(`.character-card[data-character-id="${characterId}"]`);
    if (!card) return;
    
    // Toggle 3D view class
    card.classList.toggle('show-3d-view');
    
    // If showing 3D view, load the 3D model
    if (card.classList.contains('show-3d-view')) {
      const imageContainer = card.querySelector('.character-image-container');
      
      // Create 3D view container if it doesn't exist
      let threeDContainer = card.querySelector('.three-d-container');
      if (!threeDContainer) {
        threeDContainer = document.createElement('div');
        threeDContainer.className = 'three-d-container';
        imageContainer.appendChild(threeDContainer);
        
        // Here you would load your 3D model
        // This is a placeholder - you'll need to implement the actual 3D loading
        threeDContainer.innerHTML = `
          <div class="three-d-placeholder">
            <p>3D Model Loading...</p>
            <p>ID: ${characterId}</p>
          </div>
        `;
        
        // Play sound if available
        if (this.config.enableSounds && window.AudioManager) {
          window.AudioManager.playSound('ui_special');
        }
      }
    }
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
