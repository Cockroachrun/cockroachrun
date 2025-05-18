/**
 * Direct Zoom Handler for Cockroach Run
 * 
 * This script implements direct zoom controls for the game:
 * - F key to zoom in
 * - G key to zoom out
 * - Mouse wheel for smooth zoom
 */

(function() {
  console.log('Direct Zoom Handler - Initializing');
  
  // Define zoom variables
  const defaultFOV = 75;
  const minFOV = 45;
  const maxFOV = 90;
  const zoomStep = 5;
  let currentFOV = defaultFOV;
  
  // Function to show zoom notification
  function showZoomNotification(message) {
    const notification = document.getElementById('zoom-notification');
    if (notification) {
      notification.textContent = message;
      notification.style.opacity = '1';
      
      // Hide after 1 second
      setTimeout(() => {
        notification.style.opacity = '0';
      }, 1000);
    }
  }
  
  // Wait for the game's camera to be defined
  const cameraCheckInterval = setInterval(function() {
    if (window.camera) {
      console.log('Game camera found - Setting up zoom controls');
      setupZoomControls();
      clearInterval(cameraCheckInterval);
    }
  }, 500);
  
  function setupZoomControls() {
    // Initialize with camera's current FOV
    currentFOV = window.camera.fov;
    
    // Add keyboard event listener for F and G keys
    document.addEventListener('keydown', function(event) {
      if (!window.camera) return;
      
      // F key for zoom in
      if (event.key === 'f' || event.key === 'F') {
        console.log('F key detected - zooming in');
        zoomIn();
      }
      
      // G key for zoom out
      if (event.key === 'g' || event.key === 'G') {
        console.log('G key detected - zooming out');
        zoomOut();
      }
    });
    
    // Add mouse wheel zoom support
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('wheel', function(event) {
        if (!window.camera) return;
        
        // Prevent default scrolling
        event.preventDefault();
        
        // Determine zoom direction based on wheel direction
        if (event.deltaY < 0) {
          // Scroll up - zoom in
          zoomIn(0.5); // Smaller step for smooth zooming
        } else {
          // Scroll down - zoom out
          zoomOut(0.5); // Smaller step for smooth zooming
        }
      }, { passive: false });
    }
    
    console.log('Zoom controls enabled - Use F/G keys or mouse wheel');
  }
  
  // Helper function to zoom in
  function zoomIn(stepMultiplier = 1) {
    if (!window.camera) return;
    
    // Calculate new FOV with limit
    currentFOV = Math.max(minFOV, currentFOV - (zoomStep * stepMultiplier));
    
    // Apply to camera
    window.camera.fov = currentFOV;
    window.camera.updateProjectionMatrix();
    
    console.log('Zoomed in: FOV = ' + currentFOV);
    showZoomNotification('Zoomed In');
  }
  
  // Helper function to zoom out
  function zoomOut(stepMultiplier = 1) {
    if (!window.camera) return;
    
    // Calculate new FOV with limit
    currentFOV = Math.min(maxFOV, currentFOV + (zoomStep * stepMultiplier));
    
    // Apply to camera
    window.camera.fov = currentFOV;
    window.camera.updateProjectionMatrix();
    
    console.log('Zoomed out: FOV = ' + currentFOV);
    showZoomNotification('Zoomed Out');
  }
})();