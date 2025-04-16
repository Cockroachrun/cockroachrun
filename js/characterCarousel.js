/**
 * Character Carousel for Cockroach Run
 * Handles character selection, navigation, and 3D model toggling
 */

/**
 * Debounce function to limit rapid clicking
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // Character data
  const characters = [
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
      image: "assets/images/characters/german_cockroach.png",
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
      image: "assets/images/characters/Oreintal Cockroach.png",
      stats: {
        speed: 65,
        durability: 80,
        stealth: 70,
        climbing: 50,
        agility: 60,
        burrowing: 85
      }
    }
  ];

  let currentIndex = 0;

  // Grab essential elements
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  const prevArrow = document.querySelector('.carousel-prev');
  const nextArrow = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');

  // Update character information
  function updateCharacter(index) {
    console.log("updateCharacter called with index:", index);
    const character = characters[index];
    console.log("character:", character);
    const card = document.querySelector(`.character-card[data-index="${index}"]`);
    console.log("card:", card);
    if (!card) return;
    const img = card.querySelector('.character-image');
    img.src = character?.image;
    img.alt = character?.name;
    card.querySelector('.character-name').textContent = character?.name.toUpperCase();
    // Update stats
    const statElements = card.querySelectorAll('.stat');
    const statKeys = Object.keys(character.stats);

    for (let i = 0; i < statElements.length; i++) {
      const statName = statKeys[i];
      const statValue = character.stats[statName];
      const labelEl = statElements[i].querySelector('.stat-label');
      const valueEl = statElements[i].querySelector('.stat-value');

      if (labelEl) {
        labelEl.textContent = statName.toUpperCase();
      }
      if (valueEl) {
        valueEl.textContent = `${statValue}%`;
      }
    }

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentIndex = index;

    // If there's a UIManager, update the selected character
    if (window.UIManager) {
      window.UIManager.selectedCharacter = `character-${index}`;
    }
  }

  /**
   * Navigate to the previous character
   */
  function navigateToPrev() {
    console.log("navigateToPrev called");
    // Remove active class from all cards
    document.querySelectorAll('.character-card.active').forEach(c => {
      c.classList.remove('active');
    });
    
    // Calculate the previous index with wraparound
    const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
    currentIndex = prevIndex;

    // Activate the new card
    const newCard = document.querySelector(`.character-card[data-index="${prevIndex}"]`);
    if (newCard) {
      newCard.classList.add('active');
    }

    // Update character information
    updateCharacter(prevIndex);
  }

  /**
   * Navigate to the next character
   */
  function navigateToNext() {
    console.log("navigateToNext called");
    // Remove active class from all cards
    document.querySelectorAll('.character-card.active').forEach(c => {
      c.classList.remove('active');
    });
    
    // Calculate the next index with wraparound
    const nextIndex = (currentIndex + 1) % characters.length;
    currentIndex = nextIndex;

    // Activate the new card
    const newCard = document.querySelector(`.character-card[data-index="${nextIndex}"]`);
    if (newCard) {
      newCard.classList.add('active');
    }

    // Update character information
    updateCharacter(nextIndex);
  }

  /**
   * Navigate directly to a specific character
   * @param {number} idx - The index to navigate to
   */
  function navigateToIndex(idx) {
    // Remove active class from all cards
    document.querySelectorAll('.character-card.active').forEach(c => {
      c.classList.remove('active');
    });
    
    // Update index
    currentIndex = idx;

    // Activate the new card
    const newCard = document.querySelector(`.character-card[data-index="${idx}"]`);
    if (newCard) {
      newCard.classList.add('active');
    }

    // Update dot indicators
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Update character information
    updateCharacter(idx);
  }

  // Dot indicators event listeners
  dots.forEach(function(dot, idx) {
    dot.addEventListener('click', debounce(function() {
      navigateToIndex(idx);
    }, 500));
  });

  /**
   * Add 3D toggle functionality to a character card
   * @param {HTMLElement} cardElement - The character card to add the toggle to
   */
  function add3DToggleListener(cardElement) {
    const toggleBtn = cardElement.querySelector('.toggle-3d-btn');
    if (!toggleBtn) return;
    
    toggleBtn.addEventListener('click', function() {
      const container3D = cardElement.querySelector('.character-3d-container');
      const toggleBtn2D = cardElement.querySelector('.toggle-2d-btn');

      if (container3D.style.display === 'none') {
        container3D.style.display = 'block';
        toggleBtn2D.style.display = 'none';
        // Simulate loading a 3D model
        if (container3D) {
          container3D.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
          setTimeout(() => {
            container3D.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--color-neon);">3D Model View</div>';
          }, 1000);
        }
        toggleBtn.setAttribute('title', 'Toggle 2D View');
      } else {
        container3D.style.display = 'none';
        toggleBtn2D.style.display = 'flex';
        if (container3D) {
          container3D.innerHTML = '';
        }
        toggleBtn.setAttribute('title', 'Toggle 3D View');
      }
    });
  }

  /**
   * Create a character card element
   * @param {number} index - The index of the character in the data array
   * @returns {HTMLElement} The created card element
   */
  function createCharacterCard(index) {
    const charInfo = characters[index];
    const newCard = document.createElement('div');
    newCard.classList.add('character-card');
    newCard.setAttribute('data-index', index);

    newCard.innerHTML = `
      <div class="character-image-container">
        <img
          src="${charInfo.image}"
          alt="${charInfo.name}"
          class="character-image"
        />
        <button class="toggle-3d-btn" title="Toggle 3D View">
          
        </button>
      </div>
      <div class="character-3d-container">
        
      </div>
      <button class="toggle-2d-btn" title="Toggle 2D View"></button>
      <h3 class="character-name">${charInfo.name.toUpperCase()}</h3>
      <div class="character-stats">
        ${Object.entries(charInfo.stats).map(([statName, value]) => `
          <div class="stat">
            <div class="stat-label">${statName.toUpperCase()}</div>
            <div class="stat-value">${value}%</div>
          </div>
        `).join('')}
      </div>
    `;
    add3DToggleListener(newCard);
    return newCard;
  }

  // Insert additional cards in .carousel-wrapper
  const wrapper = document.querySelector('.carousel-wrapper');
  for (let i = 0; i < characters.length; i++) {
    const cardEl = createCharacterCard(i);
    wrapper.appendChild(cardEl);
    if (i === 0) {
      cardEl.classList.add('active');
    }
  }
  
  // Handle case where 3D icon might be missing
  function checkMissing3DIcon() {}

  // Create character cards
  characters.forEach((character, index) => {
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.dataset.index = index;

    card.innerHTML = `
      <div class="character-image-container">
        <img src="${character.image}" alt="${character.name}" class="character-image">
      </div>
      <h3 class="character-name">${character.name.toUpperCase()}</h3>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Speed:</span>
          <span class="stat-value">${character.stats.speed}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Durability:</span>
          <span class="stat-value">${character.stats.durability}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Stealth:</span>
          <span class="stat-value">${character.stats.stealth}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Climbing:</span>
          <span class="stat-value">${character.stats.climbing}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Agility:</span>
          <span class="stat-value">${character.stats.agility}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Burrowing:</span>
          <span class="stat-value">${character.stats.burrowing}%</span>
        </div>
      </div>
    `;

    carouselWrapper.appendChild(card);
  });

  // Initialize carousel
  navigateToIndex(0);
  
  document.querySelectorAll('.toggle-3d-btn img').forEach(img => {
    img.onerror = function() {
      this.parentNode.textContent = '3D';
    };
  });

  // Check for missing 3D icons
  // checkMissing3DIcon();
});
