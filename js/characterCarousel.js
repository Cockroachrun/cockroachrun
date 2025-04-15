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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
 * Character Carousel - A modular, configurable carousel for character selection
 * @description Provides a single source of truth for character data and implements
 * a clean, maintainable carousel UI for character selection.
 */
class CharacterCarousel {
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      containerSelector: '#character-carousel',
      dotsContainerSelector: '#carousel-dots',
      infoContainerSelector: '#character-info',
      prevButtonSelector: '#prev-character',
      nextButtonSelector: '#next-character',
      cardClass: 'carousel-card',
      activeCardClass: 'active',
      dotClass: 'carousel-dot',
      activeDotClass: 'active',
      animationDuration: 400, // milliseconds
      playSound: true,
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
        imageClass: 'default-roach',
        imageSrc: './assets/images/characters/German Cockroach with bg.png'
      },
      {
        id: 'american-roach',
        name: 'AMERICAN ROACH',
        description: 'Strongest roach',
        unlocked: false,
        stats: {
          speed: 50,
          durability: 50,
          stealth: 30
        },
        imageClass: 'stealth-roach',
        imageSrc: './assets/images/characters/American Cockroach with bg.png'
      },
      {
        id: 'oriental-roach',
        name: 'ORIENTAL ROACH',
        description: 'Sneakiest roach',
        unlocked: false,
        stats: {
          speed: 60,
          durability: 40,
          stealth: 80
        },
        imageClass: 'glider-roach',
        imageSrc: './assets/images/characters/Oriental Cockroach with bg.png'
      }
    ];
    
    // State
    this.currentIndex = 0;
    this.carouselContainer = document.querySelector(this.config.containerSelector);
    this.dotsContainer = document.querySelector(this.config.dotsContainerSelector);
    this.infoContainer = document.querySelector(this.config.infoContainerSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    
    // Don't initialize if any required element is missing
    if (!this.carouselContainer || !this.dotsContainer || !this.infoContainer || 
        !this.prevButton || !this.nextButton) {
      console.error('Character Carousel: Required elements not found');
      return;
    }
    
    this.init();
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Generate character cards
   */
  generateCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `${this.config.cardClass} ${index === 0 ? this.config.activeCardClass : ''}`;
      if (!character.unlocked) {
        card.classList.add('locked');
      }
      card.dataset.index = index;
      card.dataset.character = character.id;
      
      card.innerHTML = `
        <div class="character-image ${character.imageClass}" 
             style="background-image: url('${character.imageSrc}');">
        </div>
        <h3>${character.name}</h3>
        <p>${character.description}</p>
        <div class="stats">
          <div class="stat">
            <span>SPEED</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${character.stats.speed}%;"></div>
            </div>
          </div>
          <div class="stat">
            <span>DURABILITY</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${character.stats.durability}%;"></div>
            </div>
          </div>
          <div class="stat">
            <span>STEALTH</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${character.stats.stealth}%;"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class="locked-overlay">
            <span>LOCKED</span>
            <p>Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;
      
      this.carouselContainer.appendChild(card);
    });
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Generate navigation dots
   */
  generateDots() {
    this.characters.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `${this.config.dotClass} ${index === 0 ? this.config.activeDotClass : ''}`;
      dot.dataset.index = index;
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Add event listeners for carousel navigation
   */
  addEventListeners() {
    // Previous button click
    this.prevButton.addEventListener('click', () => {
      this.goToSlide(this.currentIndex - 1);
    });
    
    // Next button click
    this.nextButton.addEventListener('click', () => {
      this.goToSlide(this.currentIndex + 1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Only handle keys when character selection screen is active
      const characterScreen = document.getElementById('character-selection-screen');
      if (!characterScreen || !characterScreen.classList.contains('active')) {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        this.goToSlide(this.currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        this.goToSlide(this.currentIndex + 1);
      }
    });
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.carouselContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.carouselContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
    
    const handleSwipe = () => {
      const swipeThreshold = 50; // minimum distance for swipe
      
      if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left (next)
        this.goToSlide(this.currentIndex + 1);
      } else if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right (previous)
        this.goToSlide(this.currentIndex - 1);
      }
    };
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Navigate to a specific slide
   * @param {number} index - Target slide index
   * @param {boolean} playSound - Whether to play navigation sound
   */
  goToSlide(index, playSound = true) {
    // Handle wrapping
    if (index < 0) {
      index = this.characters.length - 1;
    } else if (index >= this.characters.length) {
      index = 0;
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Update transform
    this.carouselContainer.style.transform = `translateX(-${index * 100}%)`;
    
    // Update active classes on cards and dots
    const cards = this.carouselContainer.querySelectorAll(`.${this.config.cardClass}`);
    const dots = this.dotsContainer.querySelectorAll(`.${this.config.dotClass}`);
    
    cards.forEach((card, i) => {
      card.classList.toggle(this.config.activeCardClass, i === index);
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle(this.config.activeDotClass, i === index);
    });
    
    // Update selection in the GameState
    if (window.GameState) {
      window.GameState.selectedCharacter = this.characters[index].id;
    }
    
    // Update info display
    this.updateInfoDisplay();
    
    // Play sound if enabled
    if (playSound && this.config.playSound && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Update the character info display
   */
  updateInfoDisplay() {
    const character = this.characters[this.currentIndex];
    
    // You can customize what information is shown here
    this.infoContainer.innerHTML = `
      <h3>${character.name}</h3>
      <p>${character.description}</p>
    `;
    
    // Update the start button state based on whether character is locked
    const startButton = document.getElementById('start-game-button');
    if (startButton) {
      if (character.unlocked) {
        startButton.removeAttribute('disabled');
        startButton.style.opacity = '1';
      } else {
        startButton.setAttribute('disabled', 'true');
        startButton.style.opacity = '0.5';
      }
    }
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    // Add to characters array
    this.characters.push(character);
    
    // Regenerate carousel
    this.init();
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Update an existing character
   * @param {string} characterId - ID of the character to update
   * @param {Object} updates - Properties to update
   */
  updateCharacter(characterId, updates) {
    const index = this.characters.findIndex(char => char.id === characterId);
    if (index !== -1) {
      this.characters[index] = { ...this.characters[index], ...updates };
      this.init();
    }
  }
  
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
*
   * Get the currently selected character
   * @returns {Object} Selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }
}

// Initialize the carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for AudioManager to be available, or initialize without sound
  window.characterCarousel = new CharacterCarousel({
    playSound: !!window.AudioManager
  });
});

            // Create carousel HTML
            const carouselHTML = `
                <div class="character-carousel">
                    <button class="carousel-nav prev-button">&lt;</button>
                    
                    <div class="character-card-container">
                        ${Array.from(characterCards).map((card, index) => {
                            return `<div class="character-card ${index === 0 ? "active selected" : ""} ${card.classList.contains("locked") ? "locked" : ""}" 
                                      data-character="${card.getAttribute("data-character")}">
                                ${card.innerHTML}
                            </div>`;
                        }).join("")}
                    </div>
                    
                    <button class="carousel-nav next-button">&gt;</button>
                </div>
                
                <div class="menu-buttons" style="margin-top: -20px; width: 100%;">
                    <button id="start-game-button" class="menu-button orange-hover">START GAME</button>
                    <button id="back-from-character" class="menu-button orange-hover">BACK</button>
                </div>
            `;
            
            // Apply carousel HTML
            characterSelection.innerHTML = carouselHTML;
            
            // Add carousel styles
            const styleSheet = document.createElement("style");
            styleSheet.id = "carousel-styles";
            styleSheet.textContent = `
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Lift up the carousel */
                .character-carousel {
                    margin-top: -30px;
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Responsive menu button styles */
                @media (max-width: 480px) {
                    #character-selection-screen .menu-button {
                        padding: 12px 20px;
                        font-size: 16px;
                        min-width: 140px;
                        margin: 10px auto;
                        position: relative;
                        z-index: 1000;
                        pointer-events: auto;
                        display: block;
                        touch-action: manipulation;
                    }
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Ensure buttons are clickable */
                .menu-button {
                    position: relative;
                    z-index: 1000;
                    pointer-events: auto;
                    cursor: pointer;
                    touch-action: manipulation;
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Orange border on hover and active states */
                .orange-hover {
                    transition: all 0.2s ease;
                }
                
                .orange-hover:hover {
                    border: 2px solid #FF9000 !important;
                    box-shadow: 0 0 10px rgba(255, 144, 0, 0.7) !important;
                    transform: translateY(-2px);
                }
                
                .orange-hover:active {
                    border: 2px solid #FF9000 !important;
                    box-shadow: 0 0 15px rgba(255, 144, 0, 0.9) !important;
                    transform: translateY(1px);
                }
                
                .character-carousel {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4%;
                    margin: 5% 0;
                    position: relative;
                    padding: 2% 0;
                    width: 100%;
                    max-width: 600px;
                }
                
                .carousel-nav {
                    width: 12%;
                    max-width: 50px;
                    aspect-ratio: 1/1;
                    border-radius: 50%;
                    background-color: rgba(0,0,0,0.9);
                    color: var(--orange);
                    font-size: clamp(18px, 4vw, 24px);
                    border: 2px solid var(--orange);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 5;
                    transition: all var(--transition-fast);
                }
                
                .carousel-nav:hover {
                    background-color: var(--orange);
                    color: black;
                    transform: scale(1.1);
                }
                
                .character-card-container {
                    position: relative;
                    width: 60%;
                    max-width: 300px;
                    aspect-ratio: 3/4;
                }
                
                .character-carousel .character-card {
                    background-color: rgba(0, 0, 0, 0.85);
                    border: 2px solid var(--orange);
                    border-radius: var(--radius-md);
                    padding: 5% 5%;
                    width: 100%;
                    height: 100%;
                    min-height: 100%;
                    transition: all var(--transition-normal);
                    cursor: pointer;
                    position: absolute;
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    opacity: 0;
                    visibility: hidden;
                    box-shadow: 0 0 20px rgba(255, 144, 0, 0.3);
                    overflow: hidden;
                }
                
                .character-carousel .character-card.active {
                    opacity: 1;
                    visibility: visible;
                    z-index: 2;
                }
                
                .character-carousel .character-image {
                    width: 45%;
                    aspect-ratio: 1/1;
                    max-width: 150px;
                    filter: none;
                    margin-bottom: 3%;
                    margin-top: 5%;
                    display: block;
                }
                
                .character-carousel .character-card h3 {
                    font-size: var(--text-2xl);
                    letter-spacing: 2px;
                    text-shadow: 0 0 5px rgba(255, 144, 0, 0.5);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    width: 100%;
                    text-align: center;
                }
                
                .character-carousel .character-card p {
                    color: var(--orange);
                    margin-bottom: 2%;
                    text-align: center;
                    font-size: var(--text-sm);
                }
                
                .carousel-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1vh;
                    margin-top: 0;
                    width: 100%;
                    pointer-events: auto;
                    position: relative;
                    z-index: 50;
                    margin-bottom: 5vh;
                }
                
                .carousel-footer .start-button {
                    font-size: var(--text-lg);
                    padding: 0.5rem 1rem;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 1px solid var(--orange);
                    width: auto;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    color: var(--orange);
                    text-transform: uppercase;
                    border-radius: var(--radius-sm);
                    white-space: nowrap;
                }
                
                .carousel-footer .back-button {
                    font-size: var(--text-md);
                    padding: 0.4rem 1rem;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 1px solid var(--orange);
                    width: auto;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    color: var(--orange);
                    text-transform: uppercase;
                    margin-top: 0.5vh;
                    border-radius: var(--radius-sm);
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Stat bars styling - with responsive scaling */
                .character-carousel .character-card .stats {
                    width: 90%;
                    margin-top: 2%;
                    margin-bottom: 5%;
                    flex-shrink: 0;
                    max-width: 100%;
                    padding: 0 5%;
                }
                
                .character-carousel .stat {
                    margin-bottom: clamp(4px, 1.5vw, 8px);
                    width: 100%;
                }
                
                .character-carousel .stat span {
                    color: var(--orange);
                    margin-bottom: clamp(1px, 0.5vw, 3px);
                    font-weight: bold;
                    display: block;
                    font-family: var(--font-heading);
                    font-size: clamp(10px, 2.5vw, 14px);
                    letter-spacing: 0.5px;
                }
                
                .character-carousel .stat-bar {
                    height: clamp(3px, 1vw, 6px);
                    background-color: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(60, 60, 60, 0.8);
                    border-radius: 3px;
                    overflow: hidden;
                    width: 100%;
                }
                
                .character-carousel .stat-fill {
                    background-color: var(--orange);
                    height: 100%;
                    transition: width 0.3s ease;
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Responsive adjustments for different screen sizes */
                @media (max-width: 768px) {
                    .character-carousel .character-card h3 {
                        font-size: var(--text-lg);
                        margin-bottom: 5px;
                    }
                    
                    .character-carousel .character-card p {
                        font-size: var(--text-xs);
                        margin-bottom: 3%;
                    }
                    
                    .character-carousel .character-image {
                        margin-bottom: 5%;
                    }
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Small screen adjustments */
                @media (max-width: 480px) {
                    .character-carousel .character-card .stats {
                        width: 100%;
                        padding: 0 2%;
                    }
                    
                    .character-carousel .stat span {
                        font-size: 10px;
                    }
                    
                    .character-carousel .stat-bar {
                        height: 3px;
                    }
                }
                
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
          durability: 50,
          stealth: 90
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
    this.wrapper = document.querySelector(this.config.wrapperSelector);
    this.prevButton = document.querySelector(this.config.prevButtonSelector);
    this.nextButton = document.querySelector(this.config.nextButtonSelector);
    this.indicators = document.querySelector(this.config.indicatorsSelector);
    this.startButton = document.querySelector(this.config.startButtonSelector);

    // State
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Initialize
    if (this.wrapper && this.prevButton && this.nextButton) {
      this.init();
    } else {
      console.error('CharacterCarousel: Required elements not found');
    }
  }

  /**
   * Initialize the carousel
   */
  init() {
    // Clear previous content
    this.wrapper.innerHTML = '';
    this.indicators.innerHTML = '';

    // Create character cards
    this.createCharacterCards();
    
    // Create indicators
    this.createIndicators();

    // Set up event listeners
    this.setupEventListeners();

    // Show the first character
    this.showCharacter(0, false);

    console.log('CharacterCarousel initialized with', this.characters.length, 'characters');
  }

  /**
   * Create character cards in the DOM
   */
  createCharacterCards() {
    this.characters.forEach((character, index) => {
      const card = document.createElement('div');
      card.className = `character-card ${index === 0 ? 'active' : ''} ${!character.unlocked ? 'locked' : ''}`;
      card.id = `character-${character.id}`;
      card.dataset.index = index;

      // Card content
      card.innerHTML = `
        <div class=\"character-image\" style=\"background-image: url('${character.imagePath}')\"></div>
        <h3 class=\"character-name\">${character.name}</h3>
        <p class=\"character-description\">${character.description}</p>
        <div class=\"character-stats\">
          <div class=\"stat\">
            <span class=\"stat-label\">SPEED</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.speed}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">DURABILITY</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.durability}%\"></div>
            </div>
          </div>
          <div class=\"stat\">
            <span class=\"stat-label\">STEALTH</span>
            <div class=\"stat-bar\">
              <div class=\"stat-fill\" style=\"width: ${character.stats.stealth}%\"></div>
            </div>
          </div>
        </div>
        ${!character.unlocked ? `
          <div class=\"locked-overlay\">
            <span class=\"locked-label\">LOCKED</span>
            <p class=\"unlock-text\">Connect wallet to unlock</p>
          </div>
        ` : ''}
      `;

      this.wrapper.appendChild(card);
    });
  }

  /**
   * Create indicator dots for navigation
   */
  createIndicators() {
    this.characters.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicator.addEventListener('click', () => this.showCharacter(index));
      this.indicators.appendChild(indicator);
    });
  }

  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    this.prevButton.addEventListener('click', () => this.prev());
    this.nextButton.addEventListener('click', () => this.next());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!document.getElementById('character-selection-screen').classList.contains('active')) {
        return; // Only respond when character selection screen is active
      }
      
      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    this.wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    this.wrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const difference = touchStartX - touchEndX;
      
      // Detect swipe (with a threshold)
      if (Math.abs(difference) > 30) {
        if (difference > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Update start button state based on character unlock status
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        const currentCharacter = this.getSelectedCharacter();
        if (currentCharacter && currentCharacter.unlocked) {
          // Start the game with selected character
          if (window.GameState) {
            window.GameState.selectedCharacter = currentCharacter.id;
          }
          console.log(`Starting game with ${currentCharacter.name}`);
        }
      });
    }
  }

  /**
   * Navigate to the previous character
   */
  prev() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === 0 ? 
      this.characters.length - 1 : this.currentIndex - 1;
    this.showCharacter(newIndex);
  }

  /**
   * Navigate to the next character
   */
  next() {
    if (this.isTransitioning) return;
    
    const newIndex = this.currentIndex === this.characters.length - 1 ? 
      0 : this.currentIndex + 1;
    this.showCharacter(newIndex);
  }

  /**
   * Show a specific character
   * @param {number} index - Index of the character to show
   * @param {boolean} playSound - Whether to play a sound effect
   */
  showCharacter(index, playSound = true) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    
    // Get all cards and indicators
    const cards = this.wrapper.querySelectorAll('.character-card');
    const dots = this.indicators.querySelectorAll('.carousel-indicator');
    
    // Hide current card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.remove('active');
    }
    
    // Update indicators
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.remove('active');
    }
    
    // Update current index
    this.currentIndex = index;
    
    // Show new card
    if (cards[this.currentIndex]) {
      cards[this.currentIndex].classList.add('active');
    }
    
    // Update indicator
    if (dots[this.currentIndex]) {
      dots[this.currentIndex].classList.add('active');
    }
    
    // Update start button state
    if (this.startButton) {
      const character = this.characters[this.currentIndex];
      this.startButton.disabled = !character.unlocked;
      this.startButton.style.opacity = character.unlocked ? '1' : '0.5';
    }
    
    // Play sound if enabled
    if (playSound && this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_click');
    }
    
    // Clear transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.config.transitionDuration);
  }

  /**
   * Get the currently selected character
   * @returns {Object} The selected character data
   */
  getSelectedCharacter() {
    return this.characters[this.currentIndex];
  }

  /**
   * Add a new character to the carousel
   * @param {Object} character - Character data object
   */
  addCharacter(character) {
    this.characters.push(character);
    this.init(); // Rebuild the carousel
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
      this.init(); // Rebuild the carousel
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
 Extra small screen adjustments */
                @media (max-width: 320px) {
                    .character-carousel .stat {
                        margin-bottom: 2px;
                    }
                }
            `;
            
            // Add styles to document
            document.head.appendChild(styleSheet);
            
            // Set up carousel functionality
            const cardContainer = document.querySelector(".character-card-container");
            const cards = document.querySelectorAll(".character-card-container .character-card");
            const prevButton = document.querySelector(".prev-button");
            const nextButton = document.querySelector(".next-button");
            const startButton = document.getElementById("start-game-button");
            const backButton = document.getElementById("back-from-character");
            
            // Add button functionality
            if (startButton) {
                const handleStartGame = function(e) {
                    if (e) e.preventDefault();
                    try {
                        // Get selected character
                        const activeCard = document.querySelector(".character-card.active");
                        if (!activeCard) return;
                        
                        const selectedCharacter = activeCard.getAttribute("data-character");
                        console.log("Selected character:", selectedCharacter);
                        
                        // Store selection
                        if (window.localStorage) {
                            localStorage.setItem("selectedCharacter", selectedCharacter);
                        }
                        
                        // Try multiple approaches to start the game
                        if (originalStartButton && typeof originalStartButton.click === "function") {
                            originalStartButton.click();
                            return;
                        }
                        
                        if (originalStartFunction) {
                            originalStartFunction.call(originalStartButton || startButton);
                            return;
                        }
                        
                        // Fallback: toggle screens
                        document.getElementById("character-selection-screen").classList.remove("active");
                        const gameScreen = document.getElementById("game-screen");
                        if (gameScreen) {
                            gameScreen.classList.add("active");
                        }
                    } catch (e) {
                        console.error("Error starting game:", e);
                    }
                };
                
                // Add event listeners
                startButton.addEventListener("click", function(e) {
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    handleStartGame(e);
                });
                startButton.addEventListener("touchend", function(e) {
                    e.preventDefault();
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    handleStartGame(e);
                });
                
                // Make clickable
                startButton.style.position = "relative";
                startButton.style.zIndex = "100";
            }
            
            if (backButton) {
                const handleBack = function(e) {
                    if (e) e.preventDefault();
                    
                    if (originalBackFunction) {
                        originalBackFunction.call(backButton, e);
                        return;
                    }
                    
                    // Fallback: toggle screens
                    document.getElementById("character-selection-screen").classList.remove("active");
                    document.getElementById("mode-selection-screen").classList.add("active");
                };
                
                // Add event listeners
                backButton.addEventListener("click", function(e) {
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    handleBack(e);
                });
                backButton.addEventListener("touchend", function(e) {
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    handleBack(e);
                });
                
                // Make clickable
                backButton.style.position = "relative";
                backButton.style.zIndex = "100";
            }
            
            // Navigation function
            let currentCardIndex = 0;
            
            function showCard(index) {
                // Hide all cards
                cards.forEach(card => card.classList.remove("active"));
                
                // Show current card
                cards[index].classList.add("active");
                
                // Update index
                currentCardIndex = index;
            }
            
            // Initialize with first card
            showCard(0);
            
            // Navigation events
            if (prevButton) {
                prevButton.addEventListener("click", () => {
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    const newIndex = (currentCardIndex - 1 + cards.length) % cards.length;
                    showCard(newIndex);
                });
            }
            
            if (nextButton) {
                nextButton.addEventListener("click", () => {
                    // Play button click sound directly
                    AudioManager.playButtonClick();
                    const newIndex = (currentCardIndex + 1) % cards.length;
                    showCard(newIndex);
                });
            }
            
        } catch (error) {
            console.error("Error setting up carousel:", error);
            
            // Restore original HTML on error
            characterSelection.innerHTML = originalHTML;
            
            // Show original buttons again
            if (originalButtonRow) {
                originalButtonRow.style.display = "";
            }
        }
    } catch (error) {
        console.error("Failed to initialize character carousel:", error);
    }
}
