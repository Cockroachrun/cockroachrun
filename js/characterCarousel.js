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
  ];

  let currentIndex = 0;

  // Grab essential elements
  const prevArrow = document.querySelector('.carousel-prev');
  const nextArrow = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');
  const card = document.querySelector('.character-card');

  // Update character information
  function updateCharacter(index) {
    const character = characters[index];

    const img = card.querySelector('.character-image');
    img.src = character.image;
    img.alt = character.name;

    card.querySelector('.character-name').textContent = character.name.toUpperCase();

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

  // Previous arrow
  if (prevArrow) {
    prevArrow.addEventListener('click', debounce(function() {
      const currentCard = document.querySelector('.character-card.active');
      if (!currentCard) return;

      currentCard.classList.remove('active');
      const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
      currentIndex = prevIndex;

      const newCard = document.querySelector(`.character-card[data-index="${prevIndex}"]`);
      if (newCard) {
        newCard.classList.add('active');
      }

      updateCharacter(prevIndex);
    }, 500));
  }

  // Next arrow
  if (nextArrow) {
    nextArrow.addEventListener('click', debounce(function() {
      const currentCard = document.querySelector('.character-card.active');
      if (!currentCard) return;

      currentCard.classList.remove('active');
      const nextIndex = (currentIndex + 1) % characters.length;
      currentIndex = nextIndex;

      const newCard = document.querySelector(`.character-card[data-index="${nextIndex}"]`);
      if (newCard) {
        newCard.classList.add('active');
      }

      updateCharacter(nextIndex);
    }, 500));
  }

  // Dot indicators
  dots.forEach(function(dot, idx) {
    dot.addEventListener('click', debounce(function() {
      const currentCard = document.querySelector('.character-card.active');
      if (currentCard) {
        currentCard.classList.remove('active');
      }
      currentIndex = idx;

      const newCard = document.querySelector(`.character-card[data-index="${idx}"]`);
      if (newCard) {
        newCard.classList.add('active');
      }

      updateCharacter(idx);
    }, 500));
  });

  // 3D Toggle button
  const toggleButton = card.querySelector('.toggle-3d-btn');
  if (toggleButton) {
    toggleButton.addEventListener('click', function() {
      card.classList.toggle('show-3d');
      if (card.classList.contains('show-3d')) {
        // Simulate loading a 3D model
        const container = card.querySelector('.character-3d-container');
        if (container) {
          container.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
          setTimeout(() => {
            container.innerHTML = '<div class="model-loading">3D Model Loaded</div>';
          }, 1000);
        }
        toggleButton.setAttribute('title', 'Toggle 2D View');
      } else {
        const container = card.querySelector('.character-3d-container');
        if (container) {
          container.innerHTML = '';
        }
        toggleButton.setAttribute('title', 'Toggle 3D View');
      }
    });
  }

  // Initialize additional character cards for the 2nd and 3rd cockroaches
  // This will allow us to transition properly with the data-index attributes
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
          <img src="assets/icons/3d-icon.svg" alt="3D icon" />
        </button>
      </div>
      <div class="character-3d-container"></div>
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
    return newCard;
  }

  // Insert additional cards in .carousel-wrapper
  const wrapper = document.querySelector('.carousel-wrapper');
  for (let i = 1; i < characters.length; i++) {
    const cardEl = createCharacterCard(i);
    wrapper.appendChild(cardEl);
  }

  // Initialize with the first character
  updateCharacter(0);
});
