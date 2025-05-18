/**
 * Direct Keyboard Zoom Controls for Cockroach Run
 * 
 * This script adds direct keyboard zoom controls to the Cockroach Run game.
 * - Press F to zoom in
 * - Press G to zoom out
 */

(function() {
  console.log('Direct Keyboard Zoom Controls - Initializing');
  
  // Define our variables
  const defaultFOV = 75;  // Default camera FOV
  const minFOV = 45;      // Maximum zoom in (smaller FOV = more zoom)
  const maxFOV = 90;      // Maximum zoom out (larger FOV = less zoom)
  const zoomStep = 5;     // Amount to change per keypress
  
  // Store current FOV
  let currentFOV = defaultFOV;
  
  // Add keyboard event listener for F and G keys
  document.addEventListener('keydown', function(event) {
    // Get the game's camera
    const gameCamera = window.camera;
    
    // F key for zoom in
    if ((event.key === 'f' || event.key === 'F') && gameCamera) {
      currentFOV = Math.max(minFOV, currentFOV - zoomStep);
      gameCamera.fov = currentFOV;
      gameCamera.updateProjectionMatrix();
      console.log('Zoom in: FOV set to ' + currentFOV);
      
      // Try to show notification if the function exists
      if (typeof showZoomNotification === 'function') {
        showZoomNotification('Zoomed In');
      }
    }
    
    // G key for zoom out
    if ((event.key === 'g' || event.key === 'G') && gameCamera) {
      currentFOV = Math.min(maxFOV, currentFOV + zoomStep);
      gameCamera.fov = currentFOV;
      gameCamera.updateProjectionMatrix();
      console.log('Zoom out: FOV set to ' + currentFOV);
      
      // Try to show notification if the function exists
      if (typeof showZoomNotification === 'function') {
        showZoomNotification('Zoomed Out');
      }
    }
  });
  
  // We need to make the camera globally accessible
  // Wait for the game to initialize and setup
  const checkInterval = setInterval(function() {
    if (typeof camera !== 'undefined') {
      console.log('Game camera detected, making it globally accessible');
      window.camera = camera;
      
      // Initialize FOV tracking
      currentFOV = camera.fov;
      
      // Create a small notification
      const zoomInfo = document.createElement('div');
      zoomInfo.style.position = 'fixed';
      zoomInfo.style.bottom = '10px';
      zoomInfo.style.right = '10px';
      zoomInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      zoomInfo.style.color = 'rgb(0, 255, 102)';
      zoomInfo.style.padding = '5px 10px';
      zoomInfo.style.borderRadius = '3px';
      zoomInfo.style.fontFamily = 'Arial, sans-serif';
      zoomInfo.style.fontSize = '12px';
      zoomInfo.style.zIndex = '9998';
      zoomInfo.style.pointerEvents = 'none';
      zoomInfo.style.transition = 'opacity 1s';
      zoomInfo.style.opacity = '0.5';
      zoomInfo.textContent = 'Zoom: F/G';
      document.body.appendChild(zoomInfo);
      
      // Stop checking once we've set up zoom
      clearInterval(checkInterval);
    }
  }, 1000);
  
  console.log('Direct Keyboard Zoom Controls - Setup complete');
})();