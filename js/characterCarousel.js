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
        imagePath: './assets/images/characters/German Cockroach with bg.png'
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
        imagePath: './assets/images/characters/American Cockroach with bg.png'
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
        imagePath: './assets/images/characters/Oriental Cockroach with bg.png'
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

    // Initialize
    if (this.carouselContainer && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear any existing content
    this.carouselContainer.innerHTML = '';
    this.dotsContainer.innerHTML = '';
    
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
      
      // Build card content
      const imageEl = document.createElement('div');
      imageEl.className = 'character-image';
      imageEl.style.backgroundImage = `url(${character.imagePath})`;
      
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
            <div class="stat-fill" style="width: ${speed}%"></div>
          </div>
        </div>
        <div class="stat">
          <span class="stat-label">DURABILITY</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${durability}%"></div>
          </div>
        </div>
        <div class="stat">
          <span class="stat-label">STEALTH</span>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${stealth}%"></div>
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
    // Previous and next buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());
    
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
    
    // Start game button
    this.startButton.addEventListener('click', () => this.selectCurrentCharacter());
    
    // Update start button state when character changes
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
    const newIndex = this.currentIndex - 1 < 0 ? this.characters.length - 1 : this.currentIndex - 1;
    this.goToSlide(newIndex);
  }
  
  /**
   * Navigate to next slide
   */
  next() {
    if (this.isTransitioning) return;
    const newIndex = (this.currentIndex + 1) % this.characters.length;
    this.goToSlide(newIndex);
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
    
    // Set timeout for transition
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }
  
  /**
   * Update the start button state based on character lock status
   */
  updateStartButtonState() {
    const currentCharacter = this.getSelectedCharacter();
    this.startButton.disabled = !currentCharacter.unlocked;
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

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a single global instance
  window.characterCarousel = new CharacterCarousel({
    enableSounds: true
  });
});
