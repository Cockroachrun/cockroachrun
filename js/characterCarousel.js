/**
 * Simple Character Carousel
 */
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
  
  // Current character index
  let currentIndex = 0;
  
  // Get elements
  const prevArrow = document.querySelector('.carousel-prev');
  const nextArrow = document.querySelector('.carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');
  const card = document.querySelector('.character-card');
  
  // Function to update character
  function updateCharacter(index) {
    const character = characters[index];
    
    // Update image
    const img = card.querySelector('img');
    img.src = character.image;
    img.alt = character.name;
    
    // Update name
    card.querySelector('.character-name').textContent = character.name;
    
    // Update stats
    Object.entries(character.stats).forEach(([statName, value], i) => {
      const statElements = card.querySelectorAll('.stat');
      const statElement = statElements[i];
      
      if (statElement) {
        const statLabel = statElement.querySelector('.stat-label');
        statLabel.innerHTML = `${statName.toUpperCase()} <span>${value}%</span>`;
        
        const statFill = statElement.querySelector('.stat-fill');
        statFill.style.width = `${value}%`;
      }
    });
    
    // Update active dot
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update current index
    currentIndex = index;
    
    // Update selected character in UI Manager if it exists
    if (window.UIManager) {
      UIManager.selectedCharacter = `character-${index}`;
    }
  }
  
  // Add click event to previous arrow
  if (prevArrow) {
    prevArrow.addEventListener('click', function() {
      const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
      updateCharacter(prevIndex);
      console.log('Previous character');
    });
  }
  
  // Add click event to next arrow
  if (nextArrow) {
    nextArrow.addEventListener('click', function() {
      const nextIndex = (currentIndex + 1) % characters.length;
      updateCharacter(nextIndex);
      console.log('Next character');
    });
  }
  
  // Add click event to indicator dots
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      updateCharacter(index);
      console.log('Switch to character', index);
    });
  });
  
  // Add event listener to 3D toggle button
  const threeDToggle = document.querySelector('.three-d-toggle');
  if (threeDToggle) {
    threeDToggle.addEventListener('click', function() {
      // Toggle 3D view
      card.classList.toggle('show-3d-view');
      
      // Update button text
      if (card.classList.contains('show-3d-view')) {
        // Simulate loading a 3D model
        const container = card.querySelector('.three-d-container');
        if (container) {
          container.innerHTML = '<div class="model-loading">Loading 3D Model...</div>';
          setTimeout(() => {
            container.innerHTML = '<div class="model-loading">3D Model Loaded</div>';
          }, 1000);
        }
        
        // Hide 3D button, show 2D button
        threeDToggle.style.display = 'none';
        
        // Create 2D button if it doesn't exist
        let twoDToggle = document.querySelector('.two-d-toggle');
        if (!twoDToggle) {
          twoDToggle = document.createElement('button');
          twoDToggle.className = 'three-d-toggle two-d-toggle';
          twoDToggle.textContent = '2D';
          card.querySelector('.character-image-container').appendChild(twoDToggle);
          
          // Add click event to 2D button
          twoDToggle.addEventListener('click', function() {
            card.classList.remove('show-3d-view');
            threeDToggle.style.display = '';
            twoDToggle.style.display = 'none';
          });
        } else {
          twoDToggle.style.display = '';
        }
      }
      
      console.log('Toggle 3D view');
    });
  }
  
  // Initialize with first character
  updateCharacter(0);
});
