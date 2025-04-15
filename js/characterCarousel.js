/**
 * Character Selection Carousel for Cockroach Run
 */
const CharacterCarousel = {
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
    this.setupCarousel();
    this.setupEvents();
    this.showCharacter(0);
  },
  
  /**
   * Create the carousel structure
   */
  setupCarousel() {
    const wrapper = document.querySelector('.carousel-wrapper');
    if (!wrapper) return;
    
    // Clear existing content
    wrapper.innerHTML = '';
    
    // Create all character cards
    this.characters.forEach((character, index) => {
      // Create the card container
      const card = document.createElement('div');
      card.className = 'character-card';
      card.setAttribute('data-index', index);
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'character-image-container';
      
      // Add character image
      const img = document.createElement('img');
      img.src = character.image;
      img.alt = character.name;
      imageContainer.appendChild(img);
      
      // Add 3D toggle button
      const threeDToggle = document.createElement('button');
      threeDToggle.className = 'three-d-toggle';
      threeDToggle.textContent = '3D';
      threeDToggle.addEventListener('click', () => this.toggle3DView(index, true));
      imageContainer.appendChild(threeDToggle);
      
      // Add 2D toggle button (initially hidden)
      const twoDToggle = document.createElement('button');
      twoDToggle.className = 'three-d-toggle two-d-toggle';
      twoDToggle.textContent = '2D';
      twoDToggle.addEventListener('click', () => this.toggle3DView(index, false));
      imageContainer.appendChild(twoDToggle);
      
      // Add 3D container (initially hidden)
      const threeDContainer = document.createElement('div');
      threeDContainer.className = 'three-d-container';
      threeDContainer.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
      
      // Add character name
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
      
      // Add card to wrapper
      wrapper.appendChild(card);
    });
    
    // Create navigation arrows
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
        dot.setAttribute('data-index', index);
        indicators.appendChild(dot);
      });
    }
  },
  
  /**
   * Set up event listeners
   */
  setupEvents() {
    // Previous button
    document.querySelector('.carousel-prev').addEventListener('click', () => {
      this.prevCharacter();
    });
    
    // Next button
    document.querySelector('.carousel-next').addEventListener('click', () => {
      this.nextCharacter();
    });
    
    // Indicator dots
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.showCharacter(index);
      });
    });
  },
  
  /**
   * Show character at specific index
   */
  showCharacter(index) {
    // Hide all cards
    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.remove('active');
    });
    
    // Show selected card
    document.querySelectorAll('.character-card')[index].classList.add('active');
    
    // Update indicator dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update current index
    this.currentIndex = index;
    
    // Update selected character in UI Manager
    if (window.UIManager) {
      UIManager.selectedCharacter = `character-${index}`;
    }
  },
  
  /**
   * Navigate to previous character
   */
  prevCharacter() {
    const prevIndex = (this.currentIndex - 1 + this.characters.length) % this.characters.length;
    this.showCharacter(prevIndex);
  },
  
  /**
   * Navigate to next character
   */
  nextCharacter() {
    const nextIndex = (this.currentIndex + 1) % this.characters.length;
    this.showCharacter(nextIndex);
  },
  
  /**
   * Toggle 3D view
   */
  toggle3DView(index, show3D) {
    const card = document.querySelectorAll('.character-card')[index];
    
    if (show3D) {
      card.classList.add('show-3d-view');
      this.load3DModel(index);
    } else {
      card.classList.remove('show-3d-view');
    }
  },
  
  /**
   * Load 3D model
   */
  load3DModel(index) {
    const container = document.querySelectorAll('.three-d-container')[index];
    container.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
    
    // Simulate loading a 3D model
    setTimeout(() => {
      container.innerHTML = '<div class="model-loading">3D Model Loaded</div>';
    }, 1000);
  }
};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  CharacterCarousel.init();
});
