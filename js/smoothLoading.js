/**
 * Fix for smooth loading bar animation
 */
document.addEventListener('DOMContentLoaded', function() {
  // Override the simulateLoading method in UIManager
  if (window.UIManager) {
    const originalSimulateLoading = UIManager.simulateLoading;
    
    UIManager.simulateLoading = function() {
      console.log('Using improved loading animation');
      
      let progress = 0;
      const progressBar = document.querySelector('.progress-bar');
      const progressText = document.getElementById('loading-percent');
      
      if (!progressBar || !progressText) {
        return originalSimulateLoading.call(this);
      }
      
      // Set smooth transition
      progressBar.style.transition = 'width 0.1s linear';
      
      // Use smaller increments and faster updates for smoothness
      const interval = setInterval(() => {
        progress += 0.5;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = Math.floor(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.showScreen('start');
            AudioManager.menuMusic.play().catch(e => {
              console.warn('Autoplay blocked:', e);
              const startMusic = () => {
                AudioManager.menuMusic.play();
                document.removeEventListener('click', startMusic);
              };
              document.addEventListener('click', startMusic);
            });
          }, 500);
        }
      }, 20);
    };
  }
});
