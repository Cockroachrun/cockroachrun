// DIRECT FIX - Copy and paste this entire script into your browser console when the game is running

(function() {
  console.log("APPLYING DIRECT ZOOM FIX");
  
  // Direct fix for game instance - no message passing
  function fixZoom() {
    // Find the game instance
    if (!window.game || !window.game.activeGameMode) {
      console.error("Game not found or not initialized");
      return;
    }
    
    const gameMode = window.game.activeGameMode;
    console.log("Found game mode:", gameMode);
    
    // Ensure camera following is enabled
    gameMode.debugMode = false;
    
    // Fix zoom parameters
    gameMode.zoomLevel = 5;  // Default level
    gameMode.minZoom = 1.5;  // Minimum zoom
    gameMode.maxZoom = 15;   // Maximum zoom
    gameMode.zoomSpeed = 0.3; // Smoother speed
    
    // Define a proper updateCamera function
    gameMode.updateCamera = function() {
      // Skip if in debug mode
      if (this.debugMode) return;
      
      // Get target (cockroach model or placeholder)
      const target = this.cockroachModel ? this.cockroachModel.position.clone() : 
                    (this.placeholder ? this.placeholder.position.clone() : new THREE.Vector3(0, 0.5, 0));
      
      // Create camera offset based on zoom level
      const offset = new THREE.Vector3(0, this.cameraOffset.y, this.zoomLevel);
      
      // Apply rotation if model exists
      if (this.cockroachModel) {
        offset.applyQuaternion(this.cockroachModel.quaternion);
      }
      
      // Apply camera position with smooth transition
      const cameraPosition = target.clone().add(offset);
      this.camera.position.lerp(cameraPosition, 0.05);
      
      // Look at target
      const lookTarget = target.clone();
      lookTarget.y += 0.5; // Look slightly above cockroach
      this.camera.lookAt(lookTarget);
    };
    
    // Create a direct zoom handler
    const directZoomHandler = function(event) {
      event.preventDefault();
      
      const delta = event.deltaY > 0 ? 1 : -1;
      gameMode.zoomLevel += delta * gameMode.zoomSpeed;
      
      // Clamp zoom level
      gameMode.zoomLevel = Math.max(gameMode.minZoom, Math.min(gameMode.maxZoom, gameMode.zoomLevel));
      
      console.log("Zoom level:", gameMode.zoomLevel);
      return false;
    };
    
    // Attach the wheel event directly to document
    document.addEventListener('wheel', directZoomHandler, { passive: false });
    
    // Fix zoom buttons
    const fixZoomButtons = function() {
      const zoomInButton = document.getElementById('zoom-in');
      const zoomOutButton = document.getElementById('zoom-out');
      
      if (zoomInButton) {
        zoomInButton.onclick = function() {
          gameMode.zoomLevel -= gameMode.zoomSpeed * 2;
          gameMode.zoomLevel = Math.max(gameMode.minZoom, Math.min(gameMode.maxZoom, gameMode.zoomLevel));
          console.log("Zoom in clicked, level:", gameMode.zoomLevel);
        };
      }
      
      if (zoomOutButton) {
        zoomOutButton.onclick = function() {
          gameMode.zoomLevel += gameMode.zoomSpeed * 2;
          gameMode.zoomLevel = Math.max(gameMode.minZoom, Math.min(gameMode.maxZoom, gameMode.zoomLevel));
          console.log("Zoom out clicked, level:", gameMode.zoomLevel);
        };
      }
    };
    
    fixZoomButtons();
    
    console.log("ZOOM FIX APPLIED SUCCESSFULLY");
    alert("Zoom functionality fixed! You can now use your mouse wheel to zoom in and out.");
  }
  
  // Try to fix the game immediately
  fixZoom();
  
  // If that didn't work, wait for the game to initialize
  if (!window.game || !window.game.activeGameMode) {
    console.log("Game not yet initialized, waiting...");
    
    const interval = setInterval(() => {
      if (window.game && window.game.activeGameMode) {
        console.log("Game initialized, applying fix");
        fixZoom();
        clearInterval(interval);
      }
    }, 1000);
  }
})();
