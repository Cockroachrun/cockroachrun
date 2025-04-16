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
      wrapperSelector: '.carousel-wrapper',
      prevButtonSelector: '.carousel-arrow.carousel-prev',
      nextButtonSelector: '.carousel-arrow.carousel-next',
      indicatorsSelector: '#carousel-indicators',
      startButtonSelector: '#start-game-button',
      transitionDuration: 300,
      enableSounds: true,
      ...options
    };

    // Character data - single source of truth
    this.characters = this.getDefaultCharacters();

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
    console.log('CharacterCarousel.init() called');
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
      let imageSrc = character.imagePath;
      
      // Set image with absolute path
      imageEl.style.backgroundImage = `url('${imageSrc}')`;
      
      // Debug image loading
      console.log(`Attempting to load image: ${imageSrc}`);
      
      // Test image loading with explicit element
        //const testImg = new Image();
        //testImg.onload = () => {
        //  console.log(`Successfully loaded image: ${imageSrc}`);
        //};
        //testImg.onerror = () => {
        //  console.error(`Failed to load image: ${imageSrc}`);
        //  // Try alternate path format with underscores instead of spaces
        //  const altSrc = character.imagePath ? character.imagePath.replace(/ /g, '_') : '';
        //  console.log(`Trying alternate path: ${altSrc}`);
        //  imageEl.style.backgroundImage = `url('${altSrc}')`;
          
        //  // If that also fails, use a colored placeholder
        //  const finalTestImg = new Image();
        //  finalTestImg.onerror = () => {
        //    console.error(`Failed to load any image for ${character.name}`);
        //    // Set a colored background as fallback
        //    imageEl.style.backgroundImage = 'none';
        //    imageEl.style.backgroundColor = '#663300';
            
        //    // Add a simple cockroach SVG as content
        //    imageEl.innerHTML = `
        //      <svg viewBox="0 0 100 100" width="80" height="80" fill="#FF9000">
        //        <path d="M50 20 L60 10 L55 25 L70 30 L55 40 L60 70 L50 60 L40 70 L45 40 L30 30 L45 25 L40 10 Z" />
        //      </svg>
        //    `;
        //  };
        //  finalTestImg.src = altSrc;
        //};
      testImg.src = imageSrc;

      // Add elements to container
      imageContainer.appendChild(imageEl);
      imageContainer.appendChild(threeDButton);
      
      // Create name with proper styling - already uppercase in data
      const nameEl = document.createElement('h3');
      nameEl.className = 'character-name';
      nameEl.textContent = character.name;
      
      // Create stats with improved styling
      const statsEl = document.createElement('div');
      statsEl.className = 'character-stats';
      
      // Add stats with proper styling and legends
      const { speed, durability, stealth } = character.stats;
      statsEl.innerHTML = `
        <div class="stat">
          <div class="stat-label">
            <span>SPEED</span>
            <span>${speed}%</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${speed}%;"></div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-label">
            <span>DURABILITY</span>
            <span>${durability}%</span>
          </div>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${durability}%;"></div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-label">
            <span>STEALTH</span>
            <span>${stealth}%</span>
          </div>
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
      console.log('Previous button clicked');
      this.playNavigationSound();
      this.prev();
    });
    
    this.nextButton.addEventListener('click', (e) => {
      console.log('Next button clicked');
      this.playNavigationSound();
      this.next();
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
      console.log('Start button clicked');
      if (this.config.enableSounds && window.AudioManager) {
        window.AudioManager.playSound('ui_select');
      }
      
      // Get the currently selected character
      const selectedCharacter = this.characters[this.currentIndex];
      
      // Trigger a custom event for character selection
      const event = new CustomEvent('characterSelected', {
        detail: { character: selectedCharacter }
      });
      document.dispatchEvent(event);
      
      // Log selection
      console.log(`Selected character: ${selectedCharacter.name}`);
    });
  }

  /**
   * Handle swipe gestures
   */
  handleSwipe() {
    const threshold = 50;
    if (this.touchEndX < this.touchStartX - threshold) {
      this.next();
    } else if (this.touchEndX > this.touchStartX + threshold) {
      this.prev();
    }
  }

  /**
   * Go to previous slide
   */
  prev() {
    if (this.isTransitioning) return;
    const prevIndex = this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : this.characters.length - 1;
    this.goToSlide(prevIndex);
  }

  /**
   * Go to next slide
   */
  next() {
    if (this.isTransitioning) return;
    const nextIndex = this.currentIndex + 1 < this.characters.length ? this.currentIndex + 1 : 0;
    this.goToSlide(nextIndex);
  }

  /**
   * Go to a specific slide by index
   * @param {number} index - Slide index
   * @param {boolean} animate - Whether to animate the transition
   */
 goToSlide(index, animate = true) {
   console.log('goToSlide called, isTransitioning:', this.isTransitioning);
   if (this.isTransitioning) return;
    if (index < 0 || index >= this.characters.length) return;
    
    if (animate) {
      this.isTransitioning = true;
    }
    
    // Get current and target slides
    const currentSlide = this.carouselContainer.querySelector('.character-card.active');
    const targetSlide = this.carouselContainer.querySelectorAll('.character-card')[index];
    
    if (!currentSlide || !targetSlide) return;
    
    // Handle transition with or without animation
    if (animate) {
      // Transition out current slide
      currentSlide.style.opacity = '0';
      currentSlide.style.transform = index > this.currentIndex ? 'translateX(-10%)' : 'translateX(10%)';
      
      // After a short delay, transition in the new slide
      this.animationTimeout = setTimeout(() => {
        currentSlide.classList.remove('active');
        currentSlide.style.visibility = 'hidden';
        
        // Reset and prepare new slide
        targetSlide.style.transform = index > this.currentIndex ? 'translateX(10%)' : 'translateX(-10%)';
        targetSlide.style.visibility = 'visible';
        
        // Force reflow
        void targetSlide.offsetWidth;
        
        // Transition in new slide
        targetSlide.style.opacity = '1';
        targetSlide.style.transform = 'translateX(0)';
        targetSlide.classList.add('active');
        
        // Update dots
        this.updateDots(index);
        
        // Update state
        this.currentIndex = index;
        
        // End transition after duration
        this.animationTimeout = setTimeout(() => {
          this.isTransitioning = false;
        }, this.config.transitionDuration);
      }, this.config.transitionDuration / 2);
    } else {
      // Instant transition without animation
      currentSlide.classList.remove('active');
      currentSlide.style.opacity = '0';
      currentSlide.style.visibility = 'hidden';
      
      targetSlide.classList.add('active');
      targetSlide.style.opacity = '1';
      targetSlide.style.transform = 'translateX(0)';
      targetSlide.style.visibility = 'visible';
      
      // Update dots
      this.updateDots(index);
      
      // Update state
      this.currentIndex = index;
    }
  }

  /**
   * Update the indicator dots
   * @param {number} activeIndex - Index of active slide
   */
  updateDots(activeIndex) {
    const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      if (index === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Play navigation sound if available
   */
  playNavigationSound() {
    if (this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_tap');
    }
  }

  /**
   * Select the current character
   */
  selectCurrentCharacter() {
    const character = this.characters[this.currentIndex];
    if (!character.unlocked) {
      // Play error sound if locked
      if (this.config.enableSounds && window.AudioManager) {
        window.AudioManager.playSound('ui_error');
      }
      return;
    }
    
    // Play select sound
    if (this.config.enableSounds && window.AudioManager) {
      window.AudioManager.playSound('ui_select');
    }
    
    // Trigger character selected
    const event = new CustomEvent('characterSelected', {
      detail: { character }
    });
    document.dispatchEvent(event);
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
   * Default characters for the carousel
   * @returns {Array} Array of character objects
   */
  getDefaultCharacters() {
    return [
      {
        id: 'american-roach',
        name: 'AMERICAN COCKROACH',
        description: 'The classic pest, known for speed and adaptability.',
        stats: {
          speed: 75,
          durability: 60, 
          stealth: 80
        },
        unlocked: true,
        imagePath: 'assets/images/characters/American_Cockroach_with_bg.png',
        modelPath: 'assets/models/American Cockroach.glb'
      },
      {
        id: 'german-roach',
        name: 'GERMAN COCKROACH',
        description: 'Small but resilient, masters of hiding.',
        stats: {
          speed: 85,
          durability: 55,
          stealth: 90
        },
        unlocked: true,
        imagePath: 'assets/images/characters/German_Cockroach_with_bg.png',
        modelPath: 'assets/models/German Cockroach.glb'
      },
      {
        id: 'oriental-roach',
        name: 'ORIENTAL COCKROACH',
        description: 'Tough and hardy, prefers damp environments.',
        stats: {
          speed: 60,
          durability: 90,
          stealth: 65
        },
        unlocked: true,
        imagePath: 'assets/images/characters/Oriental_Cockroach_with_bg.png',
        modelPath: 'assets/models/Oriental Cockroach.glb'
      }
    ];
  }
  
  /**
   * Toggle 3D view for a character
   * @param {string} characterId - ID of the character to toggle 3D view
   */
  toggle3DView(characterId) {
    console.log(`Toggling 3D view for ${characterId}`);
    
    // Get the character data
    const character = this.characters.find(char => char.id === characterId);
    if (!character) return;
    
    // Get the character card
    const card = document.querySelector(`.character-card[data-character-id="${characterId}"]`);
    if (!card) return;
    
    // Toggle 3D view class
    card.classList.toggle('show-3d-view');
    
    // If showing 3D view, load the 3D model
    if (card.classList.contains('show-3d-view')) {
      const imageContainer = card.querySelector('.character-image-container');
      
      // Create or find 3D container
      let threeDContainer = card.querySelector('.three-d-container');
      if (!threeDContainer) {
        threeDContainer = document.createElement('div');
        threeDContainer.className = 'three-d-container';
        imageContainer.appendChild(threeDContainer);
        
        // Load 3D model with Three.js
        this.load3DModel(character.modelPath, threeDContainer);
        
        // Play sound if available
        if (this.config.enableSounds && window.AudioManager) {
          window.AudioManager.playSound('ui_special');
        }
      }
    }
  }
  
  /**
   * Load a 3D model into a container
   * @param {string} modelPath - Path to the 3D model file
   * @param {HTMLElement} container - Container to render the model in
   */
  load3DModel(modelPath, container) {
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'model-loading';
    loadingEl.textContent = 'LOADING 3D MODEL...';
    container.appendChild(loadingEl);
    
    // Check if Three.js is available
    if (window.THREE && window.THREE.GLTFLoader) {
      try {
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffa500, 1);
        dirLight.position.set(1, 1, 1);
        scene.add(dirLight);
        
        // Position camera
        camera.position.z = 5;
        
        // Load model
        const loader = new THREE.GLTFLoader();
        loader.load(
          modelPath,
          (gltf) => {
            // Remove loading indicator
            container.removeChild(loadingEl);
            
            // Add model to scene
            const model = gltf.scene;
            scene.add(model);
            
            // Center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;
            
            // Scale to fit
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDim;
            model.scale.set(scale, scale, scale);
            
            // Rotate model for better view
            model.rotation.y = Math.PI / 4;
            
            // Animate model rotation
            function animate() {
              requestAnimationFrame(animate);
              model.rotation.y += 0.01;
              renderer.render(scene, camera);
            }
            
            animate();
          },
          (xhr) => {
            // Loading progress
            loadingEl.textContent = `LOADING: ${Math.floor(xhr.loaded / xhr.total * 100)}%`;
          },
          (error) => {
            console.error('Error loading 3D model:', error);
            loadingEl.textContent = 'ERROR LOADING MODEL';
          }
        );
      } catch (error) {
        console.error('Error initializing Three.js:', error);
        loadingEl.textContent = 'ERROR: THREE.JS INITIALIZATION FAILED';
      }
    } else {
      loadingEl.textContent = 'ERROR: THREE.JS NOT AVAILABLE';
    }
  }
}

// Multi-stage initialization to ensure carousel loads properly
function initializeCarousel() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.characterCarousel) {
        console.log('Carousel already initialized, skipping');
        return;
      }
      
      window.characterCarousel = new CharacterCarousel();
    });
  } else {
    if (window.characterCarousel) {
      console.log('Carousel already initialized, skipping');
      return;
    }
    
    window.characterCarousel = new CharacterCarousel();
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeCarousel);

// Fallback initialization
setTimeout(initializeCarousel, 500);
