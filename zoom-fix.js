// IMPROVED Zoom functionality fix for Cockroach Run game
// This script handles mouse wheel zoom with enhanced reliability

// Wait for document to be fully loaded before running
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, waiting for game to initialize...');
  
  // Try to use the existing camera directly
  const checkInterval = setInterval(function() {
    if (window.game && window.game.camera) {
      console.log('Camera found, applying zoom fix...');
      setupDirectZoom(window.game.camera);
      clearInterval(checkInterval);
    } else {
      console.log('Still looking for camera...');
    }
  }, 1000);
  
  function setupDirectZoom(camera) {
    // Set up zoom properties
    const defaultFOV = 75;
    const minFOV = 45;
    const maxFOV = 90;
    const zoomStep = 5;
    let currentFOV = camera.fov || defaultFOV;
    
    // Add wheel event for zooming
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('wheel', function(event) {
        // Prevent the default scroll
        event.preventDefault();
        
        // Calculate zoom delta (reversed, as negative deltaY means scroll up/zoom in)
        const delta = event.deltaY > 0 ? -1 : 1;
        
        // Update FOV based on wheel direction
        if (delta > 0) {
          // Zoom in
          currentFOV = Math.max(minFOV, currentFOV - zoomStep * 0.2);
        } else {
          // Zoom out
          currentFOV = Math.min(maxFOV, currentFOV + zoomStep * 0.2);
        }
        
        // Apply the new FOV
        camera.fov = currentFOV;
        camera.updateProjectionMatrix();
        
        console.log(`Zoomed with wheel: FOV = ${currentFOV}`);
        
        // Show notification if the function exists
        if (typeof showZoomNotification === 'function') {
          showZoomNotification(delta > 0 ? 'Zoomed In' : 'Zoomed Out');
        }
        
        return false;
      }, { passive: false });
      
      console.log('Mouse wheel zoom controls enabled');
      
      // Create and add zoom buttons
      createZoomButtons(gameContainer, camera, minFOV, maxFOV, zoomStep);
    }
  }
  
  function createZoomButtons(container, camera, minFOV, maxFOV, zoomStep) {
    // Create zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerText = '+';
    zoomInBtn.className = 'zoom-button zoom-in';
    zoomInBtn.style.cssText = 'position: absolute; right: 20px; bottom: 60px; width: 30px; height: 30px; background: #000; color: #ff6600; border: 1px solid #ff6600; z-index: 1000;';
    
    // Create zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerText = '-';
    zoomOutBtn.className = 'zoom-button zoom-out';
    zoomOutBtn.style.cssText = 'position: absolute; right: 20px; bottom: 20px; width: 30px; height: 30px; background: #000; color: #ff6600; border: 1px solid #ff6600; z-index: 1000;';
    
    // Add click handlers
    zoomInBtn.addEventListener('click', function() {
      camera.fov = Math.max(minFOV, camera.fov - zoomStep);
      camera.updateProjectionMatrix();
      console.log(`Zoomed in with button: FOV = ${camera.fov}`);
    });
    
    zoomOutBtn.addEventListener('click', function() {
      camera.fov = Math.min(maxFOV, camera.fov + zoomStep);
      camera.updateProjectionMatrix();
      console.log(`Zoomed out with button: FOV = ${camera.fov}`);
    });
    
    // Add buttons to container
    container.appendChild(zoomInBtn);
    container.appendChild(zoomOutBtn);
    
    console.log('Zoom buttons added');
  }
});

