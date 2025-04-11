/**
 * Cockroach Run - Roach Animation Module
 * Handles loading and animating cockroach frames on the menu screen
 */
const RoachAnimation = {
  canvas: null,
  ctx: null,
  frames: [],
  currentFrame: 0,
  animationInterval: null,
  isLoaded: false,
  framePaths: [
    'assets/images/animations/frames/Cockroach_01.png',
    'assets/images/animations/frames/Cockroach_02.png',
    'assets/images/animations/frames/Cockroach_03.png',
    'assets/images/animations/frames/Cockroach_04.png',
    'assets/images/animations/frames/Cockroach_05.png',
    'assets/images/animations/frames/Cockroach_06.png',
    'assets/images/animations/frames/Cockroach_07.png',
    'assets/images/animations/frames/Cockroach_08.png',
    'assets/images/animations/frames/Cockroach_09.png'
  ],
  
  /**
   * Initialize the roach animation
   */
  init() {
    // Get canvas after DOM is fully loaded
    this.canvas = document.getElementById('roach-animation-canvas');
    
    if (!this.canvas) {
      console.error('Roach animation canvas not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Load frames
    this.loadFrames();
    
    // Listen for resize events
    window.addEventListener('resize', () => this.adjustCanvas());
    
    // Auto-start animation when on start screen
    const startScreen = document.getElementById('start-screen');
    if (startScreen && startScreen.classList.contains('active')) {
      this.startAnimation();
    }
    
    console.log('RoachAnimation initialized');
  },
  
  /**
   * Adjust canvas size based on device and orientation
   */
  adjustCanvas() {
    if (!this.canvas) return;
    
    // Redraw current frame
    this.drawFrame();
  },
  
  /**
   * Load all animation frames
   */
  loadFrames() {
    this.frames = [];
    let loadedCount = 0;
    const totalFrames = this.framePaths.length;
    
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          this.isLoaded = true;
          this.startAnimation();
          console.log('All roach animation frames loaded');
        }
      };
      
      img.onerror = () => {
        console.error(`Failed to load frame: ${this.framePaths[i]}`);
        loadedCount++;
      };
      
      img.src = this.framePaths[i];
      this.frames.push(img);
    }
    
    // Fallback - start animation after 3 seconds even if not all frames loaded
    setTimeout(() => {
      if (!this.isLoaded && this.frames.length > 0) {
        console.warn('Starting animation before all frames loaded');
        this.startAnimation();
      }
    }, 3000);
  },
  
  /**
   * Start the animation loop
   */
  startAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    
    this.currentFrame = 0;
    this.drawFrame();
    
    this.animationInterval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.drawFrame();
    }, 100); // 10 FPS
  },
  
  /**
   * Stop the animation loop
   */
  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  },
  
  /**
   * Draw the current animation frame
   */
  drawFrame() {
    if (!this.ctx || !this.frames.length || !this.frames[this.currentFrame] || !this.frames[this.currentFrame].complete) {
      return;
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw current frame
    const img = this.frames[this.currentFrame];
    
    // If image is loaded
    if (img.complete && img.naturalHeight !== 0) {
      const aspectRatio = img.width / img.height;
      
      // Calculate dimensions to fit within canvas while maintaining aspect ratio
      let drawWidth, drawHeight, x, y;
      
      if (this.canvas.width / this.canvas.height > aspectRatio) {
        // Canvas is wider than the image aspect ratio
        drawHeight = this.canvas.height;
        drawWidth = drawHeight * aspectRatio;
        x = (this.canvas.width - drawWidth) / 2;
        y = 0;
      } else {
        // Canvas is taller than the image aspect ratio
        drawWidth = this.canvas.width;
        drawHeight = drawWidth / aspectRatio;
        x = 0;
        y = (this.canvas.height - drawHeight) / 2;
      }
      
      // Draw the image centered
      this.ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }
  },
  
  /**
   * Update visibility of the animation
   * @param {boolean} isVisible - Whether the animation should be visible
   */
  updateVisibility(isVisible) {
    if (!this.canvas) return;
    
    this.canvas.style.display = isVisible ? 'block' : 'none';
    
    if (isVisible && !this.animationInterval) {
      this.startAnimation();
    } else if (!isVisible && this.animationInterval) {
      this.stopAnimation();
    }
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => RoachAnimation.init(), 100);
});

// Expose for global access
window.RoachAnimation = RoachAnimation;