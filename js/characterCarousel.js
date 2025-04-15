/**
 * Character Carousel Component for Cockroach Run
 */
const CharacterCarousel = {
  // Current character index
  currentIndex: 0,
  
  // Character data
  characters: [
    {
      name: "AMERICAN COCKROACH",
      image: "assets/images/characters/American Cockroach with bg.png",
      stats: {
        speed: 75,
        durability: 60,
        stealth: 80,
        climbing: 65,
        agility: 70,
        burrowing: 55
      }
    },
    {
      name: "GERMAN COCKROACH",
      image: "assets/images/characters/German Cockroach.png",
      stats: {
        speed: 85,
        durability: 50,
        stealth: 75,
        climbing: 60,
        agility: 90,
        burrowing: 40
      }
    },
    {
      name: "ORIENTAL COCKROACH",
      image: "assets/images/characters/Oriental Cockroach.png",
      stats: {
        speed: 65,
        durability: 80,
        stealth: 70,
        climbing: 50,
        agility: 60,
        burrowing: 85
      }
    }
  ],
  
  /**
   * Initialize the carousel
   */
  init() {
    console.log('Initializing character carousel');
    // Create the carousel structure
    this.createCarousel();
    // Add event listeners for navigation
    this.setupEventListeners();
    // Show the first character
    setTimeout(() => this.showCharacter(0), 100);
  },
  
  /**
   * Create the carousel structure
   */
  createCarousel() {
    console.log('Creating carousel structure');
    const wrapper = document.querySelector('.carousel-wrapper');
    if (!wrapper) {
      console.error('Carousel wrapper not found');
      return;
    }
    
    // Clear any existing content
    wrapper.innerHTML = '';
    
    // Create character cards
    this.characters.forEach((character, index) => {
      // Create card
      const card = document.createElement('div');
      card.className = 'character-card';
      card.dataset.index = index;
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'character-image-container';
      
      // Create character image
      const img = document.createElement('img');
      img.src = character.image;
      img.alt = character.name;
      imageContainer.appendChild(img);
      
      // Add 3D toggle button
      const threeDToggle = document.createElement('button');
      threeDToggle.className = 'three-d-toggle';
      threeDToggle.textContent = '3D';
      threeDToggle.onclick = () => this.toggle3DView(index, true);
      imageContainer.appendChild(threeDToggle);
      
      // Add 2D toggle button
      const twoDToggle = document.createElement('button');
      twoDToggle.className = 'three-d-toggle two-d-toggle';
      twoDToggle.textContent = '2D';
      twoDToggle.onclick = () => this.toggle3DView(index, false);
      imageContainer.appendChild(twoDToggle);
      
      // Add 3D container
      const threeDContainer = document.createElement('div');
      threeDContainer.className = 'three-d-container';
      threeDContainer.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
      
      // Create character name
      const name = document.createElement('h3');
      name.className = 'character-name';
      name.textContent = character.name;
      
      // Create stats container
      const statsContainer = document.createElement('div');
      statsContainer.className = 'character-stats';
      
      // Add all 6 stats
      Object.entries(character.stats).forEach(([statName, value]) => {
        const stat = document.createElement('div');
        stat.className = 'stat';
        
        const statLabel = document.createElement('div');
        statLabel.className = 'stat-label';
        statLabel.innerHTML = `${statName.toUpperCase()} <span>${value}%</span>`;
        
        const statBar = document.createElement('div');
        statBar.className = 'stat-bar';
        
        const statFill = document.createElement('div');
        statFill.className = 'stat-fill';
        statFill.style.width = `${value}%`;
        
        statBar.appendChild(statFill);
        stat.appendChild(statLabel);
        stat.appendChild(statBar);
        statsContainer.appendChild(stat);
      });
      
      // Assemble the card
      card.appendChild(imageContainer);
      card.appendChild(threeDContainer);
      card.appendChild(name);
      card.appendChild(statsContainer);
      
      wrapper.appendChild(card);
    });
    
    // Add navigation arrows
    const prevArrow = document.createElement('div');
    prevArrow.className = 'carousel-arrow carousel-prev';
    prevArrow.innerHTML = '&lt;';
    
    const nextArrow = document.createElement('div');
    nextArrow.className = 'carousel-arrow carousel-next';
    nextArrow.innerHTML = '&gt;';
    
    wrapper.appendChild(prevArrow);
    wrapper.appendChild(nextArrow);
    
    // Create indicator dots
    const indicators = document.querySelector('.carousel-indicators');
    if (indicators) {
      indicators.innerHTML = '';
      
      this.characters.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        dot.dataset.index = index;
        indicators.appendChild(dot);
      });
    }
  },
  
  /**
   * Add event listeners for navigation
   */
  setupEventListeners() {
    console.log('Setting up event listeners');
    // Previous arrow
    const prevArrow = document.querySelector('.carousel-prev');
    if (prevArrow) {
      prevArrow.addEventListener('click', () => this.prevCharacter());
    }
    
    // Next arrow
    const nextArrow = document.querySelector('.carousel-next');
    if (nextArrow) {
      nextArrow.addEventListener('click', () => this.nextCharacter());
    }
    
    // Indicator dots
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => this.showCharacter(index));
    });
    
    // Touch swipe support
    const wrapper = document.querySelector('.carousel-wrapper');
    if (wrapper) {
      let startX, moveX;
      
      wrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });
      
      wrapper.addEventListener('touchmove', (e) => {
        moveX = e.touches[0].clientX;
      });
      
      wrapper.addEventListener('touchend', () => {
        if (startX && moveX) {
          const diff = startX - moveX;
          if (diff > 50) {
            this.nextCharacter();
          } else if (diff < -50) {
            this.prevCharacter();
          }
        }
        startX = null;
        moveX = null;
      });
    }
  },
  
  /**
   * Show the character at the specified index
   */
  showCharacter(index) {
    console.log('Showing character at index', index);
    // Hide all character cards
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('active');
    });
    
    // Show only the selected character card
    const selectedCard = document.querySelectorAll('.character-card')[index];
    if (selectedCard) {
      selectedCard.classList.add('active');
    }
    
    // Update indicator dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update current index
    this.currentIndex = index;
    
    // Update selected character in the UI Manager
    if (window.UIManager) {
      UIManager.selectedCharacter = `character-${index}`;
    }
  },
  
  /**
   * Navigate to the previous character
   */
  prevCharacter() {
    console.log('Navigating to previous character');
    const totalCharacters = this.characters.length;
    const prevIndex = (this.currentIndex - 1 + totalCharacters) % totalCharacters;
    this.showCharacter(prevIndex);
  },
  
  /**
   * Navigate to the next character
   */
  nextCharacter() {
    console.log('Navigating to next character');
    const totalCharacters = this.characters.length;
    const nextIndex = (this.currentIndex + 1) % totalCharacters;
    this.showCharacter(nextIndex);
  },
  
  /**
   * Toggle 3D/2D view
   */
  toggle3DView(index, show3D) {
    console.log('Toggling 3D view:', show3D);
    const card = document.querySelectorAll('.character-card')[index];
    if (card) {
      if (show3D) {
        card.classList.add('show-3d-view');
        this.load3DModel(index);
      } else {
        card.classList.remove('show-3d-view');
      }
    }
  },
  
  /**
   * Load 3D model (placeholder function)
   */
  load3DModel(index) {
    console.log('Loading 3D model for character', index);
    const container = document.querySelectorAll('.three-d-container')[index];
    if (container) {
      container.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
      
      // Simulate loading a 3D model
      setTimeout(() => {
        container.innerHTML = '<div class="model-loading">3D Model Loaded</div>';
      }, 1000);
    }
  }
};

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing character carousel');
  CharacterCarousel.init();
});
