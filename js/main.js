/**
// Preload important images
function preloadImages() {
  const imagesToPreload = [
    'assets/images/characters/American Cockroach with bg.png',
    'assets/images/characters/german_cockroach.png',
    'assets/images/characters/Oriental Cockroach.png',
    'assets/images/backgrounds/sewer_bg.png',
    'assets/images/backgrounds/kitchen_bg.png',
    'assets/images/backgrounds/bathroom_bg.png'
  ];
  
  let loadedCount = 0;
  const totalImages = imagesToPreload.length;
  
  return new Promise((resolve) => {
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.error(`Failed to load image: ${src}`);
        if (loadedCount === totalImages) {
          resolve();
        }
      };
      img.src = src;
    });
  });
}

// Use this in your loading screen code
function enhancedLoading() {
  let progress = 0;
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.getElementById('loading-percent');
  
  // Start with asset loading
  preloadImages().then(() => {
    // Complete the loading once images are ready
    const interval = setInterval(() => {
      progress += 5;
      progressBar.style.width = `${progress}%`;
      progressText.textContent = progress;
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          UIManager.showScreen('start');
          AudioManager.playMenuMusic();
        }, 500);
      }
    }, 100);
  });
}

// Replace the simulateLoading function in UIManager
UIManager.simulateLoading = enhancedLoading;
 * Cockroach Run - Main Game Script
 * Initializes all game components and manages the game flow
 */

/**
 * Cockroach Run - Main Game Script
 * Initializes all game components and manages the game flow
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Cockroach Run...');
    
    // Use global AudioManager for compatibility
    const AudioManager = window.AudioManager;
    AudioManager.init();
    console.log('AudioManager initialized');
    UIManager.init();
    console.log('UIManager initialized');
    
    // Try to play menu music as soon as possible
    AudioManager.playMenuMusic();
    
    // Add a one-time event listener for any user interaction to start music
    const startAudioOnInteraction = () => {
        AudioManager.playMenuMusic();
        document.removeEventListener('click', startAudioOnInteraction);
        document.removeEventListener('keydown', startAudioOnInteraction);
        document.removeEventListener('touchstart', startAudioOnInteraction);
    };
    
    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);
    document.addEventListener('touchstart', startAudioOnInteraction);
    
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    function drawPlaceholder() {
        if (!UIManager.isGameRunning) return;
        const ctx = context;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#663300';
        ctx.ellipse(0, 0, 40, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4D2600';
        ctx.beginPath();
        ctx.ellipse(-30, 0, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4D2600';
        ctx.lineWidth = 3;
        for (let i = -20; i <= 20; i += 20) {
            ctx.beginPath();
            ctx.moveTo(-10, i);
            ctx.quadraticCurveTo(-40, i - 10, -60, i - 20);
            ctx.stroke();
        }
        for (let i = -20; i <= 20; i += 20) {
            ctx.beginPath();
            ctx.moveTo(10, i);
            ctx.quadraticCurveTo(40, i - 10, 60, i - 20);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(-40, -5);
        ctx.quadraticCurveTo(-60, -30, -70, -20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-40, 5);
        ctx.quadraticCurveTo(-60, 30, -70, 20);
        ctx.stroke();
        ctx.restore();
        if (UIManager.settings.showFps) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(10, 60, 60, 24);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px monospace';
            ctx.fillText(`FPS: ${Math.round(fps)}`, 15, 76);
        }
    }
    
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    let lastFpsUpdate = 0;
    
    function animate(currentTime) {
        requestAnimationFrame(animate);
        frameCount++;
        const elapsed = currentTime - lastFpsUpdate;
        if (elapsed >= 1000) {
            fps = frameCount / (elapsed / 1000);
            frameCount = 0;
            lastFpsUpdate = currentTime;
        }
        drawPlaceholder();
        lastTime = currentTime;
    }
    
    animate(performance.now());
    console.log('Cockroach Run initialized');
});

// Function to add sound to buttons
function addSoundToAllButtons() {
  // Get all buttons and clickable elements
  const buttons = document.querySelectorAll('button, .mode-card, .carousel-arrow, .carousel-dot');
  
  buttons.forEach(button => {
    // Skip if already has click handler
    if (button.getAttribute('data-has-sound') === 'true') return;
    
    // Save original click handler
    const originalClick = button.onclick;
    
    // Add new click handler with sound
    button.onclick = function(e) {
      // Play sound
      if (window.AudioManager) {
        AudioManager.playButtonClick();
      }
      
      // Call original handler if it exists
      if (originalClick) originalClick.call(this, e);
    };
    
    // Mark as processed
    button.setAttribute('data-has-sound', 'true');
  });
}

// Call this function after the DOM is loaded and after any dynamic buttons are created
document.addEventListener('DOMContentLoaded', function() {
  // First pass for static buttons
  addSoundToAllButtons();
  
  // Second pass after any dynamic content is loaded
  setTimeout(addSoundToAllButtons, 1000);
  
  // Add click sound to carousel arrows
  document.querySelectorAll('.carousel-prev, .carousel-next').forEach(btn => {
    btn.addEventListener('click', () => AudioManager.playButtonClick());
  });
});
